// file: src/app/api/admin/estoque/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  // TODO: adicionar requireAdmin() depois de criar
  
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();
  const category = (searchParams.get("category") || "").trim();
  const stockFilter = (searchParams.get("stock") || "all").trim();
  const sort = (searchParams.get("sort") || "name-asc").trim();

  const variants = await prisma.variant.findMany({
    where: {
      product: {
        ...(q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { slug: { contains: q, mode: "insensitive" } },
              ],
            }
          : {}),
        ...(category
          ? { category: { slug: category } }
          : {}),
      },
      ...(stockFilter === "out"
        ? { stock: 0 }
        : stockFilter === "low"
          ? { stock: { gt: 0, lte: 3 } }
          : stockFilter === "in"
            ? { stock: { gt: 0 } }
            : {}),
    },
    include: {
      product: {
        include: { category: true },
      },
    },
    take: 500,
  });

  const sorted = [...variants].sort((a, b) => {
    const nameA = `${a.product.name} ${a.size || ""} ${a.color || ""}`;
    const nameB = `${b.product.name} ${b.size || ""} ${b.color || ""}`;
    
    if (sort === "name-desc") return nameB.localeCompare(nameA, "pt-BR");
    if (sort === "stock-asc") return a.stock - b.stock;
    if (sort === "stock-desc") return b.stock - a.stock;
    return nameA.localeCompare(nameB, "pt-BR");
  });

  return NextResponse.json({
    items: sorted.map((v) => ({
      id: v.id,
      sku: v.sku,
      size: v.size,
      color: v.color,
      finish: v.finish,
      stock: v.stock,
      priceCents: v.priceCents,
      productId: v.productId,
      productName: v.product.name,
      categoryName: v.product.category?.name || "Sem categoria",
      categorySlug: v.product.category?.slug || "",
      isActive: v.isActive,
    })),
  });
}
