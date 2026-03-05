// file: src/app/(shop)/pedido/[publicId]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { TrackEvent } from "@/components/shop/TrackEvent";
import { orderStatusLabel } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };
const pick = (sp: SP, key: string) => (Array.isArray(sp[key]) ? sp[key]?.[0] : sp[key]) ?? "";

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<SP>;
}) {
  const { publicId } = await params;
  const sp = await searchParams;

  const paymentId = pick(sp, "payment_id");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // 1) busca pedido
  let order = await prisma.order.findUnique({
    where: { publicId },
    include: { items: true },
  });
  if (!order) return notFound();

  // 2) fallback de confirmação se veio payment_id e ainda não está PAID
  if (paymentId && order.status !== "PAID") {
    await fetch(`${appUrl}/api/checkout/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({ publicId, paymentId }),
    }).catch(() => null);

    order = await prisma.order.findUnique({
      where: { publicId },
      include: { items: true },
    });
    if (!order) return notFound();
  }

  const isPaid = order.status === "PAID";
  const statusLabel = orderStatusLabel(order.status);

  return (
    <div className="container py-10">
      <div className="card p-8">
        <div className="badge">Pedido</div>
        <h1 className="mt-3 text-2xl font-semibold">{order.publicId}</h1>
        {isPaid && <TrackEvent event="Purchase" payload={{ value: order.totalCents / 100, currency: "BRL" }} />}
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Status: <span className="font-medium text-[hsl(var(--fg))]">{statusLabel}</span>
        </p>

        <div className="mt-6 grid gap-2 text-sm">
          <div><span className="text-[hsl(var(--muted))]">Cliente:</span> {order.customerName}</div>
          <div><span className="text-[hsl(var(--muted))]">E-mail:</span> {order.customerEmail}</div>
          <div><span className="text-[hsl(var(--muted))]">Entrega:</span> {order.shippingServiceName || order.shippingMethod}</div>
          <div><span className="text-[hsl(var(--muted))]">Frete:</span> {formatBRL(order.shippingCostCents)}</div>
        </div>

        <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-sm font-semibold">Itens</div>
          <div className="mt-3 space-y-2">
            {order.items.map((it) => (
              <div key={it.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">{it.productName}</div>
                  <div className="text-xs text-[hsl(var(--muted))]">
                    {it.variantLabel ? `${it.variantLabel} • ` : ""}SKU: {it.sku} • Qtd: {it.qty}
                  </div>
                </div>
                <div className="text-sm font-semibold">{formatBRL(it.lineTotalCents)}</div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-[hsl(var(--border))] pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted))]">Subtotal</span>
              <span className="font-medium">{formatBRL(order.subtotalCents)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[hsl(var(--muted))]">Frete</span>
              <span className="font-medium">{formatBRL(order.shippingCostCents)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatBRL(order.totalCents)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/produtos" className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm">
            Voltar aos produtos
          </Link>
          <Link href="/contato" className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white">
            Falar no WhatsApp
          </Link>
        </div>

        {!isPaid && (
          <div className="mt-6 text-xs text-[hsl(var(--muted))]">
            Se você acabou de pagar, pode levar alguns segundos pra confirmar. Recarregue esta página.
          </div>
        )}
      </div>
    </div>
  );
}
