// file: src/app/(shop)/meus-pedidos/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type OrderItem = {
  publicId: string;
  createdAt: string;
  status: string;
  totalCents: number;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function statusLabel(status: string) {
  switch (status) {
    case "PAID":
      return "Pago";
    case "SHIPPED":
      return "Enviado";
    case "CANCELLED":
      return "Cancelado";
    default:
      return "Pendente";
  }
}

export default function MeusPedidosPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    setSearched(false);

    const res = await fetch("/api/orders/by-email", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: email.trim().toLowerCase() }),
    });

    setLoading(false);
    setSearched(true);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setOrders([]);
      setErr(data?.error || "Não foi possível localizar pedidos");
      return;
    }

    setOrders(data.orders || []);
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Meus pedidos</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Digite o e-mail usado na compra para visualizar seus pedidos.
        </p>

        <form onSubmit={handleSearch} className="mt-6 card p-6">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
            <div className="space-y-2">
              <Label>E-mail da compra</Label>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
              />
            </div>

            <Button type="submit" disabled={loading}>
              {loading ? "Buscando..." : "Buscar pedidos"}
            </Button>
          </div>

          {err ? (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {err}
            </div>
          ) : null}
        </form>

        {searched && orders.length > 0 ? (
          <div className="mt-6 space-y-3">
            {orders.map((order) => (
              <div key={order.publicId} className="card p-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-semibold">{order.publicId}</div>
                    <div className="mt-1 text-sm text-[hsl(var(--muted))]">
                      {new Date(order.createdAt).toLocaleString("pt-BR")}
                    </div>
                  </div>

                  <div className="text-sm">
                    <div>Status: <b>{statusLabel(order.status)}</b></div>
                    <div>Total: <b>{formatBRL(order.totalCents)}</b></div>
                  </div>

                  <Link
                    href={`/pedido/${order.publicId}`}
                    className="inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
                  >
                    Acompanhar pedido
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {searched && !loading && orders.length === 0 && !err ? (
          <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-white p-6 text-sm text-[hsl(var(--muted))]">
            Nenhum pedido encontrado para este e-mail.
          </div>
        ) : null}
      </div>
    </div>
  );
}
