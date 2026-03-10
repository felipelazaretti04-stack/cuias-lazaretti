"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { CameraUploadButton } from "@/components/admin/CameraUploadButton";

type Category = { id: string; name: string };
type Carousel = { id: string; title: string; key: string; type: string };

type ProductImage = {
  url: string;
  alt?: string | null;
  sortOrder: number;
};

type Variant = {
  id?: string;
  sku: string;
  priceCents: number;
  compareAtCents?: number | null;
  stock: number;
  isActive: boolean;
  size?: string | null;
  finish?: string | null;
  color?: string | null;
  personalization?: string | null;
};

const SIZE_OPTIONS = ["Pequeno", "Médio", "Grande", "Extra Grande"] as const;
const FINISH_OPTIONS = ["Lisa", "Trabalhada", "Pintada", "Resinada"] as const;
const COLOR_OPTIONS = ["Natural", "Marrom", "Preta", "Verde", "Personalizada"] as const;
const PERSONAL_OPTIONS = ["Sim", "Não"] as const;

function brlFromCents(cents: number) {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function EditProductClient({ productId }: { productId: string }) {
  const id = productId;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [categories, setCategories] = useState<Category[]>([]);
  const [carousels, setCarousels] = useState<Carousel[]>([]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");

  const [description, setDescription] = useState("");
  const [care, setCare] = useState("");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedCarousels, setSelectedCarousels] = useState<string[]>([]);

  const [isPersonalized, setIsPersonalized] = useState(false);
  const [productionDays, setProductionDays] = useState("0");

  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);

  const [newImageUrl, setNewImageUrl] = useState("");
  const [newImageAlt, setNewImageAlt] = useState("");

  // Carregar carrosséis
  useEffect(() => {
    fetch("/api/admin/conteudo")
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        const carouselItems = items
          .filter((item: { type: string }) => item.type === "carousel")
          .map((item: { id: string; title: string; key: string; type: string }) => ({
            id: item.id,
            title: item.title,
            key: item.key,
            type: item.type,
          }));
        setCarousels(carouselItems);
      })
      .catch(() => setCarousels([]));
  }, []);

  async function load() {
    setLoading(true);
    setErr(null);
    setOk(null);
    const res = await fetch(`/api/admin/produtos/${id}`, { method: "GET" });
    const data = await res.json().catch(() => null);

    setLoading(false);
    if (!res.ok) {
      setErr(data?.error || "Falha ao carregar produto");
      return;
    }

    const p = data.product as any;
    const cats = (data.categories || []) as Category[];
    setCategories(cats);

    setName(p.name || "");
    setSlug(p.slug || "");
    setCategoryId(p.categoryId || "");

    setDescription(p.description || "");
    setCare(p.care || "");

    setIsActive(!!p.isActive);
    setIsFeatured(!!p.isFeatured);
    setIsNew(!!p.isNew);
    
    // Carregar carrosséis selecionados
    const selected: string[] = p.carousels || [];
    if (p.isFeatured && !selected.includes("featured")) selected.push("featured");
    if (p.isNew && !selected.includes("new")) selected.push("new");
    setSelectedCarousels(selected);

    setIsPersonalized(!!p.isPersonalized);
    setProductionDays(String(p.productionDays ?? 0));

    const imgs: ProductImage[] = (p.images || []).map((img: any) => ({
      url: img.url,
      alt: img.alt ?? null,
      sortOrder: img.sortOrder ?? 0,
    }));
    setImages(imgs);

    const vars: Variant[] = (p.variants || []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      priceCents: v.priceCents,
      compareAtCents: v.compareAtCents ?? null,
      stock: v.stock,
      isActive: !!v.isActive,
      size: v.size ?? null,
      finish: v.finish ?? null,
      color: v.color ?? null,
      personalization: v.personalization ?? "Não",
    }));

    setVariants(
      vars.length
        ? vars
        : [
            {
              sku: "",
              priceCents: 0,
              compareAtCents: null,
              stock: 0,
              isActive: true,
              size: "Médio",
              finish: "Lisa",
              color: "Natural",
              personalization: "Não",
            },
          ]
    );
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function toggleCarousel(key: string) {
    setSelectedCarousels((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const canSave = useMemo(() => {
    if (!name.trim()) return false;
    if (!slug.trim()) return false;
    if (!variants.length) return false;

    for (const v of variants) {
      if (!v.sku.trim()) return false;
      if (!Number.isFinite(v.priceCents) || v.priceCents <= 0) return false;
      if (!Number.isFinite(v.stock) || v.stock < 0) return false;
    }
    return true;
  }, [name, slug, variants]);

  function addImage(url: string, alt?: string) {
    const nextSort = images.length ? Math.max(...images.map((i) => i.sortOrder)) + 1 : 0;
    setImages((arr) => [...arr, { url, alt: alt || null, sortOrder: nextSort }]);
  }

  function removeImage(idx: number) {
    setImages((arr) => arr.filter((_, i) => i !== idx));
  }

  async function save() {
    setSaving(true);
    setErr(null);
    setOk(null);

    const payload = {
      name: name.trim(),
      slug: slug.trim(),
      categoryId: categoryId || null,

      description: description || null,
      care: care || null,

      isActive,
      isFeatured: selectedCarousels.includes("featured"),
      isNew: selectedCarousels.includes("new"),
      carousels: selectedCarousels,

      isPersonalized,
      productionDays: Number(productionDays) || 0,

      images: images.map((i) => ({
        url: i.url,
        alt: i.alt || null,
        sortOrder: Number(i.sortOrder) || 0,
      })),

      variants: variants.map((v) => ({
        id: v.id,
        sku: v.sku.trim(),
        priceCents: Number(v.priceCents) || 0,
        compareAtCents: v.compareAtCents == null ? null : Number(v.compareAtCents),
        stock: Number(v.stock) || 0,
        isActive: !!v.isActive,
        size: v.size || null,
        finish: v.finish || null,
        color: v.color || null,
        personalization: v.personalization || null,
      })),
    };

    const res = await fetch(`/api/admin/produtos/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao salvar produto");
      return;
    }

    setOk("Produto atualizado com sucesso.");
    await load();
  }

  return (
    <AdminShell title="Editar produto">
      {loading ? (
        <div className="text-sm text-[hsl(var(--muted))]">Carregando...</div>
      ) : (
        <div className="grid gap-6">
          <div className="card p-5">
            <div className="text-sm font-semibold">Dados do produto</div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Nome</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Slug</Label>
                <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Categoria</Label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                >
                  <option value="">(Sem categoria)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Descrição</Label>
                <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Cuidados <span className="text-[hsl(var(--muted))]">(opcional)</span></Label>
                <Textarea value={care} onChange={(e) => setCare(e.target.value)} rows={3} />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {/* Ativo + Personalizável + Prazo */}
              <div className="grid gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                  Ativo
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={isPersonalized} onChange={(e) => setIsPersonalized(e.target.checked)} />
                  Produto personalizável
                </label>
                <div className="space-y-1">
                  <Label>Prazo produção (dias)</Label>
                  <Input
                    value={productionDays}
                    onChange={(e) => setProductionDays(e.target.value)}
                    inputMode="numeric"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Carrosséis dinâmicos */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                <Label>Exibir em carrosséis</Label>
                <div className="mt-2 flex flex-col gap-2 max-h-40 overflow-y-auto">
                  {carousels.length === 0 ? (
                    <span className="text-xs text-[hsl(var(--muted))]">Nenhum carrossel cadastrado</span>
                  ) : (
                    carousels.map((c) => (
                      <label key={c.key} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={selectedCarousels.includes(c.key)}
                          onChange={() => toggleCarousel(c.key)}
                        />
                        {c.title}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* IMAGENS */}
          <div className="card p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Imagens</div>
                <div className="text-xs text-[hsl(var(--muted))]">Cole uma URL, tire uma foto ou selecione da galeria.</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <CameraUploadButton onUploaded={(url) => addImage(url)} />
                <MediaPicker onPick={(url) => addImage(url)} />
              </div>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label>URL</Label>
                <Input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <Label>ALT (opcional)</Label>
                <Input value={newImageAlt} onChange={(e) => setNewImageAlt(e.target.value)} placeholder="Ex.: cuia torpedo" />
              </div>
              <div className="md:col-span-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    if (!newImageUrl.trim()) return;
                    addImage(newImageUrl.trim(), newImageAlt.trim());
                    setNewImageUrl("");
                    setNewImageAlt("");
                  }}
                >
                  Adicionar imagem
                </Button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
              {images.map((img, idx) => (
                <div key={`${img.url}-${idx}`} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.alt || "img"} className="aspect-square w-full rounded-xl object-cover" />
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-[hsl(var(--muted))]">ordem</div>
                    <button type="button" onClick={() => removeImage(idx)} className="text-[11px] text-red-700 underline">
                      Remover
                    </button>
                  </div>
                  <div className="mt-2">
                    <Input
                      value={String(img.sortOrder)}
                      onChange={(e) =>
                        setImages((arr) => arr.map((x, i) => (i === idx ? { ...x, sortOrder: Number(e.target.value) || 0 } : x)))
                      }
                      inputMode="numeric"
                    />
                  </div>
                </div>
              ))}
              {images.length === 0 && <div className="col-span-2 text-sm text-[hsl(var(--muted))]">Sem imagens.</div>}
            </div>
          </div>

          {/* VARIANTES */}
          <div className="card p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Variantes</div>
                <div className="text-xs text-[hsl(var(--muted))]">Select + "Outro" para padronizar.</div>
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setVariants((arr) => [
                    ...arr,
                    {
                      sku: "",
                      priceCents: arr[0]?.priceCents || 0,
                      compareAtCents: null,
                      stock: 0,
                      isActive: true,
                      size: arr[0]?.size || "Médio",
                      finish: arr[0]?.finish || "Lisa",
                      color: arr[0]?.color || "Natural",
                      personalization: arr[0]?.personalization || "Não",
                    },
                  ]);
                }}
              >
                Adicionar variante
              </Button>
            </div>

            <div className="mt-4 grid gap-4">
              {variants.map((v, idx) => (
                <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="text-sm font-semibold">Variante #{idx + 1}</div>
                    <button
                      type="button"
                      onClick={() => setVariants((arr) => arr.filter((_, i) => i !== idx))}
                      className="text-xs text-red-700 underline"
                      disabled={variants.length <= 1}
                    >
                      Remover
                    </button>
                  </div>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label>SKU</Label>
                      <Input
                        value={v.sku}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, sku: e.target.value } : it)))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Preço (centavos)</Label>
                      <Input
                        value={String(v.priceCents)}
                        onChange={(e) =>
                          setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, priceCents: Number(e.target.value) || 0 } : it)))
                        }
                        inputMode="numeric"
                      />
                      <div className="text-[11px] text-[hsl(var(--muted))]">
                        {v.priceCents > 0 ? `Exibe: ${brlFromCents(v.priceCents)}` : "—"}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Estoque</Label>
                      <Input
                        value={String(v.stock)}
                        onChange={(e) =>
                          setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, stock: Number(e.target.value) || 0 } : it)))
                        }
                        inputMode="numeric"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Tamanho</Label>
                      <select
                        value={SIZE_OPTIONS.includes(v.size as typeof SIZE_OPTIONS[number]) ? v.size! : "Outro"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, size: val === "Outro" ? "" : val } : it)));
                        }}
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                      >
                        {SIZE_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                        <option value="Outro">Outro</option>
                      </select>
                      {!SIZE_OPTIONS.includes(v.size as typeof SIZE_OPTIONS[number]) && (
                        <Input value={v.size || ""} onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, size: e.target.value } : it)))} />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Acabamento</Label>
                      <select
                        value={FINISH_OPTIONS.includes(v.finish as typeof FINISH_OPTIONS[number]) ? v.finish! : "Outro"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, finish: val === "Outro" ? "" : val } : it)));
                        }}
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                      >
                        {FINISH_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                        <option value="Outro">Outro</option>
                      </select>
                      {!FINISH_OPTIONS.includes(v.finish as typeof FINISH_OPTIONS[number]) && (
                        <Input value={v.finish || ""} onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, finish: e.target.value } : it)))} />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Cor</Label>
                      <select
                        value={COLOR_OPTIONS.includes(v.color as typeof COLOR_OPTIONS[number]) ? v.color! : "Outro"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, color: val === "Outro" ? "" : val } : it)));
                        }}
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                      >
                        {COLOR_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                        <option value="Outro">Outro</option>
                      </select>
                      {!COLOR_OPTIONS.includes(v.color as typeof COLOR_OPTIONS[number]) && (
                        <Input value={v.color || ""} onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, color: e.target.value } : it)))} />
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Personalização</Label>
                      <select
                        value={v.personalization || "Não"}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, personalization: e.target.value } : it)))}
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                      >
                        {PERSONAL_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label>Ativa</Label>
                      <select
                        value={v.isActive ? "true" : "false"}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, isActive: e.target.value === "true" } : it)))}
                        className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                      >
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </select>
                    </div>

                    <div className="space-y-2 md:col-span-3">
                      <Label>CompareAt (centavos, opcional)</Label>
                      <Input
                        value={v.compareAtCents == null ? "" : String(v.compareAtCents)}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, compareAtCents: e.target.value ? Number(e.target.value) : null } : it)))}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}
          {ok && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{ok}</div>}

          <div className="flex flex-wrap gap-2">
            <Button onClick={save} disabled={!canSave || saving}>
              {saving ? "Salvando..." : "Salvar alterações"}
            </Button>
            <Button variant="secondary" onClick={load} disabled={saving}>
              Recarregar
            </Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
