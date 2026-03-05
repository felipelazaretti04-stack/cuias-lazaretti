// file: src/app/api/admin/produtos/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

function skuSafe(input: string) {
  return (input || "")
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 30);
}

function shortRand() {
  return Math.random().toString(36).slice(2, 6).toUpperCase();
}

function buildSku(args: {
  productSlug: string;
  categorySlug?: string | null;
  size?: string | null;
  finish?: string | null;
  color?: string | null;
  personalization?: string | null;
}) {
  const parts = [
    "CLZ",
    skuSafe(args.categorySlug || "PROD"),
    skuSafe(args.productSlug),
    args.size ? skuSafe(args.size) : null,
    args.finish ? skuSafe(args.finish) : null,
    args.color ? skuSafe(args.color) : null,
    args.personalization ? skuSafe(args.personalization) : null,
    shortRand(),
  ].filter(Boolean);
  return parts.join("-").slice(0, 80);
}

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
    },
  });

  return NextResponse.json({ products });
}

const variantSchema = z.object({
  sku: z.string().max(80).optional().nullable(), // aceita vazio
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

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const product = await prisma.$transaction(async (tx) => {
      const p = await tx.product.create({
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

      if (parsed.data.images.length) {
        await tx.productImage.createMany({
          data: parsed.data.images.map((img) => ({
            productId: p.id,
            url: img.url,
            alt: img.alt ?? null,
            sortOrder: img.sortOrder ?? 0,
          })),
        });
      }

      // Criar variantes com SKU automático
      for (const v of parsed.data.variants) {
        let sku = (v.sku || "").trim();
        
        // Se SKU vazio, gera automaticamente
        if (!sku) {
          sku = buildSku({
            productSlug: parsed.data.slug,
            categorySlug: null,
            size: v.size ?? null,
            finish: v.finish ?? null,
            color: v.color ?? null,
            personalization: v.personalization ?? null,
          });
        }

        // Garante unicidade (tenta até 5x se colidir)
        for (let i = 0; i < 5; i++) {
          const exists = await tx.variant.findUnique({ where: { sku } });
          if (!exists) break;
          sku = sku.slice(0, 72) + "-" + shortRand();
        }

        await tx.variant.create({
          data: {
            productId: p.id,
            sku,
            priceCents: v.priceCents,
            compareAtCents: v.compareAtCents ?? null,
            stock: v.stock,
            isActive: v.isActive,
            size: v.size ?? null,
            finish: v.finish ?? null,
            color: v.color ?? null,
            personalization: v.personalization ?? null,
          },
        });
      }

      return p;
    });

    return NextResponse.json({ ok: true, productId: product.id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Falha ao criar produto (slug/SKU pode estar duplicado)" }, { status: 400 });
  }
}
