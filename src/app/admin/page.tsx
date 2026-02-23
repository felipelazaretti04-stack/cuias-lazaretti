import { AdminShell } from "@/components/admin/AdminShell";
import { StatCard } from "@/components/admin/StatCard";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";


export default async function AdminHome() {
  const [pending, paid, shipped, cancelled] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "SHIPPED" } }),
    prisma.order.count({ where: { status: "CANCELLED" } }),
  ]);

  // faturamento simples (PAID)
  const paidOrders = await prisma.order.findMany({
    where: { status: "PAID" },
    select: { totalCents: true },
    take: 2000,
  });
  const revenue = paidOrders.reduce((acc, o) => acc + (o.totalCents || 0), 0);

  const customers = await prisma.customer.count();

  return (
    <AdminShell title="Painel">
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Pedidos pendentes" value={String(pending)} href="/admin/pedidos?status=PENDING" />
        <StatCard title="Pedidos pagos" value={String(paid)} href="/admin/pedidos?status=PAID" />
        <StatCard title="Pedidos enviados" value={String(shipped)} href="/admin/pedidos?status=SHIPPED" />
        <StatCard title="Clientes" value={String(customers)} href="/admin/clientes" />
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="text-xs text-[hsl(var(--muted))]">Faturamento (PAID)</div>
          <div className="mt-2 text-2xl font-semibold">{formatBRL(revenue)}</div>
          <div className="mt-2 text-xs text-[hsl(var(--muted))]">
            Total aproximado com base nos pedidos marcados como pagos.
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="text-xs text-[hsl(var(--muted))]">Ação recomendada</div>
          <div className="mt-2 text-sm font-semibold">Validar Mercado Pago + Webhook em Vercel</div>
          <div className="mt-2 text-xs text-[hsl(var(--muted))]">
            Após deploy, confirmamos idempotência e baixa de estoque em produção.
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-[hsl(var(--muted))]">
        Cancelados: <b>{cancelled}</b>
      </div>
    </AdminShell>
  );
}
