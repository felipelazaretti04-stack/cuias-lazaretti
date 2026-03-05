import { z } from "zod";

const mpPrefResponseSchema = z.object({
  id: z.string(),
  init_point: z.string().url().optional(),
  sandbox_init_point: z.string().url().optional(),
});

export async function createMercadoPagoPreference(input: {
  orderPublicId: string;
  items: Array<{ title: string; quantity: number; unit_price: number }>; // unit_price em BRL
  payer?: { name?: string; email?: string };
  backUrls: { success: string; pending: string; failure: string };
  notificationUrl: string;
}) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente");

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_reference: input.orderPublicId,
      items: input.items,
      payer: input.payer,
      back_urls: input.backUrls,
      auto_return: "approved",
      notification_url: input.notificationUrl,
      statement_descriptor: "CUIAS LAZARETTI",
      // Pix + Cartão (remove boleto)
      payment_methods: {
        excluded_payment_types: [{ id: "ticket" }],
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MP preference falhou (${res.status}): ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  const parsed = mpPrefResponseSchema.safeParse(data);
  if (!parsed.success) throw new Error("Resposta inválida do Mercado Pago");

  return parsed.data;
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente");

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`MP payment fetch falhou (${res.status}): ${text.slice(0, 200)}`);
  }

  return res.json();
}
