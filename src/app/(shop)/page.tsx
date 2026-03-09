import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { TrustBadges } from "@/components/shop/TrustBadges";
import { ProductRail } from "@/components/shop/ProductRail";
import { SectionShell } from "@/components/shop/SectionShell";
import { getHeroSlidesForCarousel as getHeroSlides, getHomeRailsResolved as getHomeRails } from "@/lib/homeContent";


export default async function HomePage() {
  const content = (await prisma.siteContent.findFirst())!;
  const slides = await getHeroSlides();
  const rails = await getHomeRails();

  return (
    <div>
      <HeroCarousel slides={slides} />
      <TrustBadges />

      {rails.map(({ rail, products }) => {
        const ui = products
          .map((p: any) => {
            const v = p.variants?.[0];
            if (!v) return null;

            const ratingCount = p.reviews?.length ?? 0;
            const ratingAvg =
              ratingCount > 0
                ? p.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / ratingCount
                : 0;

            return {
              id: p.id,
              slug: p.slug,
              name: p.name,
              imageUrl: p.images?.[0]?.url ?? null,
              fromPriceCents: v.priceCents,
              fromCompareAtCents: v.compareAtCents ?? null,
              isNew: !!p.isNew,
              isFeatured: !!p.isFeatured,
              ratingAvg,
              ratingCount,
            };
          })
          .filter(Boolean);

        const tone = rail.sortOrder % 2 === 0 ? "accent" : "light";

        return (
          <SectionShell key={rail.id} tone={tone as any}>
            <ProductRail
              title={rail.title}
              subtitle={rail.subtitle || ""}
              hrefAll={rail.hrefAll || "/produtos"}
              products={ui as any}
            />
          </SectionShell>
        );
      })}

      {/* Seção institucional */}
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
                  quality={90}
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--gold))]/12 via-transparent to-[hsl(var(--primary))]/10" />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
