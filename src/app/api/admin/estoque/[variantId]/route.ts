// file: src/app/api/admin/estoque/[variantId]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Ctx = {
  params: Promise<{ variantId: string }>;
};

export async function PATCH(req: Request, ctx: Ctx) {
  const { variantId } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const stock = Number(body?.stock);

  if (!Number.isInteger(stock) || stock < 0) {
    return NextResponse.json(
      { error: "Estoque inválido" },
      { status: 400 }
    );
  }

  const variant = await prisma.variant.findUnique({
    where: { id: variantId },
  });

  if (!variant) {
    return NextResponse.json({ error: "Variante não encontrada" }, { status: 404 });
  }

  const updated = await prisma.variant.update({
    where: { id: variantId },
    data: { stock },
    include: {
      product: {
        include: { category: true },
      },
    },
  });

  return NextResponse.json({
    ok: true,
    item: {
      id: updated.id,
      sku: updated.sku,
      size: updated.size,
      color: updated.color,
      finish: updated.finish,
      stock: updated.stock,
      priceCents: updated.priceCents,
      productId: updated.productId,
      productName: updated.product.name,
      categoryName: updated.product.category?.name || "Sem categoria",
      categorySlug: updated.product.category?.slug || "",
      isActive: updated.isActive,
    },
  });
}
