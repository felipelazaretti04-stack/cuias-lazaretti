import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const cupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ cupons });
}

const createSchema = z.object({
  code: z.string().min(3).max(30).transform((s) => s.trim().toUpperCase()),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.coerce.number().int().min(1),
  active: z.coerce.boolean().default(true),
  expiresAt: z.string().optional().nullable(), // ISO
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

  const c = await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      active: parsed.data.active,
      expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : null,
      maxUses: parsed.data.maxUses ?? null,
    },
  });

  return NextResponse.json({ coupon: c }, { status: 201 });
}

const patchSchema = z.object({
  id: z.string(),
  active: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const updated = await prisma.coupon.update({
    where: { id: parsed.data.id },
    data: { ...(parsed.data.active != null ? { active: parsed.data.active } : {}) },
  });

  return NextResponse.json({ coupon: updated });
}
