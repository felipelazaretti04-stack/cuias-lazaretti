import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const approved = url.searchParams.get("approved");

  const where =
    approved === "true" ? { approved: true } :
    approved === "false" ? { approved: false } : undefined;

  const reviews = await prisma.review.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { product: { select: { name: true, slug: true } } },
  });

  return NextResponse.json({ reviews });
}

const patchSchema = z.object({
  id: z.string(),
  approved: z.boolean(),
});

export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const review = await prisma.review.update({
    where: { id: parsed.data.id },
    data: { approved: parsed.data.approved },
  });

  return NextResponse.json({ ok: true, review });
}
