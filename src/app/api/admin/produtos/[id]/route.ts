import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true },
  });

  return NextResponse.json({ product, categories });
}

const variantSchema = z.object({
  sku: z.string().min(2).max(80),
  priceCents: z.coerce.number().int().min(1),
  compareAtCents: z.coerce.number().int().optional().nullable(),
  stock: z.coerce.number().int().min(0),
  isActive: z.coerce.boolean().default(true),
  size: z.string().optional().nullable(),
  finish: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  personalization: z.string().optional().nullable(),
});

const imageSchema = z.object({
  url: z.string().url(),
  alt: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(50).default(0),
});

const schema = z.object({
  name: z.string().min(2).max(160),
  slug: z.string().min(2).max(160),
  description: z.string().optional().nullable(),
  care: z.string().optional().nullable(),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),
  isPersonalized: z.coerce.boolean().default(false),
  productionDays: z.coerce.number().int().min(0).max(60).default(0),
  categoryId: z.string().optional().nullable(),
  images: z.array(imageSchema).max(20).default([]),
  variants: z.array(variantSchema).min(1).max(100),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const p = await tx.product.update({
        where: { id },
        data: {
          name: parsed.data.name,
          slug: parsed.data.slug,
          description: parsed.data.description ?? null,
          care: parsed.data.care ?? null,
          isActive: parsed.data.isActive,
          isFeatured: parsed.data.isFeatured,
          isNew: parsed.data.isNew,
          isPersonalized: parsed.data.isPersonalized,
          productionDays: parsed.data.productionDays,
          categoryId: parsed.data.categoryId || null,
        },
      });

      await tx.productImage.deleteMany({ where: { productId: id } });
      if (parsed.data.images.length) {
        await tx.productImage.createMany({
          data: parsed.data.images.map((img) => ({
            productId: id,
            url: img.url,
            alt: img.alt ?? null,
            sortOrder: img.sortOrder ?? 0,
          })),
        });
      }

      await tx.variant.deleteMany({ where: { productId: id } });
      await tx.variant.createMany({
        data: parsed.data.variants.map((v) => ({
          productId: id,
          sku: v.sku,
          priceCents: v.priceCents,
          compareAtCents: v.compareAtCents ?? null,
          stock: v.stock,
          isActive: v.isActive,
          size: v.size ?? null,
          finish: v.finish ?? null,
          color: v.color ?? null,
          personalization: v.personalization ?? null,
        })),
      });

      return p;
    });

    return NextResponse.json({ ok: true, product: updated });
  } catch (e: any) {
    return NextResponse.json({ error: "Falha ao atualizar produto (slug/SKU pode estar duplicado)" }, { status: 400 });
  }
}
