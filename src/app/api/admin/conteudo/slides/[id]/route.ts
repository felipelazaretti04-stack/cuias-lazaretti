import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const patchSchema = z.object({
  imageUrl: z.string().url().optional().nullable(),
  badge: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  highlight: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  primaryText: z.string().optional().nullable(),
  primaryHref: z.string().optional().nullable(),
  secondaryText: z.string().optional().nullable(),
  secondaryHref: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(50).optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const slide = await prisma.heroSlide.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ slide });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  await prisma.heroSlide.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
