import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  productId: z.string(),
  rating: z.coerce.number().int().min(1).max(5),
  name: z.string().min(2).max(80),
  comment: z.string().max(600).optional().nullable(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: parsed.data.productId } });
  if (!product || !product.isActive) return NextResponse.json({ error: "Produto inválido" }, { status: 400 });

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      rating: parsed.data.rating,
      name: parsed.data.name,
      comment: parsed.data.comment ? parsed.data.comment : null,
      approved: false,
    },
  });

  return NextResponse.json({ ok: true, reviewId: review.id });
}
