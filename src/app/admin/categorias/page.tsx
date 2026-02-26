import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

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
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="text-left text-[hsl(var(--muted))]">
              <th className="py-2">Nome</th>
              <th>Slug</th>
              <th>Ativa</th>
              <th>Ordem</th>
              <th className="text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-[hsl(var(--border))]">
                <td className="py-3 font-medium">{c.name}</td>
                <td className="text-[hsl(var(--muted))]">{c.slug}</td>
                <td>{c.isActive ? "Sim" : "Não"}</td>
                <td>{c.sortOrder}</td>
                <td className="text-right">
                  <Link
                    href={`/admin/categorias/${c.id}`}
                    className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs hover:bg-[hsl(var(--accent))]"
                  >
                    Editar
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 text-xs text-[hsl(var(--muted))]">
        Agora você já pode editar categorias existentes pelo botão <b>Editar</b>.
      </div>
    </AdminShell>
  );
}
