import { prisma } from "@/lib/prisma";
import { getBestSellers } from "@/lib/bestSellers";

export async function getHeroSlides() {
  const slides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    take: 5,
  });

  // compat com HeroCarousel atual
  return slides.map((s) => ({
    imageUrl: s.imageUrl,
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

export async function getHomeRails() {
  const rails = await prisma.homeRail.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: { category: true, items: { orderBy: { sortOrder: "asc" }, include: { product: true } } },
  });

  // helper base include para buscar produtos por tipo
  const includeProduct = {
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
          include: includeProduct,
        });
      } else if (r.type === "NEW") {
        products = await prisma.product.findMany({
          where: { isActive: true, isNew: true },
          orderBy: { createdAt: "desc" },
          take: r.limit,
          include: includeProduct,
        });
      } else if (r.type === "PERSONALIZED") {
        products = await prisma.product.findMany({
          where: { isActive: true, isPersonalized: true },
          orderBy: { createdAt: "desc" },
          take: r.limit,
          include: includeProduct,
        });
      } else if (r.type === "READY_TO_SHIP") {
        products = await prisma.product.findMany({
          where: { isActive: true, productionDays: { lte: 1 } },
          orderBy: { updatedAt: "desc" },
          take: r.limit,
          include: includeProduct,
        });
      } else if (r.type === "BEST_SELLERS") {
        products = await getBestSellers(r.limit);
      } else if (r.type === "CATEGORY" && r.categoryId) {
        products = await prisma.product.findMany({
          where: { isActive: true, categoryId: r.categoryId },
          orderBy: { createdAt: "desc" },
          take: r.limit,
          include: includeProduct,
        });
      } else if (r.type === "MANUAL") {
        // manual: usa itens (productId). Precisamos buscar com include completo.
        const ids = r.items.map((it) => it.productId);
        if (ids.length) {
          const list = await prisma.product.findMany({
            where: { id: { in: ids }, isActive: true },
            include: includeProduct,
          });
          // manter ordem
          const map = new Map(list.map((p) => [p.id, p]));
          products = ids.map((id) => map.get(id)).filter(Boolean) as any[];
        }
      }

      return { rail: r, products };
    })
  );

  return resolved;
}
