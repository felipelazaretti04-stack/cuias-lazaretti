import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/ProductCard";
import { notFound } from "next/navigation";

type SearchParams = {
  q?: string;
  cat?: string;
  min?: string;
  max?: string;
  sort?: string;
};

function toInt(v?: string, fallback?: number) {
  const n = v ? Number(v) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams;

  const q = sp.q?.trim() || "";
  const cat = sp.cat?.trim() || "";
  const min = toInt(sp.min, undefined);
  const max = toInt(sp.max, undefined);
  const sort = sp.sort || "new";

  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const products = await prisma.product.findMany({
    where: {
      isActive: true,
      ...(q ? { name: { contains: q, mode: "insensitive" } } : {}),
      ...(cat ? { category: { slug: cat } } : {}),
      ...(min != null || max != null
        ? {
            variants: {
              some: {
                isActive: true,
                ...(min != null ? { priceCents: { gte: min * 100 } } : {}),
                ...(max != null ? { priceCents: { lte: max * 100 } } : {}),
              },
            },
          }
        : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { where: { isActive: true }, orderBy: { priceCents: "asc" }, take: 1 },
      category: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container py-10">
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="mt-1 text-sm text-[hsl(var(--muted))]">
            Cuias, bombas e acessórios com estética premium.
          </p>
        </div>

        <form className="card grid w-full gap-3 p-4 md:max-w-3xl md:grid-cols-5">
          <input
            name="q"
            defaultValue={q}
            placeholder="Buscar..."
            className="md:col-span-2 w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
          />
          <select
            name="cat"
            defaultValue={cat}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
          >
            <option value="">Todas</option>
            {categories.map((c: (typeof categories)[number]) =>
              <option key={c.id} value={c.slug}>{c.name}</option>
            )}
          </select>
          <select
            name="sort"
            defaultValue={sort}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
          >
            <option value="new">Novidades</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
          <button className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white">
            Filtrar
          </button>

          <div className="md:col-span-5 grid grid-cols-2 gap-3">
            <input
              name="min"
              defaultValue={sp.min || ""}
              placeholder="Preço mín (R$)"
              inputMode="numeric"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
            />
            <input
              name="max"
              defaultValue={sp.max || ""}
              placeholder="Preço máx (R$)"
              inputMode="numeric"
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
            />
          </div>
        </form>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p: (typeof products)[number]) =>
          <ProductCard
            key={p.id}
            slug={p.slug}
            name={p.name}
            imageUrl={p.images[0]?.url ?? null}
            isFeatured={p.isFeatured}
            isNew={p.isNew}
            fromPriceCents={p.variants[0]?.priceCents ?? 0}
            fromCompareAtCents={p.variants[0]?.compareAtCents ?? null}
          />
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-10 card p-6">
          <div className="text-sm text-[hsl(var(--muted))]">
            Nada encontrado. Tenta ajustar os filtros.
          </div>
          <Link href="/produtos" className="mt-3 inline-block text-sm underline">
            Limpar filtros
          </Link>
        </div>
      ) : null}
    </div>
  );
}
