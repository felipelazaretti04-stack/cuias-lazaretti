// file: src/app/api/orders/lookup/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({
  publicId: z.string().trim().min(3),
  email: z.string().trim().email(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const publicId = parsed.data.publicId.trim();
  const email = parsed.data.email.trim().toLowerCase();

  const order = await prisma.order.findFirst({
    where: {
      publicId,
      customerEmail: {
        equals: email,
        mode: "insensitive",
      },
    },
    select: {
      publicId: true,
    },
  });

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ publicId: order.publicId });
}
