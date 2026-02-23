import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";

  const schema = z.object({ status: z.enum(["PENDING", "PAID", "CANCELLED", "SHIPPED"]).optional() });
  const parsed = schema.safeParse({ status: status || undefined });
  if (!parsed.success) return NextResponse.json({ error: "Filtro inválido" }, { status: 400 });

  const orders = await prisma.order.findMany({
    where: parsed.data.status ? { status: parsed.data.status as any } : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { customer: true },
  });

  return NextResponse.json({ orders });
}
