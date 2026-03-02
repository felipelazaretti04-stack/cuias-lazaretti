import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getBestSellers } from "@/lib/bestSellers";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { TrustBadges } from "@/components/shop/TrustBadges";
import { ProductRail } from "@/components/shop/ProductRail";
import { SectionShell } from "@/components/shop/SectionShell";

export default async function HomePage() {
  const content = (await prisma.siteContent.findFirst())!;

  const featured = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
      reviews: { where: { approved: true }, select: { rating: true } },
    },
  });

  const newest = await prisma.product.findMany({
    where: { isActive: true, isNew: true },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
      reviews: { where: { approved: true }, select: { rating: true } },
    },
  });

  const best = await getBestSellers(8);

  // Função para mapear produtos pro formato do Rail
  function mapToRail(products: typeof featured) {
    return products
      .map((p) => {
        const v = p.variants[0];
        if (!v) return null;

        const ratingCount = p.reviews?.length ?? 0;
        const ratingAvg =
          ratingCount > 0
            ? p.reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount
            : 0;

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          imageUrl: p.images[0]?.url ?? null,
          fromPriceCents: v.priceCents,
          fromCompareAtCents: v.compareAtCents ?? null,
          isNew: p.isNew,
          isFeatured: p.isFeatured,
          ratingAvg,
          ratingCount,
        };
      })
      .filter(Boolean) as {
        id: string;
        slug: string;
        name: string;
        imageUrl: string | null;
        fromPriceCents: number;
        fromCompareAtCents: number | null;
        isNew: boolean;
        isFeatured: boolean;
        ratingAvg: number;
        ratingCount: number;
      }[];
  }

  // Mapeia best sellers (estrutura pode ser diferente)
  function mapBestToRail(products: typeof best) {
    return products
      .map((p) => {
        const v = p.variants[0];
        if (!v) return null;

        return {
          id: p.id,
          slug: p.slug,
          name: p.name,
          imageUrl: p.images[0]?.url ?? null,
          fromPriceCents: v.priceCents,
          fromCompareAtCents: v.compareAtCents ?? null,
          isNew: p.isNew,
          isFeatured: p.isFeatured,
          ratingAvg: 0,
          ratingCount: 0,
        };
      })
      .filter(Boolean) as {
        id: string;
        slug: string;
        name: string;
        imageUrl: string | null;
        fromPriceCents: number;
        fromCompareAtCents: number | null;
        isNew: boolean;
        isFeatured: boolean;
        ratingAvg: number;
        ratingCount: number;
      }[];
  }

  const featuredUi = mapToRail(featured);
  const newestUi = mapToRail(newest);
  const bestUi = mapBestToRail(best);

  // Slides do carrossel
  const slides = [
    {
      imageUrl: content.heroImageUrl,
      badge: content.heroBadgeText,
      title: content.heroTitle,
      highlight: "premium",
      subtitle: content.heroSubtitle,
      primaryText: content.heroPrimaryButtonText,
      primaryHref: content.heroPrimaryButtonLink,
      secondaryText: content.heroSecondaryButtonText,
      secondaryHref: content.heroSecondaryButtonLink,
    },
    {
      imageUrl: content.institutionalImageUrl,
      badge: "Personalização sob medida",
      title: "Presente que vira",
      highlight: "memória",
      subtitle: "Escolhe a peça e descreve a personalização no checkout. Nós cuidamos do resto.",
      primaryText: "Ver personalizáveis",
      primaryHref: "/produtos?q=personaliz",
      secondaryText: "Falar no WhatsApp",
      secondaryHref: "/contato",
    },
  ];

  return (
    <div>
      {/* HERO CARROSSEL */}
      <HeroCarousel slides={slides} />

      {/* TRUST BADGES */}
      <TrustBadges />

      {/* DESTAQUES */}
<<<<<<< HEAD
      <section className="container py-10">
        <SectionHeader title="Destaques" subtitle="Peças com estética premium e acabamento impecável." href="/produtos" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((p: (typeof featured)[number]) =>
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
          )}
        </div>
      </section>
=======
      <SectionShell tone="accent">
        <ProductRail
          title="Destaques da semana"
          subtitle="Peças premium com acabamento caprichado."
          hrefAll="/produtos?featured=1"
          products={featuredUi}
        />
      </SectionShell>
>>>>>>> 8cb04a5a8bf609eab8837c3e974c3b76f2d53f0e

      {/* INSTITUCIONAL */}
      <section className="container py-10">
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
                <Image
                  src={content.institutionalImageUrl}
                  alt="Institucional"
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--gold))]/12 via-transparent to-[hsl(var(--primary))]/10" />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* NOVIDADES */}
<<<<<<< HEAD
      <section className="container py-10">
        <SectionHeader title="Novidades" subtitle="Lançamentos e reposições." href="/produtos" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newest.map((p: (typeof newest)[number]) =>
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
          )}
        </div>
      </section>

      {/* MAIS VENDIDOS REAL */}
      <section className="container py-10">
        <SectionHeader title="Mais vendidos" subtitle="Os favoritos da roda de mate (com base em pedidos pagos)." href="/produtos" />
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {best.map((p: (typeof best)[number]) =>
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
          )}
        </div>
        {best.length === 0 ? (
          <div className="mt-4 text-xs text-[hsl(var(--muted))]">
=======
      <SectionShell tone="light">
        <ProductRail
          title="Novidades"
          subtitle="Lançamentos e reposições fresquinhas."
          hrefAll="/produtos?new=1"
          products={newestUi}
        />
      </SectionShell>

      {/* MAIS VENDIDOS */}
      <SectionShell tone="accent">
        <ProductRail
          title="Mais vendidos"
          subtitle="Os favoritos da roda de mate."
          hrefAll="/produtos"
          products={bestUi}
        />
      </SectionShell>

      {bestUi.length === 0 && (
        <div className="container pb-10">
          <div className="text-center text-xs text-[hsl(var(--muted))]">
>>>>>>> 8cb04a5a8bf609eab8837c3e974c3b76f2d53f0e
            Ainda sem base de pedidos pagos. Assim que o webhook confirmar pagamentos, isso preenche automaticamente.
          </div>
        </div>
      )}
    </div>
  );
}
