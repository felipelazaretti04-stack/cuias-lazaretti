import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { getBestSellers } from "@/lib/bestSellers";

export default async function HomePage() {
  const content = (await prisma.siteContent.findFirst())!;
  const trust = (content?.trustBarJson as any[]) || [];

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

  const best = await getBestSellers(6);

  return (
    <div>
      {/* HERO */}
      <section className="container py-10">
        <div className="card overflow-hidden">
          <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center">
            <div>
              <div className="badge">{content.heroBadgeText}</div>
              <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                {content.heroTitle}
              </h1>
              <p className="mt-3 text-sm text-[hsl(var(--muted))]">
                {content.heroSubtitle}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={content.heroPrimaryButtonLink}
                  className="inline-flex items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
                >
                  {content.heroPrimaryButtonText}
                </Link>
                <Link
                  href={content.heroSecondaryButtonLink}
                  className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-5 py-2.5 text-sm font-medium hover:bg-[hsl(var(--accent))]"
                >
                  {content.heroSecondaryButtonText}
                </Link>
              </div>

              <div className="mt-6 text-xs text-[hsl(var(--muted))]">
                {content.scarcityText}
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
              {content.heroImageUrl ? (
                <Image
                  src={content.heroImageUrl}
                  alt="Hero"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--primary))]/12 via-transparent to-[hsl(var(--gold))]/10" />
              )}
              <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/85 p-4 backdrop-blur">
                <div className="text-sm font-semibold">Premium, clean e feito pra durar.</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                  Envio Brasil • Retirada em Erechim/RS
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <section className="container">
        <div className="grid gap-3 md:grid-cols-4">
          {trust.map((it, idx) => (
            <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="mt-1 text-xs text-[hsl(var(--muted))]">{it.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="container py-10">
        <SectionHeader title="Destaques" subtitle="Peças com estética premium e acabamento impecável." href="/produtos" />
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

      {/* INSTITUCIONAL */}
      <section className="container py-2">
        <div className="card p-8">
          <div className="grid gap-6 md:grid-cols-2 md:items-center">
            <div>
              <div className="text-lg font-semibold">{content.institutionalTitle}</div>
              <p className="mt-2 text-sm text-[hsl(var(--muted))]">
                {content.institutionalText}
              </p>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
              {content.institutionalImageUrl ? (
                <Image src={content.institutionalImageUrl} alt="Institucional" fill className="object-cover" sizes="50vw" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--gold))]/12 via-transparent to-[hsl(var(--primary))]/10" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NOVIDADES */}
      <section className="container py-10">
        <SectionHeader title="Novidades" subtitle="Lançamentos e reposições." href="/produtos" />
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

      {/* MAIS VENDIDOS REAL */}
      <section className="container py-10">
        <SectionHeader title="Mais vendidos" subtitle="Os favoritos da roda de mate (com base em pedidos pagos)." href="/produtos" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {best.map((p) => (
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
        {best.length === 0 ? (
          <div className="mt-4 text-xs text-[hsl(var(--muted))]">
            Ainda sem base de pedidos pagos. Assim que o webhook confirmar pagamentos, isso preenche automaticamente.
          </div>
        ) : null}
      </section>
    </div>
  );
}
