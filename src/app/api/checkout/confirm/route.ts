// file: src/app/api/checkout/confirm/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago";
import { safeLogError } from "@/lib/idempotency";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const paymentId = String(
      body?.paymentId ||
      body?.collection_id ||
      body?.collectionId ||
      ""
    ).trim();

    const externalReference = String(
      body?.external_reference ||
      body?.externalReference ||
      ""
    ).trim();

    if (!paymentId && !externalReference) {
      return NextResponse.json(
        { error: "paymentId ou external_reference é obrigatório" },
        { status: 400 }
      );
    }

    let order = externalReference
      ? await prisma.order.findUnique({
          where: { publicId: externalReference },
          include: { items: true },
        })
      : null;

    if (!order && paymentId) {
      order = await prisma.order.findFirst({
        where: { mpPaymentId: paymentId },
        include: { items: true },
      });
    }

    const payment = paymentId ? await fetchMercadoPagoPayment(paymentId) : null;
    const mpStatus = String(payment?.status || "").toLowerCase();
    const paymentExternalRef = String(payment?.external_reference || "").trim();

    if (!order && paymentExternalRef) {
      order = await prisma.order.findUnique({
        where: { publicId: paymentExternalRef },
        include: { items: true },
      });
    }

    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    }

    if (!payment) {
      return NextResponse.json({
        ok: true,
        paid: false,
        status: order.paymentStatus,
        orderPublicId: order.publicId,
      });
    }

    const isApproved = mpStatus === "approved";
    const isCancelled = mpStatus === "cancelled";
    const isRejected = mpStatus === "rejected";
    const isRefunded = mpStatus === "refunded" || mpStatus === "charged_back";

    if (!isApproved) {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          mpPaymentId: paymentId || order.mpPaymentId,
          paymentStatus: isCancelled
            ? "CANCELLED"
            : isRejected
              ? "REJECTED"
              : isRefunded
                ? "REFUNDED"
                : "PENDING",
        },
      });

      return NextResponse.json({
        ok: true,
        paid: false,
        status: mpStatus || "pending",
        orderPublicId: order.publicId,
      });
    }

    await prisma.$transaction(async (tx) => {
      const fresh = await tx.order.findUnique({
        where: { id: order!.id },
        include: { items: true },
      });

      if (!fresh) return;

      if (fresh.status !== "PAID" && !fresh.stockReservedAt) {
        for (const it of fresh.items) {
          const updated = await tx.variant.updateMany({
            where: { id: it.variantId, stock: { gte: it.qty } },
            data: { stock: { decrement: it.qty } },
          });

          if (updated.count !== 1) {
            throw new Error(`Estoque insuficiente no pagamento (variantId=${it.variantId})`);
          }
        }
      }

      await tx.order.update({
        where: { id: fresh.id },
        data: {
          status: "PAID",
          paymentStatus: "APPROVED",
          paidAt: fresh.paidAt ?? new Date(),
          stockReservedAt: fresh.stockReservedAt ?? new Date(),
          mpPaymentId: paymentId || fresh.mpPaymentId,
        },
      });
    });

    return NextResponse.json({
      ok: true,
      paid: true,
      status: "approved",
      orderPublicId: order.publicId,
    });
  } catch (e: any) {
    safeLogError("Falha ao confirmar checkout MP", { message: e?.message });
    return NextResponse.json(
      { error: "Falha ao confirmar pagamento" },
      { status: 500 }
    );
  }
}
