import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCart } from "@/lib/cart";

export async function GET() {
  const cart = await getCart();
  
  if (cart.items.length === 0) {
    return NextResponse.json({ items: [], subtotalCents: 0 });
  }

  const ids = cart.items.map((i) => i.variantId);
  const variants = await prisma.variant.findMany({
    where: { id: { in: ids } },
    include: {
      product: {
        include: { images: { orderBy: { sortOrder: "asc" }, take: 1 } },
      },
    },
  });

  const map = new Map(variants.map((v) => [v.id, v]));

  const items = cart.items
    .map((ci) => {
      const v = map.get(ci.variantId);
      if (!v || !v.isActive || !v.product.isActive) return null;

      const label = [v.size, v.finish, v.color, v.personalization]
        .filter(Boolean)
        .join(" • ") || null;

      return {
        variantId: v.id,
        productName: v.product.name,
        variantLabel: label,
        sku: v.sku,
        unitPriceCents: v.priceCents,
        qty: ci.qty,
        lineTotalCents: v.priceCents * ci.qty,
        imageUrl: v.product.images[0]?.url || null,
      };
    })
    .filter(Boolean);

  const subtotalCents = items.reduce((acc, it) => acc + it!.lineTotalCents, 0);

  return NextResponse.json({ items, subtotalCents });
}
