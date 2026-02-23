import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";

export const dynamic = "force-dynamic";

export default async function PedidoPage({ params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  const order = await prisma.order.findUnique({
    where: { publicId },
    include: { items: true },
  });

  if (!order) return notFound();

  const statusLabel =
    order.status === "PAID" ? "Pago" :
    order.status === "SHIPPED" ? "Enviado" :
    order.status === "CANCELLED" ? "Cancelado" : "Pendente";

  return (
    <div className="container py-10">
      <div className="card p-8">
        <div className="badge">Pedido</div>
        <h1 className="mt-3 text-2xl font-semibold">{order.publicId}</h1>
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

        {order.status !== "PAID" ? (
          <div className="mt-6 text-xs text-[hsl(var(--muted))]">
            Se você acabou de pagar, pode levar alguns segundos pra confirmar. Recarregue esta página.
          </div>
        ) : null}
      </div>
    </div>
  );
}
