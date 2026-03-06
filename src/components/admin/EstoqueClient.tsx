// file: src/components/admin/EstoqueClient.tsx
"use client";
import { useEffect, useMemo, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Item = {
  id: string;
  sku: string;
  size?: string | null;
  color?: string | null;
  finish?: string | null;
  stock: number;
  priceCents: number;
  productId: string;
  productName: string;
  categoryName: string;
  categorySlug: string;
  isActive: boolean;
};

function formatBRL(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function stockBadge(stock: number) {
  if (stock <= 0) return "bg-red-100 text-red-700";
  if (stock <= 3) return "bg-yellow-100 text-yellow-800";
  return "bg-green-100 text-green-700";
}

function stockLabel(stock: number) {
  if (stock <= 0) return "Sem estoque";
  if (stock <= 3) return "Baixo";
  return "OK";
}

function variantLabel(item: Item) {
  const parts = [item.size, item.color, item.finish].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "Padrão";
}

export default function EstoqueClient({ categories }: { categories: Category[] }) {
  const [items, setItems] = useState<Item[]>([]);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("all");
  const [sort, setSort] = useState("name-asc");
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (category) params.set("category", category);
    if (stock) params.set("stock", stock);
    if (sort) params.set("sort", sort);

    const res = await fetch(`/api/admin/estoque?${params.toString()}`);
    const data = await res.json().catch(() => null);
    
    if (!res.ok) {
      setError(data?.error || "Falha ao carregar estoque");
      setLoading(false);
      return;
    }
    
    setItems(data.items || []);
    setDrafts(
      Object.fromEntries((data.items || []).map((it: Item) => [it.id, String(it.stock)]))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [category, stock, sort]);

  async function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    await load();
  }

  async function saveStock(variantId: string) {
    const raw = drafts[variantId];
    const stockValue = Number(raw);
    
    if (!Number.isInteger(stockValue) || stockValue < 0) {
      alert("Informe um estoque válido (inteiro >= 0)");
      return;
    }
    
    setSavingId(variantId);
    setError(null);
    
    try {
      const res = await fetch(`/api/admin/estoque/${variantId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ stock: stockValue }),
      });
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        setError(data?.error || "Falha ao salvar");
        return;
      }
      
      setItems((prev) =>
        prev.map((it) => (it.id === variantId ? { ...it, stock: data.item.stock } : it))
      );
      setDrafts((prev) => ({ ...prev, [variantId]: String(data.item.stock) }));
    } finally {
      setSavingId(null);
    }
  }

  const totalItems = items.length;
  const totalOut = useMemo(() => items.filter((i) => i.stock <= 0).length, [items]);
  const totalLow = useMemo(() => items.filter((i) => i.stock > 0 && i.stock <= 3).length, [items]);

  return (
    <div className="space-y-6">
      <form
        onSubmit={onSearchSubmit}
        className="grid gap-3 rounded-2xl border border-[hsl(var(--border))] bg-white p-4 md:grid-cols-5"
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar produto ou SKU"
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        >
          <option value="">Todas categorias</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>{cat.name}</option>
          ))}
        </select>
        <select
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        >
          <option value="all">Todo estoque</option>
          <option value="out">Sem estoque</option>
          <option value="low">Baixo estoque</option>
          <option value="in">Com estoque</option>
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-sm outline-none"
        >
          <option value="name-asc">Nome A → Z</option>
          <option value="name-desc">Nome Z → A</option>
          <option value="stock-asc">Menor estoque</option>
          <option value="stock-desc">Maior estoque</option>
        </select>
        <button type="submit" className="rounded-xl bg-black px-4 py-2 text-sm text-white">
          Filtrar
        </button>
      </form>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Itens listados</div>
          <div className="mt-1 text-2xl font-semibold">{totalItems}</div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Sem estoque</div>
          <div className="mt-1 text-2xl font-semibold text-red-700">{totalOut}</div>
        </div>
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-xs text-[hsl(var(--muted))]">Baixo estoque</div>
          <div className="mt-1 text-2xl font-semibold text-yellow-700">{totalLow}</div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[hsl(var(--border))] bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[hsl(var(--border))] text-left text-[hsl(var(--muted))]">
              <th className="px-4 py-3">Produto</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--muted))]">
                  Carregando...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-[hsl(var(--muted))]">
                  Nenhum item encontrado.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id} className="border-b border-[hsl(var(--border))] last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-medium">{item.productName}</div>
                    <div className="text-xs text-[hsl(var(--muted))]">{variantLabel(item)}</div>
                  </td>
                  <td className="px-4 py-3">{item.categoryName}</td>
                  <td className="px-4 py-3">{item.sku || "-"}</td>
                  <td className="px-4 py-3">{formatBRL(item.priceCents)}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${stockBadge(item.stock)}`}>
                      {stockLabel(item.stock)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      min={0}
                      value={drafts[item.id] ?? String(item.stock)}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [item.id]: e.target.value }))}
                      className="w-20 rounded-xl border border-[hsl(var(--border))] px-2 py-1 text-sm outline-none"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => saveStock(item.id)}
                      disabled={savingId === item.id}
                      className="rounded-xl bg-black px-3 py-1 text-xs text-white disabled:opacity-50"
                    >
                      {savingId === item.id ? "..." : "Salvar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
