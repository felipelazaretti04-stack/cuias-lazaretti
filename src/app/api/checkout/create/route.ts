import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCart, clearCart } from "@/lib/cart";
import { makePublicOrderId } from "@/lib/order";
import { quoteShipping } from "@/lib/shipping";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { safeLogError } from "@/lib/idempotency";
import { validateCoupon, computeDiscountCents } from "@/lib/coupons";

const schema = z.object({
  customer: z.object({
    couponCode: z.string().optional().nullable(),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().min(6).max(30),
  }),
  couponCode: z.string().optional().nullable(),
  shipping: z.object({
    method: z.enum(["PICKUP", "PAC"]),
    cep: z.string().optional(),
    address: z.record(z.string(), z.any()),
    option: z.object({
      method: z.enum(["PICKUP", "PAC"]),
      provider: z.enum(["MELHORENVIO", "FALLBACK"]),
      serviceName: z.string(),
      priceCents: z.number().int().min(0),
      deliveryDays: z.number().int().optional(),
      debugMessage: z.string().optional(),
    }),
  }),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const cart = await getCart();
  if (cart.items.length === 0) return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });

  // carrega variantes e valida estoque
  const variantIds = cart.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    include: { product: true },
  });

  const map = new Map(variants.map((v) => [v.id, v]));
  for (const ci of cart.items) {
    const v = map.get(ci.variantId);
    if (!v || !v.isActive || !v.product.isActive) return NextResponse.json({ error: "Item indisponível" }, { status: 400 });
    if (v.stock < ci.qty) return NextResponse.json({ error: `Estoque insuficiente: ${v.product.name} (${v.sku})` }, { status: 400 });
  }

  const method = parsed.data.shipping.method;

  // valida endereço conforme método
  if (method === "PAC") {
    const cep = (parsed.data.shipping.cep || "").replace(/\D/g, "");
    if (cep.length !== 8) return NextResponse.json({ error: "CEP inválido" }, { status: 400 });

    const addr = parsed.data.shipping.address as any;
    const required = ["addressLine", "number", "district", "city", "uf", "cep"];
    for (const k of required) {
      if (!String(addr?.[k] || "").trim()) return NextResponse.json({ error: `Endereço inválido: ${k}` }, { status: 400 });
    }
  } else {
    const addr = parsed.data.shipping.address as any;
    if (!String(addr?.city || "").trim() || !String(addr?.uf || "").trim()) {
      return NextResponse.json({ error: "Para retirada, informe Cidade e UF" }, { status: 400 });
    }
  }

  // re-cota servidor-side
  const options = await quoteShipping({ method, cep: parsed.data.shipping.cep });
  const selected = options[0];
  const clientOpt = parsed.data.shipping.option;

  if (!selected || selected.method !== clientOpt.method) {
    return NextResponse.json({ error: "Opção de frete inválida" }, { status: 400 });
  }

  const publicId = makePublicOrderId();

  // upsert customer por email
  const customer = await prisma.customer.upsert({
    where: { email: parsed.data.customer.email },
    update: {
      name: parsed.data.customer.name,
      phone: parsed.data.customer.phone,
    },
    create: {
      email: parsed.data.customer.email,
      name: parsed.data.customer.name,
      phone: parsed.data.customer.phone,
    },
  });

  // cria pedido + itens
  const order = await prisma.order.create({
    data: {
      publicId,
      status: "PENDING",
      customerId: customer.id,
      customerName: parsed.data.customer.name,
      customerEmail: parsed.data.customer.email,
      customerPhone: parsed.data.customer.phone,

      shippingMethod: method,
      shippingProvider: selected.provider,
      shippingServiceName: selected.serviceName,
      shippingDebugMessage: selected.provider === "FALLBACK" ? selected.debugMessage ?? null : null,
      shippingAddressJson: parsed.data.shipping.address as any,
      shippingCostCents: selected.priceCents,

      paymentProvider: "MERCADOPAGO",
      paymentStatus: "PENDING",

      items: {
        create: cart.items.map((ci) => {
          const v = map.get(ci.variantId)!;
          const label = [v.size, v.finish, v.color, v.personalization].filter(Boolean).join(" • ") || null;
          return {
            variantId: v.id,
            productName: v.product.name,
            variantLabel: label,
            sku: v.sku,
            unitPriceCents: v.priceCents,
            qty: ci.qty,
            lineTotalCents: v.priceCents * ci.qty,
          };
        }),
      },
    },
  });

  // === CÁLCULO DE TOTAIS COM CUPOM ===
  const orderItems = await prisma.orderItem.findMany({ where: { orderId: order.id } });
  const subtotalCents = orderItems.reduce((acc, it) => acc + it.lineTotalCents, 0);

  let discountCents = 0;
  let couponCode: string | null = null;

  if (parsed.data.couponCode) {
    const v = await validateCoupon(parsed.data.couponCode);
    if (v.ok) {
      couponCode = v.coupon.code;
      discountCents = computeDiscountCents({
        subtotalCents,
        type: v.coupon.type,
        value: v.coupon.value,
      });
    }
  }

  const totalCents = Math.max(0, subtotalCents + selected.priceCents - discountCents);

  await prisma.order.update({
    where: { id: order.id },
    data: {
      subtotalCents,
      discountCents,
      couponCode,
      totalCents,
    },
  });

  // === CRIAR PREFERENCE MERCADO PAGO COM RATEIO ===
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // rateio de desconto no subtotal para MP
    const originalSubtotal = orderItems.reduce((acc, it) => acc + it.lineTotalCents, 0);
    const discountedSubtotal = Math.max(0, originalSubtotal - discountCents);

    const mpItems = orderItems.map((it) => ({
      title: `${it.productName}${it.variantLabel ? ` (${it.variantLabel})` : ""}`,
      quantity: it.qty,
      unit_price: Number((it.unitPriceCents / 100).toFixed(2)),
    }));

    // aplica rateio se houver desconto
    if (originalSubtotal > 0 && discountCents > 0) {
      let running = 0;
      for (let i = 0; i < orderItems.length; i++) {
        const it = orderItems[i];
        const share = i === orderItems.length - 1
          ? (discountedSubtotal - running)
          : Math.floor((it.lineTotalCents / originalSubtotal) * discountedSubtotal);

        running += share;
        const unit = Math.floor(share / it.qty);
        const unitCents = Math.max(1, unit);

        mpItems[i].unit_price = Number((unitCents / 100).toFixed(2));
      }
    }

    // adiciona frete como item se > 0
    if (selected.priceCents > 0) {
      mpItems.push({
        title: `Frete (${selected.serviceName})`,
        quantity: 1,
        unit_price: Number((selected.priceCents / 100).toFixed(2)),
      });
    }

    const pref = await createMercadoPagoPreference({
      orderPublicId: order.publicId,
      items: mpItems,
      payer: { name: parsed.data.customer.name, email: parsed.data.customer.email },
      backUrls: {
        success: `${appUrl}/checkout/retorno`,
        pending: `${appUrl}/checkout/retorno`,
        failure: `${appUrl}/checkout/retorno`,
      },
      notificationUrl: `${appUrl}/api/webhooks/mercadopago`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: pref.id },
    });

    // limpa carrinho
    await clearCart();

    const initPoint = pref.init_point || pref.sandbox_init_point;
    if (!initPoint) throw new Error("init_point ausente");

    return NextResponse.json({ ok: true, initPoint, orderPublicId: order.publicId });
  } catch (e: any) {
    safeLogError("Erro criando preference Mercado Pago", { message: e?.message });
    return NextResponse.json({ error: "Falha ao iniciar pagamento" }, { status: 500 });
  }
}
