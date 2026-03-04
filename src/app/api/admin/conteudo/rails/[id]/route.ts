import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const patch = z.object({
  title: z.string().min(2).max(80).optional(),
  subtitle: z.string().optional().nullable(),
  hrefAll: z.string().optional().nullable(),
  type: z.enum(["FEATURED", "NEW", "BEST_SELLERS", "PERSONALIZED", "READY_TO_SHIP"]).optional(),
  limit: z.coerce.number().int().min(4).max(24).optional(),
  sortOrder: z.coerce.number().int().min(0).max(50).optional(),
  isActive: z.coerce.boolean().optional(),
});

export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  const parsed = patch.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const rail = await prisma.homeRail.update({ where: { id }, data: parsed.data });
  return NextResponse.json({ rail });
}

export async function DELETE(_: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  await prisma.homeRail.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
