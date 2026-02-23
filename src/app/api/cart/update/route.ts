import { NextResponse } from "next/server";
import { z } from "zod";
import { getCart, setCart } from "@/lib/cart";

const schema = z.object({
  variantId: z.string(),
  qty: z.coerce.number().int().min(1).max(20),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const cart = await getCart();
  const idx = cart.items.findIndex((i) => i.variantId === parsed.data.variantId);
  if (idx < 0) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

  cart.items[idx].qty = parsed.data.qty;
  await setCart(cart);
  return NextResponse.json({ ok: true, cart });
}
