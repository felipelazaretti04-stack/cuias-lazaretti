import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago";

type Ctx = { params: Promise<{ publicId: string }> };

export async function POST(_req: Request, ctx: Ctx) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { publicId } = await ctx.params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    include: { items: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  if (!order.mpPaymentId && !order.mpPreferenceId) {
    return NextResponse.json({ error: "Pedido sem vínculo MP" }, { status: 400 });
  }

  let payment: any = null;
  if (order.mpPaymentId) {
    payment = await fetchMercadoPagoPayment(order.mpPaymentId).catch(() => null);
  }

  if (!payment) {
    return NextResponse.json(
      { error: "Pagamento não vinculado. Aguarde webhook ou use fallback de retorno." },
      { status: 400 }
    );
  }

  const status = String(payment?.status || "").toLowerCase();

  if (status !== "approved") {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus:
          status === "cancelled" ? "CANCELLED" :
          status === "rejected" ? "REJECTED" :
          (status === "refunded" || status === "charged_back") ? "REFUNDED" : "PENDING",
      },
    });
    return NextResponse.json({ ok: true, paid: false, status });
  }

  // Aprovado → transação com baixa de estoque
  await prisma.$transaction(async (tx) => {
    const fresh = await tx.order.findUnique({
      where: { id: order.id },
      include: { items: true },
    });
    if (!fresh || fresh.status === "PAID") return;

    if (!fresh.stockReservedAt) {
      for (const it of fresh.items) {
        const updated = await tx.variant.updateMany({
          where: { id: it.variantId, stock: { gte: it.qty } },
          data: { stock: { decrement: it.qty } },
        });
        if (updated.count !== 1) {
          throw new Error(`Estoque insuficiente (variantId=${it.variantId})`);
        }
      }
    }

    await tx.order.update({
      where: { id: fresh.id },
      data: {
        status: "PAID",
        paymentStatus: "APPROVED",
        paidAt: new Date(),
        stockReservedAt: fresh.stockReservedAt ?? new Date(),
      },
    });
  });

  return NextResponse.json({ ok: true, paid: true, status: "approved" });
}
