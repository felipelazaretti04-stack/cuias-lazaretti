import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatBRL } from "@/lib/money";

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      variants: { orderBy: { priceCents: "asc" } },
    },
  });

  return (
    <AdminShell title="Produtos">
      <div className="flex items-center justify-between">
        <div className="text-sm text-[hsl(var(--muted))]">
          Cadastre produtos, variantes e imagens (URL).
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
        >
          Novo produto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[hsl(var(--muted))]">
              <th className="py-2">Produto</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Preço (a partir de)</th>
              <th>Variantes</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const first = p.variants[0];
              return (
                <tr key={p.id} className="border-t border-[hsl(var(--border))]">
                  <td className="py-3 font-medium">{p.name}</td>
                  <td className="text-[hsl(var(--muted))]">{p.category?.name ?? "-"}</td>
                  <td>{p.isActive ? "Ativo" : "Inativo"}</td>
                  <td>{first ? formatBRL(first.priceCents) : "-"}</td>
                  <td>{p.variants.length}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[hsl(var(--muted))]">
        Edição/remoção entra na fase 2 (mantendo MVP enxuto).
      </div>
    </AdminShell>
  );
}
