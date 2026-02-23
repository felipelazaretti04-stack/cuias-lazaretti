import { cookies } from "next/headers";
import { z } from "zod";

const CART_COOKIE = "clz_cart_v1";

export const cartItemSchema = z.object({
  variantId: z.string(),
  qty: z.number().int().min(1).max(20),
});
export const cartSchema = z.object({
  items: z.array(cartItemSchema).max(50).default([]),
});

export type Cart = z.infer<typeof cartSchema>;

export async function getCart(): Promise<Cart> {
  const jar = await cookies();
  const raw = jar.get(CART_COOKIE)?.value;
  if (!raw) return { items: [] };
  try {
    const parsed = cartSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { items: [] };
    return parsed.data;
  } catch {
    return { items: [] };
  }
}

export async function setCart(cart: Cart) {
  const jar = await cookies();
  jar.set(CART_COOKIE, JSON.stringify(cart), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export async function clearCart() {
  const jar = await cookies();
  jar.set(CART_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(0),
    path: "/",
  });
}
