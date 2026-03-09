// file: src/app/api/checkout/quote-shipping/route.ts
import { NextResponse } from "next/server";
import { quoteShipping, quoteShippingInputSchema } from "@/lib/shipping";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);

  const parsed = quoteShippingInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { method, cep } = parsed.data;

  if (method === "PAC" && (!cep || cep.replace(/\D/g, "").length !== 8)) {
    return NextResponse.json({ error: "Informe um CEP válido" }, { status: 400 });
  }

  const options = await quoteShipping({ method, cep });
  return NextResponse.json({ options });
}
