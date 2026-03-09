// file: src/app/(shop)/page.tsx
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { HeroCarousel } from "@/components/shop/HeroCarousel";
import { TrustBadges } from "@/components/shop/TrustBadges";
import { ProductRail } from "@/components/shop/ProductRail";
import { SectionShell } from "@/components/shop/SectionShell";
import { HomeInstitutional } from "@/components/shop/HomeInstitutional";
import { getHeroSlidesForCarousel as getHeroSlides, getHomeRailsResolved as getHomeRails } from "@/lib/homeContent";

export default async function HomePage() {
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

      <HomeInstitutional />
    </div>
  );
}
