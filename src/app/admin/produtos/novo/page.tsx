"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type Category = { id: string; name: string };

type VariantDraft = {
  sku: string;
  size?: string;
  finish?: string;
  color?: string;
  personalization?: string;
  priceCents: string;
  compareAtCents?: string;
  stock: string;
  isActive: boolean;
};

type ImageDraft = { url: string; alt?: string; sortOrder: string };

export default function NovoProdutoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [description, setDescription] = useState("");
  const [care, setCare] = useState("");

  const [isPersonalized, setIsPersonalized] = useState(false);
  const [productionDays, setProductionDays] = useState("0");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(true);

  const [images, setImages] = useState<ImageDraft[]>([
    { url: "", alt: "", sortOrder: "0" },
  ]);

  const [variants, setVariants] = useState<VariantDraft[]>([
    { sku: "", size: "Médio", finish: "Lisa", color: "Marrom", personalization: "Não", priceCents: "14990", compareAtCents: "", stock: "10", isActive: true },
  ]);

  useEffect(() => {
    fetch("/api/admin/categorias")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));
  }, []);

  function addVariant() {
    setVariants((v) => [
      ...v,
      { sku: "", size: "", finish: "", color: "", personalization: "Não", priceCents: "0", compareAtCents: "", stock: "0", isActive: true },
    ]);
  }

  function addImage() {
    setImages((imgs) => [...imgs, { url: "", alt: "", sortOrder: String(imgs.length) }]);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const payload = {
      name,
      categoryId: categoryId || null,
      description: description || undefined,
      care: care || undefined,
      isPersonalized,
      productionDays,
      isActive,
      isFeatured,
      isNew,
      images: images.filter((i) => i.url.trim().length > 0),
      variants,
    };

    const res = await fetch("/api/admin/produtos", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Erro ao salvar");
      return;
    }

    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <AdminShell title="Novo produto">
      <form className="grid gap-6" onSubmit={onSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cuia Premium Torpedo" />
          </div>

          <div className="space-y-2">
            <Label>Categoria</Label>
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Descrição</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
          </div>
          <div className="space-y-2">
            <Label>Cuidados</Label>
            <Textarea value={care} onChange={(e) => setCare(e.target.value)} rows={5} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <div className="space-y-2">
            <Label>Personalizável</Label>
            <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <input checked={isPersonalized} onChange={(e) => setIsPersonalized(e.target.checked)} type="checkbox" />
              <span className="text-sm">Sim</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Prazo produção (dias)</Label>
            <Input value={productionDays} onChange={(e) => setProductionDays(e.target.value)} inputMode="numeric" />
          </div>

          <div className="space-y-2">
            <Label>Ativo</Label>
            <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <input checked={isActive} onChange={(e) => setIsActive(e.target.checked)} type="checkbox" />
              <span className="text-sm">Mostrar</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Destaque / Lançamento</Label>
            <div className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <label className="flex items-center gap-2 text-sm">
                <input checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} type="checkbox" /> Destaque
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input checked={isNew} onChange={(e) => setIsNew(e.target.checked)} type="checkbox" /> Novidade
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Imagens (URL)</div>
              <div className="text-xs text-[hsl(var(--muted))]">Sem upload local (Vercel-safe).</div>
            </div>
            <Button type="button" variant="secondary" onClick={addImage}>Adicionar imagem</Button>
          </div>

          <div className="mt-4 grid gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="grid gap-3 md:grid-cols-6">
                <div className="md:col-span-4 space-y-2">
                  <Label>URL</Label>
                  <Input
                    value={img.url}
                    onChange={(e) => {
                      const v = e.target.value;
                      setImages((arr) => arr.map((it, i) => (i === idx ? { ...it, url: v } : it)));
                    }}
                    placeholder="https://..."
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label>Ordem</Label>
                  <Input
                    value={img.sortOrder}
                    onChange={(e) => {
                      const v = e.target.value;
                      setImages((arr) => arr.map((it, i) => (i === idx ? { ...it, sortOrder: v } : it)));
                    }}
                  />
                </div>
                <div className="md:col-span-1 space-y-2">
                  <Label>Alt</Label>
                  <Input
                    value={img.alt || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setImages((arr) => arr.map((it, i) => (i === idx ? { ...it, alt: v } : it)));
                    }}
                    placeholder="Opcional"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Variantes</div>
              <div className="text-xs text-[hsl(var(--muted))]">Preço em centavos (ex.: 14990 = R$ 149,90).</div>
            </div>
            <Button type="button" variant="secondary" onClick={addVariant}>Adicionar variante</Button>
          </div>

          <div className="mt-4 grid gap-4">
            {variants.map((v, idx) => (
              <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                <div className="grid gap-3 md:grid-cols-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label>SKU</Label>
                    <Input value={v.sku} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, sku: val } : it)));
                    }} placeholder="CLZ-..." />
                  </div>
                  <div className="space-y-2">
                    <Label>Tamanho</Label>
                    <Input value={v.size || ""} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, size: val } : it)));
                    }} placeholder="Médio" />
                  </div>
                  <div className="space-y-2">
                    <Label>Acabamento</Label>
                    <Input value={v.finish || ""} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, finish: val } : it)));
                    }} placeholder="Lisa" />
                  </div>
                  <div className="space-y-2">
                    <Label>Cor</Label>
                    <Input value={v.color || ""} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, color: val } : it)));
                    }} placeholder="Marrom" />
                  </div>
                  <div className="space-y-2">
                    <Label>Personalização</Label>
                    <Input value={v.personalization || ""} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, personalization: val } : it)));
                    }} placeholder="Sim/Não" />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço (cents)</Label>
                    <Input value={v.priceCents} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, priceCents: val } : it)));
                    }} inputMode="numeric" />
                  </div>
                  <div className="space-y-2">
                    <Label>Preço promo (cents)</Label>
                    <Input value={v.compareAtCents || ""} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, compareAtCents: val } : it)));
                    }} inputMode="numeric" placeholder="opcional" />
                  </div>
                  <div className="space-y-2">
                    <Label>Estoque</Label>
                    <Input value={v.stock} onChange={(e) => {
                      const val = e.target.value;
                      setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, stock: val } : it)));
                    }} inputMode="numeric" />
                  </div>
                  <div className="space-y-2">
                    <Label>Ativa</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
                      <input checked={v.isActive} onChange={(e) => {
                        const val = e.target.checked;
                        setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, isActive: val } : it)));
                      }} type="checkbox" />
                      <span className="text-sm">Sim</span>
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs text-[hsl(var(--muted))]">
                  Dica: mantenha SKU único por variante.
                </div>
              </div>
            ))}
          </div>
        </div>

        {err ? <div className="text-sm text-red-700">{err}</div> : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>{loading ? "Salvando..." : "Salvar produto"}</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </AdminShell>
  );
}
