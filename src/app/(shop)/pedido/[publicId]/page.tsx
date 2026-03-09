// file: src/app/(shop)/pedido/[publicId]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { TrackEvent } from "@/components/shop/TrackEvent";
import { orderStatusLabel } from "@/lib/orderStatus";

export const dynamic = "force-dynamic";

type SP = { [key: string]: string | string[] | undefined };

const pick = (sp: SP, key: string) =>
  (Array.isArray(sp[key]) ? sp[key]?.[0] : sp[key]) ?? "";

function getStatusUi(status: string) {
  switch (status) {
    case "PAID":
      return {
        badge: "bg-green-100 text-green-700 border-green-200",
        title: "Pagamento confirmado",
        message:
          "Recebemos seu pagamento com sucesso. Agora seu pedido está em preparação.",
      };
    case "SHIPPED":
      return {
        badge: "bg-blue-100 text-blue-700 border-blue-200",
        title: "Pedido enviado",
        message:
          "Seu pedido já foi enviado. Se precisar de ajuda, fale com a nossa equipe.",
      };
    case "CANCELLED":
      return {
        badge: "bg-red-100 text-red-700 border-red-200",
        title: "Pedido cancelado",
        message:
          "Este pedido foi cancelado. Se precisar, fale com a loja para suporte.",
      };
    case "PENDING":
    default:
      return {
        badge: "bg-yellow-100 text-yellow-800 border-yellow-200",
        title: "Aguardando confirmação",
        message:
          "Estamos aguardando a confirmação do pagamento. Se você acabou de pagar, aguarde alguns instantes e atualize a página.",
      };
  }
}

function getPaymentLabel(paymentStatus: string) {
  switch (paymentStatus) {
    case "APPROVED":
      return "Aprovado";
    case "REJECTED":
      return "Recusado";
    case "CANCELLED":
      return "Cancelado";
    case "REFUNDED":
      return "Reembolsado";
    case "PENDING":
      return "Pendente";
    default:
      return "Em análise";
  }
}

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ publicId: string }>;
  searchParams: Promise<SP>;
}) {
  const { publicId } = await params;
  const sp = await searchParams;

  const paymentId = pick(sp, "payment_id") || pick(sp, "collection_id");
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(/\/+$/, "");

  let order = await prisma.order.findUnique({
    where: { publicId },
    include: { items: true },
  });

  if (!order) return notFound();

  if (paymentId && order.status !== "PAID") {
    await fetch(`${appUrl}/api/checkout/confirm`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        paymentId,
        external_reference: publicId,
      }),
    }).catch(() => null);

    order = await prisma.order.findUnique({
      where: { publicId },
      include: { items: true },
    });

    if (!order) return notFound();
  }

  const isPaid = order.status === "PAID";
  const statusUi = getStatusUi(order.status);
  const paymentLabel = getPaymentLabel(order.paymentStatus);

  const storePhoneDigits = (process.env.NEXT_PUBLIC_STORE_WHATSAPP || "").replace(/\D/g, "");
  const whatsappMessage = encodeURIComponent(
    [
      `Olá! Tenho uma dúvida sobre meu pedido *${order.publicId}* da Cuias Lazaretti.`,
      `Status atual: *${orderStatusLabel(order.status)}*`,
      `Total: *${formatBRL(order.totalCents)}*`,
      "",
      "Podem me ajudar?",
    ].join("\n")
  );

  const whatsappHref = storePhoneDigits
    ? `https://wa.me/${storePhoneDigits}?text=${whatsappMessage}`
    : `/contato`;

  return (
    <div className="container py-10">
      {isPaid ? (
        <TrackEvent
          event="Purchase"
          payload={{ value: order.totalCents / 100, currency: "BRL" }}
        />
      ) : null}

      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-[hsl(var(--muted))]">
                Pedido
              </div>
              <h1 className="mt-1 text-3xl font-semibold">{order.publicId}</h1>
              <p className="mt-2 text-sm text-[hsl(var(--muted))]">
                Feito em {new Date(order.createdAt).toLocaleString("pt-BR")}
              </p>
            </div>

            <div
              className={`rounded-2xl border px-4 py-3 text-sm font-medium ${statusUi.badge}`}
            >
              {orderStatusLabel(order.status)}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-5">
            <div className="text-lg font-semibold">{statusUi.title}</div>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">{statusUi.message}</p>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <div className="text-xs text-[hsl(var(--muted))]">Status do pedido</div>
                <div className="mt-1 font-semibold">{orderStatusLabel(order.status)}</div>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <div className="text-xs text-[hsl(var(--muted))]">Pagamento</div>
                <div className="mt-1 font-semibold">{paymentLabel}</div>
              </div>

              <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <div className="text-xs text-[hsl(var(--muted))]">Entrega</div>
                <div className="mt-1 font-semibold">
                  {order.shippingServiceName || order.shippingMethod || "A combinar"}
                </div>
              </div>
            </div>
          </div>

          {order.status === "PENDING" ? (
            <div className="mt-4 rounded-2xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
              Se você já fez o Pix, a confirmação pode levar alguns instantes. Atualize esta página em seguida.
            </div>
          ) : null}
        </div>

        <div className="grid gap-6 md:grid-cols-[1.5fr,1fr]">
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Itens do pedido</div>

            <div className="mt-4 space-y-4">
              {order.items.map((it) => (
                <div
                  key={it.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-[hsl(var(--border))] p-4"
                >
                  <div>
                    <div className="font-medium">{it.productName}</div>
                    <div className="mt-1 text-sm text-[hsl(var(--muted))]">
                      {it.variantLabel ? `${it.variantLabel} • ` : ""}
                      Quantidade: {it.qty}
                    </div>
                    <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                      Valor unitário: {formatBRL(it.unitPriceCents)}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm text-[hsl(var(--muted))]">Total item</div>
                    <div className="font-semibold">{formatBRL(it.lineTotalCents)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">Resumo</div>

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted))]">Subtotal</span>
                  <span>{formatBRL(order.subtotalCents)}</span>
                </div>

                {order.discountCents > 0 ? (
                  <div className="flex justify-between">
                    <span className="text-[hsl(var(--muted))]">Desconto</span>
                    <span className="text-green-700">- {formatBRL(order.discountCents)}</span>
                  </div>
                ) : null}

                <div className="flex justify-between">
                  <span className="text-[hsl(var(--muted))]">Frete</span>
                  <span>{formatBRL(order.shippingCostCents)}</span>
                </div>

                <div className="border-t border-[hsl(var(--border))] pt-3">
                  <div className="flex justify-between text-base font-semibold">
                    <span>Total</span>
                    <span>{formatBRL(order.totalCents)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NOVO - Card de Rastreio */}
            {order.trackingCode || order.trackingUrl ? (
              <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
                <div className="text-lg font-semibold">Rastreio</div>

                <div className="mt-4 space-y-3 text-sm">
                  {order.trackingCode ? (
                    <div>
                      <div className="text-xs text-[hsl(var(--muted))]">Código de rastreio</div>
                      <div className="font-medium">{order.trackingCode}</div>
                    </div>
                  ) : null}

                  {order.trackingUrl ? (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
                    >
                      Acompanhar entrega
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {/* Resto continua igual... */}
            <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
              <div className="text-lg font-semibold">Cliente e entrega</div>
              {/* ... */}
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Cliente e entrega</div>

            <div className="mt-4 space-y-3 text-sm">
              <div>
                <div className="text-xs text-[hsl(var(--muted))]">Cliente</div>
                <div className="font-medium">{order.customerName || "Não informado"}</div>
              </div>

              <div>
                <div className="text-xs text-[hsl(var(--muted))]">E-mail</div>
                <div className="font-medium">{order.customerEmail || "Não informado"}</div>
              </div>

              <div>
                <div className="text-xs text-[hsl(var(--muted))]">WhatsApp</div>
                <div className="font-medium">{order.customerPhone || "Não informado"}</div>
              </div>

              <div>
                <div className="text-xs text-[hsl(var(--muted))]">Método de entrega</div>
                <div className="font-medium">{order.shippingMethod || "Não informado"}</div>
              </div>

              <div>
                <div className="text-xs text-[hsl(var(--muted))]">Transportadora / serviço</div>
                <div className="font-medium">
                  {order.shippingServiceName || order.shippingProvider || "Não informado"}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
            <div className="text-lg font-semibold">Precisa de ajuda?</div>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              Se tiver qualquer dúvida sobre seu pedido, fale com a nossa equipe.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href={whatsappHref}
                target="_blank"
                className="rounded-xl bg-green-600 px-4 py-2 text-sm font-medium text-white"
              >
                Falar no WhatsApp
              </Link>

              <Link
                href="/produtos"
                className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
