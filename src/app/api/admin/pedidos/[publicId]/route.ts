import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";
import { adminUpdateOrderSchema } from "@/lib/adminValidators";

export async function GET(_: Request, ctx: { params: Promise<{ publicId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { publicId } = await ctx.params;
  const order = await prisma.order.findUnique({
    where: { publicId },
    include: {
      customer: true,
      items: {
        include: {
          variant: {
            include: { product: true },
          },
        },
      },
      paymentEvents: { orderBy: { receivedAt: "desc" }, take: 20 },
    },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ order });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ publicId: string }> }) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const parsed = adminUpdateOrderSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { publicId } = await ctx.params;

  const order = await prisma.order.update({
    where: { publicId },
    data: { status: parsed.data.status },
  });

  return NextResponse.json({ order });
}
