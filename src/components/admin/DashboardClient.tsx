// file: src/components/admin/DashboardClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatBRL } from "@/lib/money";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/orderLabels";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type DashboardData = {
  range: { from: string; to: string };
  kpis: {
    pendingCount: number;
    paidCount: number;
    shippedCount: number;
    cancelledCount: number;
    revenueMonthCents: number;
    paidMonthCount: number;
    ticketAvgCents: number;
  };
  series: { day: number; revenueCents: number; orders: number }[];
  lastOrders: {
    id: string;
    publicId: string;
    status: any;
    paymentStatus: any;
    totalCents: number | null;
    createdAt: string;
    customerEmail: string | null;
    customerName: string | null;
  }[];
};

function centsToBRL(cents: number) {
  return formatBRL(cents);
}

export function DashboardClient() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then(async (r) => {
        if (!r.ok) {
          const d = await r.json().catch(() => null);
          throw new Error(d?.error || "Falha ao carregar dashboard");
        }
        return r.json();
      })
      .then((d) => setData(d))
      .catch((e) => setErr(e?.message || "Erro"));
  }, []);

  const chartData = useMemo(() => {
    if (!data) return [];
    return data.series.map((p) => ({
      day: String(p.day),
      revenue: Number((p.revenueCents || 0) / 100),
      orders: p.orders || 0,
    }));
  }, [data]);

  if (err) {
    return <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>;
  }

  if (!data) {
    return <div className="text-sm text-[hsl(var(--muted))]">Carregando dashboard...</div>;
  }

  return (
    <div className="grid gap-4">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link className="card p-5 hover:opacity-95" href="/admin/pedidos?status=PENDING">
          <div className="text-xs text-[hsl(var(--muted))]">Pendentes</div>
          <div className="mt-2 text-2xl font-semibold">{data.kpis.pendingCount}</div>
        </Link>

        <Link className="card p-5 hover:opacity-95" href="/admin/pedidos?status=PAID">
          <div className="text-xs text-[hsl(var(--muted))]">Pagos</div>
          <div className="mt-2 text-2xl font-semibold">{data.kpis.paidCount}</div>
        </Link>

        <div className="card p-5">
          <div className="text-xs text-[hsl(var(--muted))]">Faturamento (mês)</div>
          <div className="mt-2 text-2xl font-semibold">{centsToBRL(data.kpis.revenueMonthCents)}</div>
          <div className="mt-1 text-[11px] text-[hsl(var(--muted))]">
            Ticket médio: {centsToBRL(data.kpis.ticketAvgCents)}
          </div>
        </div>

        <Link className="card p-5 hover:opacity-95" href="/admin/pedidos?status=SHIPPED">
          <div className="text-xs text-[hsl(var(--muted))]">Enviados</div>
          <div className="mt-2 text-2xl font-semibold">{data.kpis.shippedCount}</div>
          <div className="mt-1 text-[11px] text-[hsl(var(--muted))]">
            Cancelados: {data.kpis.cancelledCount}
          </div>
        </Link>
      </div>

      {/* Chart */}
      <div className="card p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Faturamento diário (mês atual)</div>
            <div className="mt-1 text-xs text-[hsl(var(--muted))]">
              Baseado em pedidos com status <b>PAID</b>.
            </div>
          </div>
          <div className="text-[11px] text-[hsl(var(--muted))]">
            {new Date(data.range.from).toLocaleDateString("pt-BR")} – {new Date(data.range.to).toLocaleDateString("pt-BR")}
          </div>
        </div>

        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--gold))" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="hsl(var(--gold))" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis dataKey="day" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={40} />
              <Tooltip
                formatter={(value: any, name: any) => {
                  if (name === "revenue") return [`R$ ${Number(value).toFixed(2).replace(".", ",")}`, "Faturamento"];
                  if (name === "orders") return [value, "Pedidos"];
                  return [value, name];
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="hsl(var(--gold))" fill="url(#rev)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Last orders */}
      <div className="card p-5">
        <div className="flex items-end justify-between gap-2">
          <div>
            <div className="text-sm font-semibold">Últimos pedidos</div>
            <div className="mt-1 text-xs text-[hsl(var(--muted))]">Visão rápida (status em PT-BR).</div>
          </div>
          <Link href="/admin/pedidos" className="text-xs underline">
            Ver todos
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-[720px] w-full text-sm">
            <thead className="text-left text-xs text-[hsl(var(--muted))]">
              <tr>
                <th className="py-2">Pedido</th>
                <th className="py-2">Cliente</th>
                <th className="py-2">Status</th>
                <th className="py-2">Pagamento</th>
                <th className="py-2">Total</th>
                <th className="py-2">Data</th>
              </tr>
            </thead>
            <tbody>
              {data.lastOrders.map((o) => (
                <tr key={o.id} className="border-t border-[hsl(var(--border))]">
                  <td className="py-2">
                    <Link className="underline" href={`/admin/pedidos/${o.publicId}`}>
                      #{o.publicId}
                    </Link>
                  </td>
                  <td className="py-2">{o.customerName || o.customerEmail || "—"}</td>
                  <td className="py-2">{orderStatusLabel(o.status)}</td>
                  <td className="py-2">{paymentStatusLabel(o.paymentStatus)}</td>
                  <td className="py-2">{centsToBRL(o.totalCents || 0)}</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
