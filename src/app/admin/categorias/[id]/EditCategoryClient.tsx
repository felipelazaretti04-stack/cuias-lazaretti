"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type Category = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  sortOrder: number;
};

export default function EditCategoryClient({ categoryId }: { categoryId: string }) {
  const [cat, setCat] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState("0");

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);

    const res = await fetch(`/api/admin/categorias/${categoryId}`);
    setLoading(false);
    if (!res.ok) {
      setErr("Falha ao carregar categoria");
      return;
    }

    const data = await res.json();
    const c = data.category as Category;

    setCat(c);
    setName(c.name);
    setSlug(c.slug);
    setIsActive(c.isActive);
    setSortOrder(String(c.sortOrder));
  }

  useEffect(() => { load(); }, [categoryId]);

  async function save() {
    setSaving(true);
    setErr(null);
    setOk(null);

    const res = await fetch(`/api/admin/categorias/${categoryId}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        name,
        slug,
        isActive,
        sortOrder: Number(sortOrder),
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Erro ao salvar");
      return;
    }

    setOk("Categoria atualizada.");
    await load();
  }

  return (
    <AdminShell title="Editar categoria">
      {loading ? (
        <div className="text-sm text-[hsl(var(--muted))]">Carregando...</div>
      ) : !cat ? (
        <div className="text-sm text-red-700">Categoria não encontrada.</div>
      ) : (
        <div className="max-w-2xl space-y-4">
          <div className="card p-5 space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              <div className="text-xs text-[hsl(var(--muted))]">Usado na URL e filtros.</div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Ordem</Label>
                <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputMode="numeric" />
              </div>

              <div className="space-y-2">
                <Label>Ativa</Label>
                <select
                  value={isActive ? "true" : "false"}
                  onChange={(e) => setIsActive(e.target.value === "true")}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                >
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>
          </div>

          {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}
          {ok && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{ok}</div>}

          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
            <Button variant="secondary" onClick={load} disabled={saving}>Recarregar</Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
