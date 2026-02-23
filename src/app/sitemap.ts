import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: new Date() },
    { url: `${base}/produtos`, lastModified: new Date() },
    { url: `${base}/sobre`, lastModified: new Date() },
    { url: `${base}/contato`, lastModified: new Date() },
    { url: `${base}/politicas`, lastModified: new Date() },
    { url: `${base}/termos`, lastModified: new Date() },
    { url: `${base}/privacidade`, lastModified: new Date() },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${base}/produtos/${p.slug}`,
    lastModified: p.updatedAt,
  }));

  return [...staticRoutes, ...productRoutes];
}
