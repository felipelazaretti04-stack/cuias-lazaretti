import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCart, clearCart } from "@/lib/cart";
import { makePublicOrderId, computeOrderTotals } from "@/lib/order";
import { quoteShipping } from "@/lib/shipping";
import { createMercadoPagoPreference } from "@/lib/mercadopago";
import { safeLogError } from "@/lib/idempotency";

const schema = z.object({
  customer: z.object({
    couponCode: z.string().optional().nullable(),
    name: z.string().min(2).max(120),
    email: z.string().email(),
    phone: z.string().min(6).max(30),
  }),
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

  // valida endereço conforme método (regra crítica)
  if (method === "PAC") {
  const cep = (parsed.data.shipping.cep || "").replace(/\D/g, "");
  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  const addr = parsed.data.shipping.address as any;
  const required = ["addressLine", "number", "district", "city", "uf", "cep"];

  for (const k of required) {
    if (!String(addr?.[k] || "").trim()) {
      return NextResponse.json({ error: `Endereço inválido: ${k}` }, { status: 400 });
    }
  }
} else {
  // PICKUP - define endereço fixo automaticamente
  parsed.data.shipping.address = {
    city: "Erechim",
    uf: "RS",
    note: parsed.data.shipping.address?.note ?? null,
  };
}

  // re-cota servidor-side (não confiar 100% no client)
  const options = await quoteShipping({ method, cep: parsed.data.shipping.cep });
  const selected = options[0]; // MVP: 1 opção
  const clientOpt = parsed.data.shipping.option;

  // se método divergir, aborta
  if (!selected || selected.method !== clientOpt.method) {
    return NextResponse.json({ error: "Opção de frete inválida" }, { status: 400 });
  }

  const publicId = makePublicOrderId();

// 🔥 UPSERT CUSTOMER (NOVO BLOCO)
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
      customerId: customer.id, // 🔥 NOVO
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

  await computeOrderTotals(order.id);

  // cria preference Mercado Pago
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const pref = await createMercadoPagoPreference({
      orderPublicId: order.publicId,
      items: (await prisma.orderItem.findMany({ where: { orderId: order.id } })).map((it) => ({
        title: `${it.productName}${it.variantLabel ? ` (${it.variantLabel})` : ""}`,
        quantity: it.qty,
        unit_price: Number((it.unitPriceCents / 100).toFixed(2)),
      })),
      payer: { name: parsed.data.customer.name, email: parsed.data.customer.email },
      backUrls: {
        success: `${appUrl}/pedido/${order.publicId}`,
        pending: `${appUrl}/pedido/${order.publicId}`,
        failure: `${appUrl}/pedido/${order.publicId}`,
      },
      notificationUrl: `${appUrl}/api/webhooks/mercadopago`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { mpPreferenceId: pref.id },
    });

    // limpa carrinho (cliente já foi pro fluxo de pagamento)
    await clearCart();

    const initPoint = pref.init_point || pref.sandbox_init_point;
    if (!initPoint) throw new Error("init_point ausente");

    return NextResponse.json({ ok: true, initPoint, orderPublicId: order.publicId });
  } catch (e: any) {
    safeLogError("Erro criando preference Mercado Pago", { message: e?.message });
    return NextResponse.json({ error: "Falha ao iniciar pagamento" }, { status: 500 });
  }
}
