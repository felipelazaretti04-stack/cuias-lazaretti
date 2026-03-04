import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const slideSchema = z.object({
  imageUrl: z.string().url().optional().nullable(),
  badge: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  highlight: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  primaryText: z.string().optional().nullable(),
  primaryHref: z.string().optional().nullable(),
  secondaryText: z.string().optional().nullable(),
  secondaryHref: z.string().optional().nullable(),
  sortOrder: z.coerce.number().int().min(0).max(50).default(0),
  isActive: z.coerce.boolean().default(true),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const slides = await prisma.heroSlide.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ slides });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = slideSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

  // limite hard: 5 slides
  const count = await prisma.heroSlide.count();
  if (count >= 5) return NextResponse.json({ error: "Limite de 5 slides atingido" }, { status: 400 });

  const created = await prisma.heroSlide.create({ data: parsed.data });
  return NextResponse.json({ slide: created }, { status: 201 });
}
