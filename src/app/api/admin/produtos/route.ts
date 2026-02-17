import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { productCreateSchema } from "@/lib/validators";
import { slugify } from "@/lib/slug";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: { category: true, variants: true, images: { orderBy: { sortOrder: "asc" } } },
  });

  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = productCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  const baseSlug = slugify(parsed.data.name);
  let slug = baseSlug;
  let n = 2;
  while (await prisma.product.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${n++}`;
  }

  const product = await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug,
      description: parsed.data.description,
      care: parsed.data.care,
      categoryId: parsed.data.categoryId ?? null,
      isPersonalized: parsed.data.isPersonalized,
      productionDays: parsed.data.productionDays,
      isActive: parsed.data.isActive,
      isFeatured: parsed.data.isFeatured,
      isNew: parsed.data.isNew,

      images: {
        create: parsed.data.images.map((img) => ({
          url: img.url,
          alt: img.alt,
          sortOrder: img.sortOrder,
        })),
      },
      variants: {
        create: parsed.data.variants.map((v) => ({
          sku: v.sku,
          size: v.size ?? null,
          finish: v.finish ?? null,
          color: v.color ?? null,
          personalization: v.personalization ?? null,
          priceCents: v.priceCents,
          compareAtCents: v.compareAtCents ?? null,
          stock: v.stock,
          isActive: v.isActive,
        })),
      },
    },
    include: { images: true, variants: true },
  });

  return NextResponse.json({ product }, { status: 201 });
}
