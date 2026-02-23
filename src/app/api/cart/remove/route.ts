import { NextResponse } from "next/server";
import { z } from "zod";
import { getCart, setCart } from "@/lib/cart";

const schema = z.object({ variantId: z.string() });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const cart = await getCart();
  cart.items = cart.items.filter((i) => i.variantId !== parsed.data.variantId);
  await setCart(cart);

  return NextResponse.json({ ok: true, cart });
}
