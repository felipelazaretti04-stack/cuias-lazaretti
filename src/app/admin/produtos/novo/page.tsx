"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { CameraUploadButton } from "@/components/admin/CameraUploadButton";

type Category = { id: string; name: string };
type Carousel = { id: string; title: string; key: string };

type VariantDraft = {
  sku: string;
  size?: string | null;
  finish?: string | null;
  color?: string | null;
  personalization?: string | null;
  priceCents: string;
  compareAtCents?: string;
  stock: string;
  isActive: boolean;
};

type ImageDraft = { url: string; alt?: string; sortOrder: string };

const SIZE_OPTIONS = ["Pequeno", "Médio", "Grande", "Extra Grande"] as const;
const FINISH_OPTIONS = ["Lisa", "Trabalhada", "Pintada", "Resinada"] as const;
const COLOR_OPTIONS = ["Natural", "Marrom", "Preta", "Verde", "Personalizada"] as const;
const PERSONAL_OPTIONS = ["Sim", "Não"] as const;

function slugify(s: string) {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function NovoProdutoPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false); // controle manual
  const [categoryId, setCategoryId] = useState<string>("");

  const [description, setDescription] = useState("");
  const [care, setCare] = useState("");

  const [isPersonalized, setIsPersonalized] = useState(false);
  const [productionDays, setProductionDays] = useState("0");

  const [isActive, setIsActive] = useState(true);
  const [selectedCarousels, setSelectedCarousels] = useState<string[]>([]);

  const [images, setImages] = useState<ImageDraft[]>([{ url: "", alt: "", sortOrder: "0" }]);

  const [variants, setVariants] = useState<VariantDraft[]>([
    {
      sku: "",
      size: "Médio",
      finish: "Lisa",
      color: "Marrom",
      personalization: "Não",
      priceCents: "14990",
      compareAtCents: "",
      stock: "10",
      isActive: true,
    },
  ]);

  useEffect(() => {
    // Carregar categorias
    fetch("/api/admin/categorias")
      .then((r) => r.json())
      .then((d) => setCategories(d.categories || []))
      .catch(() => setCategories([]));

    // Carregar carrosséis dinâmicos
    fetch("/api/admin/conteudo")
      .then((r) => r.json())
      .then((d) => {
        const items = d.items || [];
        const carouselItems = items
          .filter((item: { type: string }) => item.type === "carousel")
          .map((item: { id: string; title: string; key: string }) => ({
            id: item.id,
            title: item.title,
            key: item.key,
          }));
        setCarousels(carouselItems);
      })
      .catch(() => setCarousels([]));
  }, []);

  // Auto slug - só atualiza se não foi editado manualmente
  useEffect(() => {
    if (!slugManual && name.trim().length >= 2) {
      setSlug(slugify(name));
    }
  }, [name, slugManual]);

  function handleSlugChange(value: string) {
    setSlugManual(true);
    setSlug(value);
  }

  function toggleCarousel(key: string) {
    setSelectedCarousels((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  const canSave = useMemo(() => {
    if (name.trim().length < 2) return false;
    if (slug.trim().length < 2) return false;
    if (!variants.length) return false;
    for (const v of variants) {
      const price = Number(v.priceCents);
      const stock = Number(v.stock);
      if (!Number.isFinite(price) || price < 1) return false;
      if (!Number.isFinite(stock) || stock < 0) return false;
    }
    return true;
  }, [name, slug, variants]);

  function addVariant() {
    setVariants((v) => [
      ...v,
      {
        sku: "",
        size: v[0]?.size || "Médio",
        finish: v[0]?.finish || "Lisa",
        color: v[0]?.color || "Marrom",
        personalization: v[0]?.personalization || "Não",
        priceCents: v[0]?.priceCents || "0",
        compareAtCents: "",
        stock: "0",
        isActive: true,
      },
    ]);
  }

  function removeVariant(idx: number) {
    setVariants((arr) => (arr.length <= 1 ? arr : arr.filter((_, i) => i !== idx)));
  }

  function addImage() {
    setImages((imgs) => [...imgs, { url: "", alt: "", sortOrder: String(imgs.length) }]);
  }

  function addImageFromPicker(url: string) {
    setImages((imgs) => {
      if (imgs.length === 1 && !imgs[0].url.trim()) {
        return [{ ...imgs[0], url, sortOrder: imgs[0].sortOrder || "0" }];
      }
      return [...imgs, { url, alt: "", sortOrder: String(imgs.length) }];
    });
  }

  function removeImage(idx: number) {
    setImages((arr) => (arr.length <= 1 ? [{ url: "", alt: "", sortOrder: "0" }] : arr.filter((_, i) => i !== idx)));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);

    const payload = {
      name: name.trim(),
      slug: slugify(slug),

      categoryId: categoryId || null,
      description: description || null,
      care: care || null,

      isActive: !!isActive,
      isFeatured: selectedCarousels.includes("featured"),
      isNew: selectedCarousels.includes("new"),
      carousels: selectedCarousels,

      isPersonalized: !!isPersonalized,
      productionDays: Number(productionDays) || 0,

      images: images
        .filter((i) => i.url.trim().length > 0)
        .map((i) => ({
          url: i.url.trim(),
          alt: (i.alt || "").trim() || null,
          sortOrder: Number(i.sortOrder) || 0,
        })),

      variants: variants.map((v) => ({
        sku: v.sku.trim(),
        priceCents: Number(v.priceCents) || 0,
        compareAtCents: v.compareAtCents ? Number(v.compareAtCents) : null,
        stock: Number(v.stock) || 0,
        isActive: !!v.isActive,
        size: v.size || null,
        finish: v.finish || null,
        color: v.color || null,
        personalization: v.personalization || null,
      })),
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

    setOk("Produto criado com sucesso.");
    router.push("/admin/produtos");
    router.refresh();
  }

  return (
    <AdminShell title="Novo produto">
      <form className="grid gap-6" onSubmit={onSubmit}>
        <div className="card p-5">
          <div className="text-sm font-semibold">Dados do produto</div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label>Nome</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cuia Premium Torpedo" />
            </div>

            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={slug} onChange={(e) => handleSlugChange(e.target.value)} placeholder="cuia-premium-torpedo" />
              <div className="text-[11px] text-[hsl(var(--muted))]">
                URL: <code>/produtos/{slugify(slug || name)}</code>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <option value="">Sem categoria</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Descrição</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Cuidados <span className="text-[hsl(var(--muted))]">(opcional)</span></Label>
              <Textarea value={care} onChange={(e) => setCare(e.target.value)} rows={4} />
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-4">
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
              <Label>Exibir em carrosséis</Label>
              <div className="flex flex-col gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 max-h-40 overflow-y-auto">
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

        <div className="card p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Imagens</div>
              <div className="text-xs text-[hsl(var(--muted))]">Cole uma URL ou selecione da galeria.</div>
            </div>

            <div className="flex flex-wrap gap-2">
              <CameraUploadButton onUploaded={addImageFromPicker} />
              <MediaPicker onPick={addImageFromPicker} />
              <Button type="button" variant="secondary" onClick={addImage}>
                Adicionar imagem
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {images.map((img, idx) => (
              <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                <div className="grid gap-3 md:grid-cols-6">
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
                      inputMode="numeric"
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

                <div className="mt-3 flex justify-end">
                  <button type="button" className="text-xs text-red-700 underline" onClick={() => removeImage(idx)}>
                    Remover imagem
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Variantes</div>
              <div className="text-xs text-[hsl(var(--muted))]">Preço em centavos (ex.: 14990 = R$ 149,90).</div>
            </div>
            <Button type="button" variant="secondary" onClick={addVariant}>
              Adicionar variante
            </Button>
          </div>

          <div className="mt-4 grid gap-4">
            {variants.map((v, idx) => (
              <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm font-semibold">Variante #{idx + 1}</div>
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="text-xs text-red-700 underline disabled:opacity-50"
                    disabled={variants.length <= 1}
                  >
                    Remover
                  </button>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label>SKU</Label>
                    <Input
                      value={v.sku}
                      onChange={(e) => {
                        const val = e.target.value;
                        setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, sku: val } : it)));
                      }}
                      placeholder="opcional (gerado automaticamente)"
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
                      <Input
                        value={v.size || ""}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, size: e.target.value } : it)))}
                        placeholder="Digite outro tamanho"
                      />
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
                      <Input
                        value={v.finish || ""}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, finish: e.target.value } : it)))}
                        placeholder="Digite outro acabamento"
                      />
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
                      <Input
                        value={v.color || ""}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, color: e.target.value } : it)))}
                        placeholder="Digite outra cor"
                      />
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
                    <Label>Preço (cents)</Label>
                    <Input
                      value={v.priceCents}
                      onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, priceCents: e.target.value } : it)))}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Preço promo (cents)</Label>
                    <Input
                      value={v.compareAtCents || ""}
                      onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, compareAtCents: e.target.value } : it)))}
                      inputMode="numeric"
                      placeholder="opcional"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Estoque</Label>
                    <Input
                      value={v.stock}
                      onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, stock: e.target.value } : it)))}
                      inputMode="numeric"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Ativa</Label>
                    <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
                      <input
                        checked={v.isActive}
                        onChange={(e) => setVariants((arr) => arr.map((it, i) => (i === idx ? { ...it, isActive: e.target.checked } : it)))}
                        type="checkbox"
                      />
                      <span className="text-sm">Sim</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {err && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div>}
        {ok && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{ok}</div>}

        <div className="flex gap-3">
          <Button type="submit" disabled={!canSave || loading}>
            {loading ? "Salvando..." : "Salvar produto"}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Cancelar
          </Button>
        </div>
      </form>
    </AdminShell>
  );
}
