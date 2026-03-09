// file: src/app/api/checkout/address-by-cep/route.ts
import { NextResponse } from "next/server";

function onlyDigits(value: string) {
  return (value || "").replace(/\D/g, "");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const cep = onlyDigits(body?.cep || "");

  if (cep.length !== 8) {
    return NextResponse.json({ error: "CEP inválido" }, { status: 400 });
  }

  const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json({ error: "Falha ao consultar CEP" }, { status: 502 });
  }

  const data = await res.json().catch(() => null);

  if (!data || data.erro) {
    return NextResponse.json({ error: "CEP não encontrado" }, { status: 404 });
  }

  return NextResponse.json({
    cep: data.cep || cep,
    addressLine: data.logradouro || "",
    district: data.bairro || "",
    city: data.localidade || "",
    uf: data.uf || "",
    complement: data.complemento || "",
  });
}
