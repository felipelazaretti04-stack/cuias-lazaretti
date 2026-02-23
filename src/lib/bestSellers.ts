import { prisma } from "@/lib/prisma";

export async function getBestSellers(limit = 6) {
  // agrega qty por productId via OrderItem -> Variant -> Product, filtrando Order.status=PAID
  const rows = await prisma.orderItem.groupBy({
    by: ["variantId"],
    _sum: { qty: true },
    where: {
      order: { status: "PAID" },
    },
    orderBy: { _sum: { qty: "desc" } },
    take: 200,
  });

  // converte para productId somando por product
  const variantIds = rows.map((r) => r.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true },
  });

  const vToP = new Map(variants.map((v) => [v.id, v.productId]));
  const productQty = new Map<string, number>();

  for (const r of rows) {
    const productId = vToP.get(r.variantId);
    if (!productId) continue;
    productQty.set(productId, (productQty.get(productId) || 0) + (r._sum.qty || 0));
  }

  const productIdsSorted = [...productQty.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([pid]) => pid);

  if (!productIdsSorted.length) return [];

  const products = await prisma.product.findMany({
    where: { id: { in: productIdsSorted }, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
    },
  });

  // manter ordem do ranking
  const byId = new Map(products.map((p) => [p.id, p]));
  return productIdsSorted.map((id) => byId.get(id)).filter(Boolean) as typeof products;
}
