import { prisma } from "@/lib/prisma";
import { getBestSellers } from "@/lib/bestSellers";

export async function getHeroSlidesForCarousel() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 5,
  });

  // compatível com seu HeroCarousel (slide shape atual)
  return slides.map((s) => ({
    imageUrl: s.imageUrl || null,
    badge: s.badge || "",
    title: s.title || "",
    highlight: s.highlight || "",
    subtitle: s.subtitle || "",
    primaryText: s.primaryText || "",
    primaryHref: s.primaryHref || "",
    secondaryText: s.secondaryText || "",
    secondaryHref: s.secondaryHref || "",
  }));
}

export async function getHomeRailsResolved() {
  const rails = await prisma.homeRail.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  const include = {
    images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
    variants: { where: { isActive: true }, orderBy: { priceCents: "asc" as const }, take: 1 },
    reviews: { where: { approved: true }, select: { rating: true } },
  };

  const resolved = await Promise.all(
    rails.map(async (r) => {
      let products: any[] = [];

      if (r.type === "FEATURED") {
        products = await prisma.product.findMany({
          where: { isActive: true, isFeatured: true },
          orderBy: { createdAt: "desc" },
          take: r.limit,
          include,
        });
      }
      if (r.type === "NEW") {
        products = await prisma.product.findMany({
          where: { isActive: true, isNew: true },
          orderBy: { createdAt: "desc" },
          take: r.limit,
          include,
        });
      }
      if (r.type === "PERSONALIZED") {
        products = await prisma.product.findMany({
          where: { isActive: true, isPersonalized: true },
          orderBy: { createdAt: "desc" },
          take: r.limit,
          include,
        });
      }
      if (r.type === "READY_TO_SHIP") {
        products = await prisma.product.findMany({
          where: { isActive: true, productionDays: { lte: 1 } },
          orderBy: { updatedAt: "desc" },
          take: r.limit,
          include,
        });
      }
      if (r.type === "BEST_SELLERS") {
        products = await getBestSellers(r.limit);
      }

      return { rail: r, products };
    })
  );

  return resolved;
}
