import { prisma } from "@/lib/prisma";

export async function getHomeRails() {
  const baseInclude = {
    images: { orderBy: { sortOrder: "asc" as const }, take: 1 },
    variants: { where: { isActive: true }, orderBy: { priceCents: "asc" as const }, take: 1 },
  };

  const [featured, news, personalized, readyToShip, trending] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: baseInclude,
    }),
    prisma.product.findMany({
      where: { isActive: true, isNew: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: baseInclude,
    }),
    prisma.product.findMany({
      where: { isActive: true, isPersonalized: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: baseInclude,
    }),
    prisma.product.findMany({
      where: { isActive: true, productionDays: { lte: 1 } },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: baseInclude,
    }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: baseInclude,
    }),
  ]);

  return {
    featured,
    news,
    personalized,
    readyToShip,
    trending,
  };
}
