import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchMercadoPagoPayment } from "@/lib/mercadopago";
import { safeLogError } from "@/lib/idempotency";

/**
 * Mercado Pago manda diferentes formatos.
 * Em geral: ?type=payment&data.id=123 ou body { type, data: { id } }
 */
export async function POST(req: Request) {
  const url = new URL(req.url);
  const typeQ = url.searchParams.get("type") || undefined;
  const dataIdQ = url.searchParams.get("data.id") || undefined;

  const body = await req.json().catch(() => ({} as any));
  const type = typeQ || body?.type || body?.topic || "unknown";
  const paymentId = String(dataIdQ || body?.data?.id || body?.id || "").trim();

  if (!paymentId) {
    // MP às vezes envia ping sem id; aceitamos 200 pra não ficar re-tentando sem necessidade
    return NextResponse.json({ ok: true });
  }

  // 1) idempotência por paymentId (não duplica eventos)
  try {
    await prisma.paymentEvent.create({
      data: {
        provider: "MERCADOPAGO",
        externalId: paymentId,
        type: String(type),
        rawJson: body as any,
      },
    });
  } catch {
    // já recebemos esse paymentId -> idempotente
    return NextResponse.json({ ok: true });
  }

  // 2) busca status real do pagamento no MP
  let payment: any;
  try {
    payment = await fetchMercadoPagoPayment(paymentId);
  } catch (e: any) {
    safeLogError("Falha ao buscar pagamento no MP", { message: e?.message, paymentId });
    return NextResponse.json({ ok: true }); // responde 200 pra MP (evita loop), mas loga
  }

  const status = String(payment?.status || "unknown").toLowerCase(); // approved, pending, rejected...
  const externalRef = String(payment?.external_reference || "").trim(); // nosso order.publicId
  const prefId = String(payment?.order?.id || payment?.preference_id || "").trim();

  // tenta achar order pelo external_reference (preferível) ou mpPreferenceId
  const order = externalRef
    ? await prisma.order.findUnique({ where: { publicId: externalRef }, include: { items: true } })
    : prefId
      ? await prisma.order.findFirst({ where: { mpPreferenceId: prefId }, include: { items: true } })
      : null;

  // vincula evento ao pedido se achou
  if (order) {
    await prisma.paymentEvent.updateMany({
      where: { provider: "MERCADOPAGO", externalId: paymentId, orderId: null },
      data: { orderId: order.id },
    });
  }

  if (!order) {
    safeLogError("Webhook MP: pedido não encontrado", { paymentId, externalRef, prefId });
    return NextResponse.json({ ok: true });
  }

  // se já pago, idempotente: retornar 200 e não repetir baixa de estoque
  if (order.status === "PAID") {
    return NextResponse.json({ ok: true });
  }

  // mapeia status MP -> nosso PaymentStatus / OrderStatus
  const isApproved = status === "approved";
  const isCancelled = status === "cancelled";
  const isRejected = status === "rejected";
  const isRefunded = status === "refunded" || status === "charged_back";

  if (!isApproved) {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: isCancelled ? "CANCELLED" : isRejected ? "REJECTED" : isRefunded ? "REFUNDED" : "PENDING",
        mpPaymentId: paymentId,
      },
    });
    return NextResponse.json({ ok: true });
  }

  // 3) aprovado -> transação com baixa de estoque idempotente
  try {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.order.findUnique({
        where: { id: order.id },
        include: { items: true },
      });
      if (!fresh) return;

      if (fresh.status === "PAID") return; // idempotente no nível transacional
      if (fresh.stockReservedAt) {
        // já baixou estoque antes, mas status não está PAID (cenário raro) -> normaliza
        await tx.order.update({
          where: { id: fresh.id },
          data: {
            status: "PAID",
            paymentStatus: "APPROVED",
            mpPaymentId: paymentId,
            paidAt: new Date(),
          },
        });
        return;
      }

      // baixa estoque por item
      for (const it of fresh.items) {
        // atomic update garantindo estoque >= qty
        const updated = await tx.variant.updateMany({
          where: { id: it.variantId, stock: { gte: it.qty } },
          data: { stock: { decrement: it.qty } },
        });

        if (updated.count !== 1) {
          throw new Error(`Estoque insuficiente no pagamento (variantId=${it.variantId})`);
        }
      }

      await tx.order.update({
        where: { id: fresh.id },
        data: {
          status: "PAID",
          paymentStatus: "APPROVED",
          mpPaymentId: paymentId,
          paidAt: new Date(),
          stockReservedAt: new Date(),
        },
      });
    });
  } catch (e: any) {
    // não vazar dados sensíveis
    safeLogError("Webhook MP: falha ao dar baixa no estoque", { message: e?.message, paymentId, orderPublicId: order.publicId });
    // respondemos 200 para evitar retries infinitos; vamos resolver manualmente no admin (fase 2)
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
