// file: src/app/api/checkout/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago";
import { safeLogError } from "@/lib/idempotency";

export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => ({}))) as { publicId?: string; paymentId?: string };
    const publicId = String(body?.publicId || "").trim();
    const paymentId = String(body?.paymentId || "").trim();

    if (!publicId || !paymentId) {
      return NextResponse.json({ ok: false, error: "publicId e paymentId são obrigatórios" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { publicId }, include: { items: true } });
    if (!order) return NextResponse.json({ ok: false, error: "Pedido não encontrado" }, { status: 404 });
    if (order.status === "PAID") return NextResponse.json({ ok: true, status: "already_paid" });

    const payment: any = await fetchMercadoPagoPayment(paymentId);
    const mpStatus = String(payment?.status || "unknown").toLowerCase();
    const externalRef = String(payment?.external_reference || "").trim();

    if (externalRef && externalRef !== publicId) {
      return NextResponse.json({ ok: false, error: "Pagamento não corresponde ao pedido" }, { status: 400 });
    }

    const isApproved = mpStatus === "approved";
    const isCancelled = mpStatus === "cancelled";
    const isRejected = mpStatus === "rejected";
    const isRefunded = mpStatus === "refunded" || mpStatus === "charged_back";

    if (!isApproved) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: isCancelled ? "CANCELLED" : isRejected ? "REJECTED" : isRefunded ? "REFUNDED" : "PENDING",
          mpPaymentId: paymentId,
        },
      });
      return NextResponse.json({ ok: true, status: mpStatus });
    }

    await prisma.$transaction(async (tx) => {
      const fresh = await tx.order.findUnique({ where: { id: order.id }, include: { items: true } });
      if (!fresh) return;
      if (fresh.status === "PAID") return;

      if (!fresh.stockReservedAt) {
        for (const it of fresh.items) {
          const updated = await tx.variant.updateMany({
            where: { id: it.variantId, stock: { gte: it.qty } },
            data: { stock: { decrement: it.qty } },
          });
          if (updated.count !== 1) throw new Error(`Estoque insuficiente (variantId=${it.variantId})`);
        }
      }

      await tx.order.update({
        where: { id: fresh.id },
        data: {
          status: "PAID",
          paymentStatus: "APPROVED",
          mpPaymentId: paymentId,
          paidAt: new Date(),
          stockReservedAt: fresh.stockReservedAt ?? new Date(),
        },
      });
    });

    return NextResponse.json({ ok: true, status: "approved" });
  } catch (e: any) {
    safeLogError("Checkout confirm falhou", { message: e?.message });
    return NextResponse.json({ ok: true });
  }
}
