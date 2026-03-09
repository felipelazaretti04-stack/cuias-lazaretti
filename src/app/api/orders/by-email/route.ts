// file: src/app/api/orders/by-email/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  email: z.string().trim().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "E-mail inválido" }, { status: 400 });
  }

  const email = parsed.data.email.trim().toLowerCase();

  const orders = await prisma.order.findMany({
    where: {
      customerEmail: {
        equals: email,
        mode: "insensitive",
      },
    },
    orderBy: { createdAt: "desc" },
    select: {
      publicId: true,
      createdAt: true,
      status: true,
      totalCents: true,
    },
    take: 20,
  });

  return NextResponse.json({ orders });
}
