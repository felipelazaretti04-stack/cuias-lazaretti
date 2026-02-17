import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function HomePage() {
  const featured = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
    },
  });

  const newest = await prisma.product.findMany({
    where: { isActive: true, isNew: true },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="container py-10">
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="badge">Artesanal premium • Sul do Brasil</div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
                A cuia certa pro teu mate.
              </h1>
              <p className="mt-3 text-sm text-[hsl(var(--muted))]">
                Acabamento premium, opções personalizadas e envio para todo o Brasil — direto de Erechim/RS.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/produtos"
                  className="inline-flex items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
                >
                  Comprar agora
                </Link>
                <Link
                  href="/sobre"
                  className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-5 py-2.5 text-sm font-medium hover:bg-[hsl(var(--accent))]"
                >
                  Conhecer a marca
                </Link>
              </div>

              <div className="mt-6 grid gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--gold))]" />
                  <span>Acabamento premium</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--gold))]" />
                  <span>Personalização sob medida</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--gold))]" />
                  <span>Envio Brasil + retirada em Erechim</span>
                </div>
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
              <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--primary))]/10 via-transparent to-[hsl(var(--gold))]/10" />
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/80 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Feito pra durar — e pra aparecer.</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                  Peças selecionadas + detalhes que elevam a tua roda de mate.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Destaques */}
      <section className="container py-6">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-lg font-semibold">Destaques</h2>
          <Link href="/produtos" className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
            Ver tudo →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              imageUrl={p.images[0]?.url ?? null}
              isFeatured={p.isFeatured}
              isNew={p.isNew}
              fromPriceCents={p.variants[0]?.priceCents ?? 0}
              fromCompareAtCents={p.variants[0]?.compareAtCents ?? null}
            />
          ))}
        </div>
      </section>

      {/* Novidades */}
      <section className="container py-6">
        <h2 className="text-lg font-semibold">Novidades</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newest.map((p) => (
            <ProductCard
              key={p.id}
              slug={p.slug}
              name={p.name}
              imageUrl={p.images[0]?.url ?? null}
              isFeatured={p.isFeatured}
              isNew={p.isNew}
              fromPriceCents={p.variants[0]?.priceCents ?? 0}
              fromCompareAtCents={p.variants[0]?.compareAtCents ?? null}
            />
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section className="container py-10">
        <div className="card p-8">
          <h2 className="text-lg font-semibold">Quem compra, volta.</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {[
              { name: "Rafael • RS", text: "Acabamento impecável. Chegou rápido e muito bem embalado." },
              { name: "Camila • SC", text: "Personalização ficou perfeita. Presente que virou o favorito." },
              { name: "João • PR", text: "A cuia é ainda mais bonita ao vivo. Recomendo demais." },
            ].map((t) => (
              <div key={t.name} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <div className="text-sm text-[hsl(var(--muted))]">“{t.text}”</div>
                <div className="mt-3 text-sm font-medium">{t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
