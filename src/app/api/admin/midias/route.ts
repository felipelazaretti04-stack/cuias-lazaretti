import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 200 });
  return NextResponse.json({ assets });
}

const createSchema = z.object({
  url: z.string().url(),
  publicId: z.string().optional().nullable(),
  provider: z.string().optional(),
  width: z.number().int().optional().nullable(),
  height: z.number().int().optional().nullable(),
  bytes: z.number().int().optional().nullable(),
  format: z.string().optional().nullable(),
  alt: z.string().max(120).optional().nullable(),
});

export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const asset = await prisma.mediaAsset.create({
    data: {
      url: parsed.data.url,
      publicId: parsed.data.publicId ?? null,
      provider: parsed.data.provider || "CLOUDINARY",
      width: parsed.data.width ?? null,
      height: parsed.data.height ?? null,
      bytes: parsed.data.bytes ?? null,
      format: parsed.data.format ?? null,
      alt: parsed.data.alt ?? null,
    },
  });

  return NextResponse.json({ asset }, { status: 201 });
}
