import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminClientesPage() {
  const customers = await prisma.customer.findMany({
    orderBy: { createdAt: "desc" },
    take: 300,
    include: {
      orders: { select: { publicId: true, status: true, totalCents: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 3 },
    },
  });

  const brl = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <AdminShell title="Clientes">
      <div className="text-sm text-[hsl(var(--muted))]">
        Lista simples com base nos pedidos (MVP).
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[hsl(var(--muted))]">
              <th className="py-2">Nome</th>
              <th>Email</th>
              <th>WhatsApp</th>
              <th>Últimos pedidos</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-[hsl(var(--border))]">
                <td className="py-3 font-medium">{c.name || "-"}</td>
                <td className="text-[hsl(var(--muted))]">{c.email || "-"}</td>
                <td className="text-[hsl(var(--muted))]">{c.phone || "-"}</td>
                <td className="text-[hsl(var(--muted))]">
                  {c.orders.length ? (
                    <ul className="space-y-1">
                      {c.orders.map((o) => (
                        <li key={o.publicId}>
                          {o.publicId} • {o.status} • {brl(o.totalCents)} • {new Date(o.createdAt).toLocaleDateString("pt-BR")}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
