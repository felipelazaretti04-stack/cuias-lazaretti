// file: src/app/admin/produtos/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";

type SearchParams = Promise<{
  q?: string;
  category?: string;
  status?: string;
  sort?: string;
}>;

export default async function AdminProdutosPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const category = (sp.category || "").trim();
  const status = (sp.status || "").trim();
  const sort = (sp.sort || "name-asc").trim();

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, slug: true },
  });

  const products = await prisma.product.findMany({
    where: {
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { slug: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(category ? { category: { slug: category } } : {}),
      ...(status === "active"
        ? { isActive: true }
        : status === "inactive"
          ? { isActive: false }
          : {}),
    },
    include: {
      category: true,
      variants: true,
    },
    take: 500,
  });

  // Helpers
  const getMinPrice = (variants: { priceCents: number }[]) =>
    variants.length ? Math.min(...variants.map((v) => v.priceCents)) : 0;

  const getTotalStock = (variants: { stock: number }[]) =>
    variants.reduce((sum, v) => sum + v.stock, 0);

  const sorted = [...products].sort((a, b) => {
    if (sort === "name-desc") return b.name.localeCompare(a.name, "pt-BR");
    if (sort === "price-asc") return getMinPrice(a.variants) - getMinPrice(b.variants);
    if (sort === "price-desc") return getMinPrice(b.variants) - getMinPrice(a.variants);
    if (sort === "stock-asc") return getTotalStock(a.variants) - getTotalStock(b.variants);
    if (sort === "stock-desc") return getTotalStock(b.variants) - getTotalStock(a.variants);
    return a.name.localeCompare(b.name, "pt-BR");
  });

  return (
    <AdminShell title="Produtos">
      {/* Filtros */}
      <form className="grid gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 md:grid-cols-5">
        <input
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome ou slug"
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        />
        <select
          name="category"
          defaultValue={category}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        >
          <option value="">Todas categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          name="status"
          defaultValue={status}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        >
          <option value="">Todos status</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <select
          name="sort"
          defaultValue={sort}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        >
          <option value="name-asc">Nome A → Z</option>
          <option value="name-desc">Nome Z → A</option>
          <option value="price-asc">Menor preço</option>
          <option value="price-desc">Maior preço</option>
          <option value="stock-asc">Menor estoque</option>
          <option value="stock-desc">Maior estoque</option>
        </select>
        <button
          type="submit"
          className="rounded-xl bg-black px-4 py-2 text-sm text-white"
        >
          Filtrar
        </button>
      </form>

      {/* Cards de resumo */}
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Produtos listados</div>
          <div className="mt-1 text-2xl font-semibold">{sorted.length}</div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Ativos</div>
          <div className="mt-1 text-2xl font-semibold text-green-700">
            {sorted.filter((p) => p.isActive).length}
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Inativos</div>
          <div className="mt-1 text-2xl font-semibold text-gray-700">
            {sorted.filter((p) => !p.isActive).length}
          </div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Sem estoque</div>
          <div className="mt-1 text-2xl font-semibold text-red-700">
            {sorted.filter((p) => getTotalStock(p.variants) <= 0).length}
          </div>
        </div>
      </div>

      {/* Tabela */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted))]">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço (min)</th>
              <th className="px-4 py-3">Estoque total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-[hsl(var(--muted))]">
                  Nenhum produto encontrado.
                </td>
              </tr>
            ) : (
              sorted.map((product) => {
                const totalStock = getTotalStock(product.variants);
                const minPrice = getMinPrice(product.variants);

                return (
                  <tr key={product.id} className="border-b border-[hsl(var(--border))] last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-[hsl(var(--muted))]">{product.slug}</div>
                    </td>
                    <td className="px-4 py-3">{product.category?.name || "Sem categoria"}</td>
                    <td className="px-4 py-3">
                      {minPrice > 0
                        ? (minPrice / 100).toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3">{totalStock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          product.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {product.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/produtos/${product.id}`}
                        className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs"
                      >
                        Editar
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
