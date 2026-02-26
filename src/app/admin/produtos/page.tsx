import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatBRL } from "@/lib/money";

export default async function AdminProdutosPage() {
  const products = await prisma.product.findMany({
    orderBy: [{ createdAt: "desc" }],
    include: {
      category: true,
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" } },
    },
  });

  return (
    <AdminShell title="Produtos">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[hsl(var(--muted))]">
          Cadastre produtos, variantes e imagens.
        </div>

        <Link
          href="/admin/produtos/novo"
          className="inline-flex items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
        >
          Novo produto
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="text-left text-[hsl(var(--muted))]">
              <th className="py-2">Produto</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Preço (a partir de)</th>
              <th>Variantes</th>
              <th className="text-right">Ações</th>
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
                  <td className="text-right">
                    <Link
                      href={`/admin/produtos/${p.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
                    >
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {products.length === 0 ? (
              <tr>
                <td className="py-4 text-sm text-[hsl(var(--muted))]" colSpan={6}>
                  Sem produtos ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[hsl(var(--muted))]">
        Dica: use <b>Mídias</b> para subir imagens no Cloudinary e reutilizar URLs nos produtos.
      </div>
    </AdminShell>
  );
}
