// file: src/lib/shipping.ts
import { z } from "zod";

export const quoteShippingInputSchema = z.object({
  method: z.enum(["PICKUP", "PAC"]),
  cep: z.string().optional(),
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

function assertCep(value: string, label: string) {
  const cep = onlyDigits(value);
  if (cep.length !== 8) {
    throw new Error(`${label} inválido`);
  }
  return cep;
}

export async function quotePACWithMelhorEnvio(cep: string, weightKg = 0.6) {
  const token = process.env.MELHORENVIO_TOKEN;
  const fromCepRaw = process.env.MELHORENVIO_FROM_CEP;
  const env = process.env.MELHORENVIO_ENV || "production";

  if (!token || !fromCepRaw) {
    throw new Error("MELHORENVIO_TOKEN ou MELHORENVIO_FROM_CEP ausente");
  }

  const fromCep = assertCep(fromCepRaw, "CEP de origem");
  const toCep = assertCep(cep, "CEP de destino");

  const base =
    env === "production"
      ? "https://www.melhorenvio.com.br"
      : "https://sandbox.melhorenvio.com.br";

  const payload = {
    from: {
      postal_code: fromCep,
    },
    to: {
      postal_code: toCep,
    },
    products: [
      {
        id: "1",
        width: 16,
        height: 12,
        length: 22,
        weight: Number(weightKg.toFixed(2)),
        insurance_value: 150,
        quantity: 1,
      },
    ],
    options: {
      receipt: false,
      own_hand: false,
      collect: false,
    },
    services: "1,2",
  };

  const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "CuiasLazaretti/1.0",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const raw = await res.text().catch(() => "");

  if (!res.ok) {
    throw new Error(`Melhor Envio falhou (${res.status}): ${raw.slice(0, 300)}`);
  }

  let data: any = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    throw new Error("Resposta inválida do Melhor Envio");
  }

  const services: any[] = Array.isArray(data)
    ? data
    : Array.isArray(data?.services)
      ? data.services
      : [];

  // Filtra candidatos PAC
  const pacCandidates = services.filter((s) => {
    const name = String(s?.name || s?.service || "").toUpperCase();
    return name.includes("PAC");
  });

  console.log("ME PAC candidates:", JSON.stringify(pacCandidates, null, 2));

  // Seleciona PAC válido (sem erro e com preço > 0)
  const pac = pacCandidates.find((s) => {
    const price = Number(
      s?.price ??
      s?.custom_price ??
      s?.cost ??
      s?.value ??
      s?.discount?.price ??
      0
    );

    const hasError =
      !!s?.error ||
      !!s?.company?.error ||
      !!s?.message;

    return !hasError && Number.isFinite(price) && price > 0;
  });

  if (!pac) {
    throw new Error("PAC indisponível ou sem preço válido para este CEP");
  }

  const price = Number(
    pac?.price ??
    pac?.custom_price ??
    pac?.cost ??
    pac?.value ??
    pac?.discount?.price ??
    0
  );

  const deliveryDays = Number(
    pac?.delivery_time ??
    pac?.delivery_range?.max ??
    pac?.deliveryTime ??
    pac?.deadline ??
    NaN
  );

  console.log("Preço de extração ME:", price, "Dias de entrega:", deliveryDays);

  return {
    provider: "MELHORENVIO" as const,
    serviceName: String(pac?.name || "PAC"),
    priceCents: Math.round(price * 100),
    deliveryDays: Number.isFinite(deliveryDays) ? deliveryDays : undefined,
  };
}

export async function quoteShipping(input: {
  method: "PICKUP" | "PAC";
  cep?: string | undefined | null;
}) {
  if (input.method === "PICKUP") {
    return [
      {
        method: "PICKUP",
        provider: "FALLBACK",
        serviceName: "Retirada em Erechim/RS",
        priceCents: 0,
      } satisfies ShippingOption,
    ];
  }

  try {
    const pac = await quotePACWithMelhorEnvio(input.cep || "");
    return [
      {
        method: "PAC",
        provider: pac.provider,
        serviceName: pac.serviceName,
        priceCents: pac.priceCents,
        deliveryDays: pac.deliveryDays,
      } satisfies ShippingOption,
    ];
  } catch (e: any) {
    return [
      {
        method: "PAC",
        provider: "FALLBACK",
        serviceName: "PAC (estimativa)",
        priceCents: 2490,
        deliveryDays: 7,
        debugMessage: e?.message ? String(e.message) : "Falha desconhecida no frete",
      } satisfies ShippingOption,
    ];
  }
}
