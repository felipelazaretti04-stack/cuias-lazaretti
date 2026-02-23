import { z } from "zod";

export const quoteShippingInputSchema = z.object({
  method: z.enum(["PICKUP", "PAC"]),
  cep: z.string().optional(), // obrigatório no PAC
});

export type ShippingOption = {
  method: "PICKUP" | "PAC";
  provider: "MELHORENVIO" | "FALLBACK";
  serviceName: string;
  priceCents: number;
  deliveryDays?: number;
  debugMessage?: string;
};

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

export async function quotePACWithMelhorEnvio(cep: string, weightKg = 0.6) {
  const token = process.env.MELHORENVIO_TOKEN;
  const fromCep = process.env.MELHORENVIO_FROM_CEP;
  const env = process.env.MELHORENVIO_ENV || "production";

  if (!token || !fromCep) throw new Error("MELHORENVIO_TOKEN ou MELHORENVIO_FROM_CEP ausente");

  // endpoints (Melhor Envio): sandbox/production
  const base =
    env === "production"
      ? "https://www.melhorenvio.com.br"
      : "https://sandbox.melhorenvio.com.br";

  const toCep = onlyDigits(cep);
  const from = onlyDigits(fromCep);
  if (toCep.length !== 8) throw new Error("CEP inválido");

  // 1 pacote padrão por pedido (MVP)
  const payload = {
    from: { postal_code: from },
    to: { postal_code: toCep },
    products: [
      {
        id: "cart",
        width: 16,
        height: 12,
        length: 22,
        weight: Number(weightKg.toFixed(2)), // kg
        insurance_value: 150, // R$ (ajuste no Bloco C se quiser por total)
        quantity: 1,
      },
    ],
    options: {
      receipt: false,
      own_hand: false,
      collect: false,
    },
  };

  const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
      "user-agent": "CuiasLazaretti/1.0",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Melhor Envio falhou (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();

  // Melhor Envio retorna array de serviços; buscamos "PAC" quando existir.
  // Estrutura pode variar; defensivo:
  const services: any[] = Array.isArray(data) ? data : Array.isArray(data?.services) ? data.services : data;

  const pac = services?.find((s) => {
    const name = String(s?.name || s?.service || "").toUpperCase();
    return name.includes("PAC");
  });

  if (!pac) throw new Error("Serviço PAC não retornado pelo Melhor Envio");

  const price = Number(pac?.price ?? pac?.cost ?? pac?.value ?? 0);
  const deliveryDays = Number(pac?.delivery_time ?? pac?.deliveryTime ?? pac?.deadline ?? NaN);

  if (!Number.isFinite(price) || price <= 0) throw new Error("Preço inválido do Melhor Envio");

  return {
    provider: "MELHORENVIO" as const,
    serviceName: "PAC",
    priceCents: Math.round(price * 100),
    deliveryDays: Number.isFinite(deliveryDays) ? deliveryDays : undefined,
  };
}

export async function quoteShipping(input: { method: "PICKUP" | "PAC"; cep?: string | undefined | null }) {
  if (input.method === "PICKUP") {
    const opt: ShippingOption = {
      method: "PICKUP",
      provider: "FALLBACK",
      serviceName: "Retirada em Erechim/RS",
      priceCents: 0,
    };
    return [opt];
  }

  // PAC
  const cep = input.cep || "";
  try {
    const pac = await quotePACWithMelhorEnvio(cep);
    const opt: ShippingOption = {
      method: "PAC",
      provider: pac.provider,
      serviceName: pac.serviceName,
      priceCents: pac.priceCents,
      deliveryDays: pac.deliveryDays,
    };
    return [opt];
  } catch (e: any) {
    // fallback tabela simples (MVP)
    const msg = e?.message ? String(e.message) : "Falha desconhecida";
    const opt: ShippingOption = {
      method: "PAC",
      provider: "FALLBACK",
      serviceName: "PAC (estimativa)",
      priceCents: 2490, // R$ 24,90 fixo no fallback MVP
      deliveryDays: 7,
      debugMessage: msg,
    };
    return [opt];
  }
}
