import { NextResponse } from "next/server";
import { z } from "zod";
import { validateCoupon } from "@/lib/coupons";

const schema = z.object({ code: z.string().min(1).max(30) });

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Código inválido" }, { status: 400 });

  const result = await validateCoupon(parsed.data.code);
  if (!result.ok) return NextResponse.json({ ok: false, error: result.reason }, { status: 400 });

  return NextResponse.json({
    ok: true,
    coupon: {
      code: result.coupon.code,
      type: result.coupon.type,
      value: result.coupon.value,
    },
  });
}
