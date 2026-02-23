import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: { orders: { select: { id: true, publicId: true, status: true, totalCents: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 5 } },
  });

  return NextResponse.json({ customers });
}
