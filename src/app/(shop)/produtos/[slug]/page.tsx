import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ priceCents: "asc" }] },
      category: true,
    },
  });

  if (!product || !product.isActive) return notFound();

  const first = product.variants[0];
  const hasPromo = !!first?.compareAtCents && (first.compareAtCents ?? 0) > first.priceCents;

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-[hsl(var(--accent))]">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 p-3">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white">
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="badge">{product.category?.name ?? "Produto"}</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{product.name}</h1>

          {first ? (
            <div className="mt-4">
              <div className="flex items-baseline gap-3">
                <div className="text-2xl font-semibold">{formatBRL(first.priceCents)}</div>
                {hasPromo ? (
                  <div className="text-sm text-[hsl(var(--muted))] line-through">
                    {formatBRL(first.compareAtCents!)}
                  </div>
                ) : null}
              </div>
              <div className="mt-2 text-sm text-[hsl(var(--muted))]">
                Estoque: <span className="font-medium text-[hsl(var(--fg))]">{first.stock}</span>
                {product.isPersonalized ? (
                  <>
                    {" "}• Prazo de produção:{" "}
                    <span className="font-medium text-[hsl(var(--fg))]">{product.productionDays} dias</span>
                  </>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-[hsl(var(--muted))]">Sem variantes ativas.</div>
          )}

          <div className="mt-6 card p-4">
            <div className="text-sm font-semibold">Variações (MVP)</div>
            <p className="mt-1 text-sm text-[hsl(var(--muted))]">
              No Bloco B a gente conecta isso ao carrinho/checkout.
            </p>

            <div className="mt-3 grid gap-2">
              {product.variants.map((v) => (
                <div key={v.id} className="flex items-center justify-between rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
                  <div className="text-sm">
                    <div className="font-medium">
                      {[v.size, v.finish, v.color, v.personalization].filter(Boolean).join(" • ") || "Padrão"}
                    </div>
                    <div className="text-xs text-[hsl(var(--muted))]">SKU: {v.sku}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold">{formatBRL(v.priceCents)}</div>
                    <div className="text-xs text-[hsl(var(--muted))]">Estoque: {v.stock}</div>
                  </div>
                </div>
              ))}
            </div>

            <button
              disabled
              className="mt-4 w-full rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white opacity-60"
              title="Carrinho entra no Bloco B"
            >
              Comprar (Bloco B)
            </button>
          </div>

          {product.description ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Descrição</div>
              <p className="mt-2 text-sm text-[hsl(var(--muted))] whitespace-pre-line">{product.description}</p>
            </div>
          ) : null}

          {product.care ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Cuidados</div>
              <p className="mt-2 text-sm text-[hsl(var(--muted))] whitespace-pre-line">{product.care}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
