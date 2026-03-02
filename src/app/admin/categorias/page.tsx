import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { DeleteCategoryButton } from "@/components/admin/DeleteCategoryButton";

export default async function AdminCategoriasPage() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  return (
    <AdminShell title="Categorias">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-[hsl(var(--muted))]">Gerencie as categorias do catálogo.</div>
        <Link
          href="/admin/categorias/nova"
          className="inline-flex items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
        >
          Nova categoria
        </Link>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[860px] text-sm">
          <thead>
            <tr className="text-left text-[hsl(var(--muted))]">
              <th className="py-2">Nome</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Ordem</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-[hsl(var(--border))]">
                <td className="py-3 font-medium">{c.name}</td>
                <td className="text-[hsl(var(--muted))]">{c.slug}</td>
                <td>
                  {c.isActive ? (
                    <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs text-emerald-900">
                      Ativa
                    </span>
                  ) : (
                    <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-900">
                      Inativa
                    </span>
                  )}
                </td>
                <td>{c.sortOrder}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-2">
                    <Link
                      href={`/admin/categorias/${c.id}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
                    >
                      Editar
                    </Link>
                    <DeleteCategoryButton categoryId={c.id} />
                  </div>
                </td>
              </tr>
            ))}
            {categories.length === 0 ? (
              <tr>
                <td className="py-4 text-sm text-[hsl(var(--muted))]" colSpan={5}>
                  Sem categorias ainda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
