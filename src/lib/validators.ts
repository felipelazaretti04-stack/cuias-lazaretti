import { z } from "zod";

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const categoryCreateSchema = z.object({
  name: z.string().min(2).max(60),
  isActive: z.coerce.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(999).default(0),
});

export const productCreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(4000).optional(),
  care: z.string().max(2000).optional(),
  categoryId: z.string().optional().nullable(),
  isPersonalized: z.coerce.boolean().default(false),
  productionDays: z.coerce.number().int().min(0).max(60).default(0),
  isActive: z.coerce.boolean().default(true),
  isFeatured: z.coerce.boolean().default(false),
  isNew: z.coerce.boolean().default(false),

  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().max(120).optional(),
    sortOrder: z.coerce.number().int().min(0).max(99).default(0),
  })).default([]),

  variants: z.array(z.object({
    sku: z.string().min(3).max(60),
    size: z.string().max(40).optional().nullable(),
    finish: z.string().max(40).optional().nullable(),
    color: z.string().max(40).optional().nullable(),
    personalization: z.string().max(10).optional().nullable(), // "Sim"/"Não"
    priceCents: z.coerce.number().int().min(0),
    compareAtCents: z.coerce.number().int().min(0).optional().nullable(),
    stock: z.coerce.number().int().min(0).max(9999).default(0),
    isActive: z.coerce.boolean().default(true),
  })).min(1),
});
