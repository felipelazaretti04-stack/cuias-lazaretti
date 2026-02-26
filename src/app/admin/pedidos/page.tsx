import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { StatusPill } from "@/components/admin/StatusPill";
import { formatBRL } from "@/lib/money";
import { orderStatusLabel } from "@/lib/orderStatus";

export default async function AdminPedidosPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = (sp.status || "").toUpperCase();

  const where =
    status === "PENDING" || status === "PAID" || status === "CANCELLED" || status === "SHIPPED"
      ? { status: status as any }
      : undefined;

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: { customer: true },
  });

  const tabs = ["PENDING", "PAID", "SHIPPED", "CANCELLED"] as const;

  return (
    <AdminShell title="Pedidos">
      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/pedidos"
          className={`rounded-xl border px-3 py-1.5 text-xs ${!where ? "bg-[hsl(var(--accent))] border-[hsl(var(--border))]" : "bg-white border-[hsl(var(--border))]"}`}
        >
          Todos
        </Link>
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/pedidos?status=${t}`}
            className={`rounded-xl border px-3 py-1.5 text-xs ${status === t ? "bg-[hsl(var(--accent))] border-[hsl(var(--border))]" : "bg-white border-[hsl(var(--border))]"}`}
          >
            {t}
          </Link>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[hsl(var(--muted))]">
              <th className="py-2">Pedido</th>
              <th>Status</th>
              <th>Cliente</th>
              <th>Total</th>
              <th>Criado</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-t border-[hsl(var(--border))]">
                <td className="py-3">
                  <Link className="font-medium underline" href={`/admin/pedidos/${o.publicId}`}>
                    {o.publicId}
                  </Link>
                </td>
                <td><StatusPill status={o.status} /></td>
                <td className="text-[hsl(var(--muted))]">
                  {o.customerName || o.customer?.name || "-"}<br />
                  <span className="text-xs">{o.customerEmail || o.customer?.email || ""}</span>
                </td>
                <td>{formatBRL(o.totalCents)}</td>
                <td className="text-[hsl(var(--muted))]">{new Date(o.createdAt).toLocaleString("pt-BR")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
