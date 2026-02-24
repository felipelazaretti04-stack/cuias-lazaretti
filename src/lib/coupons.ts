import { prisma } from "@/lib/prisma";

export async function validateCoupon(codeRaw: string) {
  const code = (codeRaw || "").trim().toUpperCase();
  if (!code) return { ok: false as const, reason: "Cupom vazio" };

  const coupon = await prisma.coupon.findUnique({ where: { code } });
  if (!coupon) return { ok: false as const, reason: "Cupom inválido" };
  if (!coupon.active) return { ok: false as const, reason: "Cupom inativo" };
  if (coupon.expiresAt && coupon.expiresAt < new Date()) return { ok: false as const, reason: "Cupom expirado" };
  if (coupon.maxUses != null && coupon.usesCount >= coupon.maxUses) return { ok: false as const, reason: "Cupom esgotado" };

  return { ok: true as const, coupon };
}

export function computeDiscountCents(input: {
  subtotalCents: number;
  type: "PERCENTAGE" | "FIXED";
  value: number;
}) {
  const subtotal = Math.max(0, input.subtotalCents);
  if (subtotal <= 0) return 0;

  if (input.type === "PERCENTAGE") {
    const pct = Math.max(0, Math.min(100, input.value));
    return Math.min(subtotal, Math.round((subtotal * pct) / 100));
  }

  // FIXED é em cents
  const fixed = Math.max(0, input.value);
  return Math.min(subtotal, fixed);
}
