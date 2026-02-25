import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { SectionHeader } from "@/components/shop/SectionHeader";
import { ProductCard } from "@/components/shop/ProductCard";
import { getBestSellers } from "@/lib/bestSellers";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { TrustBadges } from "@/components/shop/TrustBadges";

export default async function HomePage() {
  const content = (await prisma.siteContent.findFirst())!;

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

      {/* MAIS VENDIDOS */}
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
        {best.length === 0 && (
          <div className="mt-4 text-xs text-[hsl(var(--muted))]">
            Ainda sem base de pedidos pagos. Assim que o webhook confirmar pagamentos, isso preenche automaticamente.
          </div>
        )}
      </section>
    </div>
  );
}
