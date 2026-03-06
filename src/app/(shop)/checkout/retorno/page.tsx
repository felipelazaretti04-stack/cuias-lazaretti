// file: src/app/checkout/retorno/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type ConfirmState = {
  loading: boolean;
  ok: boolean;
  paid: boolean;
  status: string;
  orderPublicId?: string;
  error?: string;
};

export default function CheckoutRetornoPage() {
  const [state, setState] = useState<ConfirmState>({
    loading: true,
    ok: false,
    paid: false,
    status: "processing",
  });

  const params = useMemo(() => {
    if (typeof window === "undefined") return null;
    const url = new URL(window.location.href);

    return {
      paymentId:
        url.searchParams.get("payment_id") ||
        url.searchParams.get("collection_id") ||
        "",
      collectionId: url.searchParams.get("collection_id") || "",
      status: url.searchParams.get("status") || "",
      externalReference: url.searchParams.get("external_reference") || "",
      merchantOrderId: url.searchParams.get("merchant_order_id") || "",
      preferenceId: url.searchParams.get("preference_id") || "",
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function run() {
      if (!params) return;

      try {
        const res = await fetch("/api/checkout/confirm", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            paymentId: params.paymentId,
            collection_id: params.collectionId,
            external_reference: params.externalReference,
            status: params.status,
            merchant_order_id: params.merchantOrderId,
            preference_id: params.preferenceId,
          }),
        });

        const data = await res.json().catch(() => null);

        if (!active) return;

        if (!res.ok) {
          setState({
            loading: false,
            ok: false,
            paid: false,
            status: params.status || "error",
            error: data?.error || "Falha ao confirmar pagamento",
          });
          return;
        }

        setState({
          loading: false,
          ok: true,
          paid: !!data?.paid,
          status: String(data?.status || params.status || "processing"),
          orderPublicId: data?.orderPublicId || params.externalReference || undefined,
        });
      } catch (e: any) {
        if (!active) return;
        setState({
          loading: false,
          ok: false,
          paid: false,
          status: params.status || "error",
          error: e?.message || "Erro inesperado ao confirmar pagamento",
        });
      }
    }

    run();
    return () => {
      active = false;
    };
  }, [params]);

  return (
    <main className="container py-10">
      <div className="mx-auto max-w-2xl rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Retorno do pagamento</h1>

        {state.loading ? (
          <div className="mt-4">
            <p className="text-sm text-[hsl(var(--muted))]">
              Confirmando seu pagamento com segurança...
            </p>
          </div>
        ) : state.paid ? (
          <div className="mt-4">
            <p className="text-green-700 font-medium">
              ✅ Pagamento aprovado com sucesso.
            </p>
            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              Seu pedido já foi confirmado e está sendo preparado.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {state.orderPublicId ? (
                <Link
                  href={`/pedido/${state.orderPublicId}`}
                  className="rounded-xl bg-black px-4 py-2 text-white"
                >
                  Ver meu pedido
                </Link>
              ) : null}
              <Link
                href="/produtos"
                className="rounded-xl border border-[hsl(var(--border))] px-4 py-2"
              >
                Continuar comprando
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-4">
            <p className="font-medium">
              Status do pagamento:{" "}
              <span className="uppercase">{state.status || "processing"}</span>
            </p>

            <p className="mt-2 text-sm text-[hsl(var(--muted))]">
              Se o pagamento já foi feito, aguarde alguns instantes e atualize a página do pedido.
            </p>

            {state.error ? (
              <p className="mt-3 text-sm text-red-700">{state.error}</p>
            ) : null}

            <div className="mt-6 flex flex-wrap gap-3">
              {state.orderPublicId ? (
                <Link
                  href={`/pedido/${state.orderPublicId}`}
                  className="rounded-xl bg-black px-4 py-2 text-white"
                >
                  Ver meu pedido
                </Link>
              ) : null}
              <Link
                href="/"
                className="rounded-xl border border-[hsl(var(--border))] px-4 py-2"
              >
                Voltar à loja
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
