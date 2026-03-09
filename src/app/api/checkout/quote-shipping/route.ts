import { NextResponse } from "next/server";
import { quoteShipping, quoteShippingInputSchema } from "@/lib/shipping";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  
  // DEBUG temporário
  console.log("quote-shipping body recebido:", body);
  
  const parsed = quoteShippingInputSchema.safeParse(body);
  if (!parsed.success) {
    console.log("quote-shipping validação falhou:", parsed.error.flatten());
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const { method, cep } = parsed.data;
  if (method === "PAC" && (!cep || cep.replace(/\D/g, "").length !== 8)) {
    console.log("quote-shipping CEP inválido:", cep);
    return NextResponse.json({ error: "Informe um CEP válido" }, { status: 400 });
  }

  const options = await quoteShipping({ method, cep });
  return NextResponse.json({ options });
}
