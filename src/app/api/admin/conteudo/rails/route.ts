import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(2).max(80),
  subtitle: z.string().optional().nullable(),
  hrefAll: z.string().optional().nullable(),
  type: z.enum(["FEATURED", "NEW", "BEST_SELLERS", "PERSONALIZED", "READY_TO_SHIP"]),
  limit: z.coerce.number().int().min(4).max(24).default(10),
  sortOrder: z.coerce.number().int().min(0).max(50).default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const rails = await prisma.homeRail.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ rails });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.homeRail.create({ data: parsed.data });
  return NextResponse.json({ rail: created }, { status: 201 });
}
