import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";
import { formatBRL } from "@/lib/money";
import { CartSummary } from "@/components/shop/CartSummary";
import { CartQtyControls, RemoveItem } from "@/components/shop/CartItemControls";

export const dynamic = "force-dynamic";

export default async function CartPage() {
  const cart = await getCart();
  const ids = cart.items.map((i) => i.variantId);

  const variants = ids.length
    ? await prisma.variant.findMany({
        where: { id: { in: ids } },
        include: { product: { include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } } } },
      })
    : [];

  const map = new Map(variants.map((v) => [v.id, v]));
  const lines = cart.items
    .map((ci) => {
      const v = map.get(ci.variantId);
      if (!v) return null;
      const line = v.priceCents * ci.qty;
      return { ci, v, line };
    })
    .filter(Boolean) as Array<any>;

  const subtotal = lines.reduce((acc, l) => acc + l.line, 0);

  return (
    <div className="container py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Carrinho</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted))]">Revise seus itens antes de finalizar.</p>
        </div>
        <Link href="/produtos" className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
          Continuar comprando →
        </Link>
      </div>

      {lines.length === 0 ? (
        <div className="mt-8 card p-8">
          <div className="text-sm text-[hsl(var(--muted))]">Seu carrinho está vazio.</div>
          <Link className="mt-4 inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white" href="/produtos">
            Ver produtos
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            {lines.map(({ ci, v, line }) => (
              <div key={v.id} className="card p-4">
                <div className="flex gap-4">
                  <div className="relative h-20 w-28 overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
                    {v.product.images[0]?.url ? (
                      <Image src={v.product.images[0].url} alt={v.product.name} fill className="object-cover" sizes="120px" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="text-sm font-semibold">{v.product.name}</div>
                    <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                      SKU: {v.sku}
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="text-[hsl(var(--muted))]">Unitário:</span> {formatBRL(v.priceCents)}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <form action="/api/cart/update" method="post" className="flex items-center gap-2">
                        <input type="hidden" name="variantId" value={v.id} />
                      </form>

                      <CartQtyControls variantId={v.id} qty={ci.qty} />

                      <RemoveItem variantId={v.id} />
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-[hsl(var(--muted))]">Total</div>
                    <div className="text-base font-semibold">{formatBRL(line)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <CartSummary subtotalCents={subtotal} />
        </div>
      )}
    </div>
  );
}

