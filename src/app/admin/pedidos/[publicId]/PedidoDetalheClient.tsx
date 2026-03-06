"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { StatusPill } from "@/components/admin/StatusPill";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orderLabels";

type Order = any;

export default function PedidoDetalheClient({ publicId }: { publicId: string }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState("PENDING");
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const res = await fetch(`/api/admin/pedidos/${publicId}`);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || `Falha ao carregar pedido (${res.status})`);
      return;
    }
    const data = await res.json();
    setOrder(data.order);
    setStatus(data.order.status);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicId]);

  async function updateStatus() {
    setLoading(true);
    setErr(null);
    const res = await fetch(`/api/admin/pedidos/${publicId}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao atualizar");
      return;
    }
    await load();
  }

  async function syncPayment() {
    setSyncing(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/orders/${publicId}/sync-payment`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Falha ao sincronizar");
      } else if (data.paid) {
        alert("✅ Pagamento confirmado e estoque atualizado!");
      } else {
        alert(`Status do pagamento: ${data.status || "não aprovado"}`);
      }
      await load();
    } catch (e: any) {
      setErr(e?.message || "Erro ao sincronizar");
    } finally {
      setSyncing(false);
    }
  }

  function openWhatsApp() {
    if (!order) return;
    const phone = (order.customerPhone || "").replace(/\D/g, "");
    if (!phone) {
      alert("Cliente sem telefone cadastrado");
      return;
    }
    const msg = encodeURIComponent(
      `Olá, ${order.customerName || "cliente"}! ` +
      `Seu pedido *${order.publicId}* na Cuias Lazaretti foi recebido ✅\n` +
      `Status: ${orderStatusLabel(order.status)}\n` +
      `Total: ${(order.totalCents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}\n\n` +
      `Qualquer dúvida, estamos à disposição!`
    );
    window.open(`https://wa.me/55${phone}?text=${msg}`, "_blank");
  }

  if (!order) {
    return (
      <div className="container py-8">
        <div className="card p-6">Carregando...</div>
        {err ? <div className="container mt-3 text-sm text-red-700">{err}</div> : null}
      </div>
    );
  }

  const formatBRL = (cents: number) =>
    (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const showSyncButton = order.status !== "PAID" && (order.mpPaymentId || order.mpPreferenceId);

  return (
    <div className="container py-8">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs text-[hsl(var(--muted))]">Pedido</div>
            <div className="text-2xl font-semibold">{order.publicId}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              <StatusPill status={order.status} />
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                Pagamento: {paymentStatusLabel(order.paymentStatus)}
              </span>
            </div>

            {/* Botões de ação */}
            <div className="mt-4 flex flex-wrap gap-2">
              {showSyncButton && (
                <Button
                  onClick={syncPayment}
                  disabled={syncing}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {syncing ? "Sincronizando..." : "🔄 Sincronizar pagamento MP"}
                </Button>
              )}
              <Button
                onClick={openWhatsApp}
                className="bg-green-600 hover:bg-green-700"
              >
                💬 WhatsApp
              </Button>
            </div>
          </div>

          <div className="min-w-[260px] rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">Atualizar status</div>
            <div className="mt-2 flex gap-2">
              <Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PENDING">{orderStatusLabel("PENDING")}</option>
                <option value="PAID">{orderStatusLabel("PAID")}</option>
                <option value="SHIPPED">{orderStatusLabel("SHIPPED")}</option>
                <option value="CANCELLED">{orderStatusLabel("CANCELLED")}</option>
              </Select>
              <Button disabled={loading} onClick={updateStatus}>
                {loading ? "..." : "Salvar"}
              </Button>
            </div>
            {err ? <div className="mt-2 text-xs text-red-700">{err}</div> : null}
          </div>
        </div>

        {/* resto do componente continua igual... */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">Cliente</div>
            <div className="mt-2 text-sm">
              <div>
                <span className="text-[hsl(var(--muted))]">Nome:</span> {order.customerName || order.customer?.name || "-"}
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">Email:</span> {order.customerEmail || order.customer?.email || "-"}
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">WhatsApp:</span> {order.customerPhone || order.customer?.phone || "-"}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">Entrega</div>
            <div className="mt-2 text-sm">
              <div>
                <span className="text-[hsl(var(--muted))]">Método:</span> {order.shippingMethod || "-"}
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">Serviço:</span> {order.shippingServiceName || "-"}
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">Provider:</span> {order.shippingProvider || "-"}
              </div>
              <div>
                <span className="text-[hsl(var(--muted))]">Frete:</span>{" "}
                {formatBRL(order.shippingCostCents || 0)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-sm font-semibold">Itens</div>
          <div className="mt-3 space-y-2">
            {(order.items || []).map((it: any) => (
              <div key={it.id} className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-medium">
                    {it.productName || it.variant?.product?.name || it.product?.name || "Item"}
                  </div>
                  <div className="text-xs text-[hsl(var(--muted))]">
                    {it.variantLabel ? `${it.variantLabel} • ` : ""}
                    SKU: {it.sku || it.variant?.sku || "-"} • Qtd: {it.qty || 1}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  {formatBRL(it.lineTotalCents ?? (it.unitPriceCents ?? 0) * (it.qty ?? 1))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-[hsl(var(--border))] pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[hsl(var(--muted))]">Subtotal</span>
              <span className="font-medium">{formatBRL(order.subtotalCents || 0)}</span>
            </div>
            <div className="mt-1 flex justify-between">
              <span className="text-[hsl(var(--muted))]">Frete</span>
              <span className="font-medium">{formatBRL(order.shippingCostCents || 0)}</span>
            </div>
            <div className="mt-2 flex justify-between text-base">
              <span className="font-semibold">Total</span>
              <span className="font-semibold">{formatBRL(order.totalCents || 0)}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-sm font-semibold">Eventos de pagamento (últimos 20)</div>
          <div className="mt-2 text-xs text-[hsl(var(--muted))]">
            Útil para validar idempotência do webhook em produção.
          </div>
          <div className="mt-3 space-y-2">
            {(order.paymentEvents || []).map((ev: any) => (
              <div key={ev.id} className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-3">
                <div className="text-xs text-[hsl(var(--muted))]">
                  {new Date(ev.receivedAt).toLocaleString("pt-BR")}
                </div>
                <div className="text-sm font-medium">
                  {ev.provider} • {ev.externalId}
                </div>
                <div className="text-xs text-[hsl(var(--muted))]">type: {ev.type || "-"}</div>
              </div>
            ))}
            {(!order.paymentEvents || order.paymentEvents.length === 0) ? (
              <div className="text-sm text-[hsl(var(--muted))]">Nenhum evento ainda.</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
