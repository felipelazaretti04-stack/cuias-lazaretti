import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

const trustItemSchema = z.object({
  title: z.string().min(2).max(60),
  desc: z.string().min(2).max(120),
});

const schema = z.object({
  heroTitle: z.string().min(2).max(120),
  heroSubtitle: z.string().min(2).max(240),
  heroBadgeText: z.string().min(2).max(80),
  heroPrimaryButtonText: z.string().min(1).max(40),
  heroPrimaryButtonLink: z.string().min(1).max(200),
  heroSecondaryButtonText: z.string().min(1).max(40),
  heroSecondaryButtonLink: z.string().min(1).max(200),
  heroImageUrl: z.string().url().optional().nullable(),
  institutionalTitle: z.string().min(2).max(120),
  institutionalText: z.string().min(2).max(320),
  institutionalImageUrl: z.string().url().optional().nullable(),
  scarcityText: z.string().min(2).max(120),
  trustBarItems: z.array(trustItemSchema).min(0).max(8),
});

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const content = await prisma.siteContent.findFirst();
  if (!content) return NextResponse.json({ error: "Conteúdo não inicializado (rodar seed)" }, { status: 404 });

  return NextResponse.json({
    content: {
      ...content,
      trustBarItems: (content.trustBarJson as any[]) || [],
    },
  });
}

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", issues: parsed.error.flatten() }, { status: 400 });

  const existing = await prisma.siteContent.findFirst();
  if (!existing) return NextResponse.json({ error: "Conteúdo não inicializado (rodar seed)" }, { status: 404 });

  const updated = await prisma.siteContent.update({
    where: { id: existing.id },
    data: {
      heroTitle: parsed.data.heroTitle,
      heroSubtitle: parsed.data.heroSubtitle,
      heroBadgeText: parsed.data.heroBadgeText,
      heroPrimaryButtonText: parsed.data.heroPrimaryButtonText,
      heroPrimaryButtonLink: parsed.data.heroPrimaryButtonLink,
      heroSecondaryButtonText: parsed.data.heroSecondaryButtonText,
      heroSecondaryButtonLink: parsed.data.heroSecondaryButtonLink,
      heroImageUrl: parsed.data.heroImageUrl ?? null,
      institutionalTitle: parsed.data.institutionalTitle,
      institutionalText: parsed.data.institutionalText,
      institutionalImageUrl: parsed.data.institutionalImageUrl ?? null,
      scarcityText: parsed.data.scarcityText,
      trustBarJson: parsed.data.trustBarItems as any,
    },
  });

  return NextResponse.json({ ok: true, content: updated });
}
