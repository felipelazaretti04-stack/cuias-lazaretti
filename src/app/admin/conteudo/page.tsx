"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";

type TrustItem = { title: string; desc: string };

type HeroSlide = {
  id: string;
  imageUrl: string | null;
  badge: string | null;
  title: string | null;
  highlight: string | null;
  subtitle: string | null;
  primaryText: string | null;
  primaryHref: string | null;
  secondaryText: string | null;
  secondaryHref: string | null;
  sortOrder: number;
  isActive: boolean;
};

type RailType = "FEATURED" | "NEW" | "BEST_SELLERS" | "PERSONALIZED" | "READY_TO_SHIP";

type HomeRail = {
  id: string;
  title: string;
  subtitle: string | null;
  hrefAll: string | null;
  type: RailType;
  limit: number;
  sortOrder: number;
  isActive: boolean;
};

function cx(...s: (string | false | null | undefined)[]) {
  return s.filter(Boolean).join(" ");
}

export default function AdminConteudoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  // SiteContent (mantém compatibilidade)
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [heroBadgeText, setHeroBadgeText] = useState("");
  const [heroPrimaryButtonText, setHeroPrimaryButtonText] = useState("");
  const [heroPrimaryButtonLink, setHeroPrimaryButtonLink] = useState("");
  const [heroSecondaryButtonText, setHeroSecondaryButtonText] = useState("");
  const [heroSecondaryButtonLink, setHeroSecondaryButtonLink] = useState("");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("");

  const [institutionalTitle, setInstitutionalTitle] = useState("");
  const [institutionalText, setInstitutionalText] = useState("");
  const [institutionalImageUrl, setInstitutionalImageUrl] = useState<string>("");

  const [scarcityText, setScarcityText] = useState("");
  const [trustBarItems, setTrustBarItems] = useState<TrustItem[]>([]);

  // NEW: slides & rails
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [rails, setRails] = useState<HomeRail[]>([]);

  const canAddSlide = useMemo(() => slides.length < 5, [slides.length]);

  async function loadAll() {
    setErr(null);
    setOk(null);
    setLoading(true);

    const [contentRes, slidesRes, railsRes] = await Promise.all([
      fetch("/api/admin/conteudo"),
      fetch("/api/admin/conteudo/slides"),
      fetch("/api/admin/conteudo/rails"),
    ]);

    setLoading(false);

    if (!contentRes.ok) {
      setErr("Falha ao carregar conteúdo (SiteContent)");
      return;
    }
    if (!slidesRes.ok) {
      setErr("Falha ao carregar slides do Hero");
      return;
    }
    if (!railsRes.ok) {
      setErr("Falha ao carregar carrosséis (rails)");
      return;
    }

    const contentData = await contentRes.json();
    const c = contentData.content;

    setHeroTitle(c.heroTitle || "");
    setHeroSubtitle(c.heroSubtitle || "");
    setHeroBadgeText(c.heroBadgeText || "");
    setHeroPrimaryButtonText(c.heroPrimaryButtonText || "");
    setHeroPrimaryButtonLink(c.heroPrimaryButtonLink || "");
    setHeroSecondaryButtonText(c.heroSecondaryButtonText || "");
    setHeroSecondaryButtonLink(c.heroSecondaryButtonLink || "");
    setHeroImageUrl(c.heroImageUrl || "");

    setInstitutionalTitle(c.institutionalTitle || "");
    setInstitutionalText(c.institutionalText || "");
    setInstitutionalImageUrl(c.institutionalImageUrl || "");

    setScarcityText(c.scarcityText || "");
    setTrustBarItems(c.trustBarItems || []);

    const slidesData = await slidesRes.json();
    setSlides((slidesData.slides || []) as HeroSlide[]);

    const railsData = await railsRes.json();
    setRails((railsData.rails || []) as HomeRail[]);
  }

  useEffect(() => {
    loadAll();
  }, []);

  function addTrust() {
    setTrustBarItems((arr) => [...arr, { title: "Novo item", desc: "Descrição" }]);
  }

  async function saveSiteContent() {
    setSaving(true);
    setErr(null);
    setOk(null);

    const payload = {
      heroTitle,
      heroSubtitle,
      heroBadgeText,
      heroPrimaryButtonText,
      heroPrimaryButtonLink,
      heroSecondaryButtonText,
      heroSecondaryButtonLink,
      heroImageUrl: heroImageUrl ? heroImageUrl : null,
      institutionalTitle,
      institutionalText,
      institutionalImageUrl: institutionalImageUrl ? institutionalImageUrl : null,
      scarcityText,
      trustBarItems,
    };

    const res = await fetch("/api/admin/conteudo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Erro ao salvar");
      return;
    }

    setOk("Conteúdo (texto/trust/institucional) atualizado.");
  }

  async function slideUpdate(id: string, patch: Partial<HeroSlide>) {
    const res = await fetch(`/api/admin/conteudo/slides/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Falha ao atualizar slide");
    }
  }

  async function railUpdate(id: string, patch: Partial<HomeRail>) {
    const res = await fetch(`/api/admin/conteudo/rails/${id}`, {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      throw new Error(data?.error || "Falha ao atualizar rail");
    }
  }

  async function addSlide() {
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/conteudo/slides", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          sortOrder: slides.length ? Math.max(...slides.map((s) => s.sortOrder)) + 1 : 0,
          isActive: true,
          badge: "Novo slide",
          title: "Título",
          highlight: "",
          subtitle: "",
          primaryText: "Ver produtos",
          primaryHref: "/produtos",
          secondaryText: "Contato",
          secondaryHref: "/contato",
          imageUrl: null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErr(data?.error || "Erro ao criar slide");
        return;
      }
      setOk("Slide criado.");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Erro ao criar slide");
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm("Remover este slide?")) return;
    setErr(null);
    setOk(null);
    const res = await fetch(`/api/admin/conteudo/slides/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao remover slide");
      return;
    }
    setOk("Slide removido.");
    await loadAll();
  }

  async function moveSlide(id: string, dir: -1 | 1) {
    const sorted = [...slides].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((s) => s.id === id);
    const other = sorted[idx + dir];
    if (!other) return;

    const a = sorted[idx];
    const b = other;

    try {
      await Promise.all([
        slideUpdate(a.id, { sortOrder: b.sortOrder }),
        slideUpdate(b.id, { sortOrder: a.sortOrder }),
      ]);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Falha ao reordenar slide");
    }
  }

  async function addRail() {
    setErr(null);
    setOk(null);
    try {
      const res = await fetch("/api/admin/conteudo/rails", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: "Novo carrossel",
          subtitle: "Descrição",
          hrefAll: "/produtos",
          type: "FEATURED",
          limit: 10,
          sortOrder: rails.length ? Math.max(...rails.map((r) => r.sortOrder)) + 1 : 0,
          isActive: true,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setErr(data?.error || "Erro ao criar carrossel");
        return;
      }

      setOk("Carrossel criado.");
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Erro ao criar carrossel");
    }
  }

  async function deleteRail(id: string) {
    if (!confirm("Remover este carrossel da Home?")) return;
    setErr(null);
    setOk(null);
    const res = await fetch(`/api/admin/conteudo/rails/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao remover carrossel");
      return;
    }
    setOk("Carrossel removido.");
    await loadAll();
  }

  async function moveRail(id: string, dir: -1 | 1) {
    const sorted = [...rails].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex((r) => r.id === id);
    const other = sorted[idx + dir];
    if (!other) return;

    const a = sorted[idx];
    const b = other;

    try {
      await Promise.all([
        railUpdate(a.id, { sortOrder: b.sortOrder }),
        railUpdate(b.id, { sortOrder: a.sortOrder }),
      ]);
      await loadAll();
    } catch (e: any) {
      setErr(e?.message || "Falha ao reordenar carrossel");
    }
  }

  return (
    <AdminShell title="Conteúdo da Home">
      {loading ? (
        <div className="text-sm text-[hsl(var(--muted))]">Carregando...</div>
      ) : (
        <div className="grid gap-8">
          {/* HERO SLIDES */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Hero • Slides (até 5)</div>
                <div className="text-xs text-[hsl(var(--muted))]">
                  Controle total do carrossel do topo (ordem, ativo/inativo, texto e botões).
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={loadAll}>Recarregar</Button>
                <Button type="button" onClick={addSlide} disabled={!canAddSlide}>
                  Adicionar slide
                </Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {slides
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((s) => (
                  <div key={s.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="text-sm font-semibold">
                        Slide #{s.sortOrder + 1}{" "}
                        <span className={cx("ml-2 text-xs", s.isActive ? "text-emerald-700" : "text-[hsl(var(--muted))]")}>
                          {s.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => moveSlide(s.id, -1)}>
                          ↑
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => moveSlide(s.id, 1)}>
                          ↓
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => deleteSlide(s.id)}>
                          Remover
                        </Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Imagem</Label>
                        <div className="grid gap-2 md:grid-cols-2">
                          <Input
                            value={s.imageUrl || ""}
                            onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, imageUrl: e.target.value } : x)))}
                            placeholder="https://..."
                          />
                          <MediaPicker
                            onPick={(url) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, imageUrl: url } : x)))}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={async () => {
                            try {
                              await slideUpdate(s.id, { imageUrl: (s.imageUrl || "").trim() ? s.imageUrl : null });
                              setOk("Slide atualizado.");
                            } catch (e: any) {
                              setErr(e?.message || "Falha ao salvar slide");
                            }
                          }}
                        >
                          Salvar imagem
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <Label>Ativo</Label>
                        <select
                          value={s.isActive ? "true" : "false"}
                          onChange={async (e) => {
                            const isActive = e.target.value === "true";
                            setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, isActive } : x)));
                            try {
                              await slideUpdate(s.id, { isActive });
                              setOk("Slide atualizado.");
                            } catch (e: any) {
                              setErr(e?.message || "Falha ao salvar slide");
                            }
                          }}
                          className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                        >
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>

                        <div className="space-y-2 mt-3">
                          <Label>Badge</Label>
                          <Input
                            value={s.badge || ""}
                            onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, badge: e.target.value } : x)))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Título</Label>
                          <Input
                            value={s.title || ""}
                            onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, title: e.target.value } : x)))}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Destaque (highlight)</Label>
                          <Input
                            value={s.highlight || ""}
                            onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, highlight: e.target.value } : x)))}
                            placeholder="palavra destacada"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label>Subtítulo</Label>
                        <Textarea
                          rows={3}
                          value={s.subtitle || ""}
                          onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, subtitle: e.target.value } : x)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Botão primário (texto)</Label>
                        <Input
                          value={s.primaryText || ""}
                          onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, primaryText: e.target.value } : x)))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Botão primário (link)</Label>
                        <Input
                          value={s.primaryHref || ""}
                          onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, primaryHref: e.target.value } : x)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Botão secundário (texto)</Label>
                        <Input
                          value={s.secondaryText || ""}
                          onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, secondaryText: e.target.value } : x)))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Botão secundário (link)</Label>
                        <Input
                          value={s.secondaryHref || ""}
                          onChange={(e) => setSlides((arr) => arr.map((x) => (x.id === s.id ? { ...x, secondaryHref: e.target.value } : x)))}
                        />
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          onClick={async () => {
                            try {
                              await slideUpdate(s.id, {
                                badge: s.badge || null,
                                title: s.title || null,
                                highlight: s.highlight || null,
                                subtitle: s.subtitle || null,
                                primaryText: s.primaryText || null,
                                primaryHref: s.primaryHref || null,
                                secondaryText: s.secondaryText || null,
                                secondaryHref: s.secondaryHref || null,
                                imageUrl: (s.imageUrl || "").trim() ? s.imageUrl : null,
                              });
                              setOk("Slide atualizado.");
                              await loadAll();
                            } catch (e: any) {
                              setErr(e?.message || "Falha ao salvar slide");
                            }
                          }}
                        >
                          Salvar slide
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {slides.length === 0 ? <div className="text-sm text-[hsl(var(--muted))]">Sem slides (rode seed).</div> : null}
            </div>
          </section>

          {/* HOME RAILS */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Carrosséis da Home</div>
                <div className="text-xs text-[hsl(var(--muted))]">Adicione/remova/reordene. Tipos automáticos (rápido).</div>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={loadAll}>Recarregar</Button>
                <Button type="button" onClick={addRail}>Adicionar carrossel</Button>
              </div>
            </div>

            <div className="mt-4 grid gap-4">
              {rails
                .slice()
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((r) => (
                  <div key={r.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="text-sm font-semibold">
                        {r.title}{" "}
                        <span className={cx("ml-2 text-xs", r.isActive ? "text-emerald-700" : "text-[hsl(var(--muted))]")}>
                          {r.isActive ? "Ativo" : "Inativo"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" onClick={() => moveRail(r.id, -1)}>↑</Button>
                        <Button type="button" variant="secondary" onClick={() => moveRail(r.id, 1)}>↓</Button>
                        <Button type="button" variant="secondary" onClick={() => deleteRail(r.id)}>Remover</Button>
                      </div>
                    </div>

                    <div className="mt-3 grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={r.title}
                          onChange={(e) => setRails((arr) => arr.map((x) => (x.id === r.id ? { ...x, title: e.target.value } : x)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Subtítulo</Label>
                        <Input
                          value={r.subtitle || ""}
                          onChange={(e) => setRails((arr) => arr.map((x) => (x.id === r.id ? { ...x, subtitle: e.target.value } : x)))}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Link "Ver todos"</Label>
                        <Input
                          value={r.hrefAll || ""}
                          onChange={(e) => setRails((arr) => arr.map((x) => (x.id === r.id ? { ...x, hrefAll: e.target.value } : x)))}
                          placeholder="/produtos?featured=1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <select
                          value={r.type}
                          onChange={(e) => setRails((arr) => arr.map((x) => (x.id === r.id ? { ...x, type: e.target.value as RailType } : x)))}
                          className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                        >
                          <option value="FEATURED">Destaques (isFeatured)</option>
                          <option value="NEW">Novidades (isNew)</option>
                          <option value="BEST_SELLERS">Mais vendidos</option>
                          <option value="PERSONALIZED">Personalizáveis</option>
                          <option value="READY_TO_SHIP">Prontas pra envio (&lt;= 1 dia)</option>
                        </select>
                      </div>

                      <div className="space-y-2">
                        <Label>Limite</Label>
                        <Input
                          value={String(r.limit)}
                          onChange={(e) => setRails((arr) => arr.map((x) => (x.id === r.id ? { ...x, limit: Number(e.target.value) || 8 } : x)))}
                          inputMode="numeric"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Ativo</Label>
                        <select
                          value={r.isActive ? "true" : "false"}
                          onChange={(e) => setRails((arr) => arr.map((x) => (x.id === r.id ? { ...x, isActive: e.target.value === "true" } : x)))}
                          className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                        >
                          <option value="true">Sim</option>
                          <option value="false">Não</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <Button
                          type="button"
                          onClick={async () => {
                            try {
                              await railUpdate(r.id, {
                                title: r.title,
                                subtitle: r.subtitle || null,
                                hrefAll: (r.hrefAll || "").trim() ? r.hrefAll : null,
                                type: r.type,
                                limit: r.limit,
                                isActive: r.isActive,
                              });
                              setOk("Carrossel atualizado.");
                              await loadAll();
                            } catch (e: any) {
                              setErr(e?.message || "Falha ao salvar carrossel");
                            }
                          }}
                        >
                          Salvar carrossel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              {rails.length === 0 ? <div className="text-sm text-[hsl(var(--muted))]">Sem carrosséis (rode seed).</div> : null}
            </div>
          </section>

          {/* SITE CONTENT (texto/trust/institucional) */}
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="text-sm font-semibold">Conteúdo (texto/Trust/Institucional)</div>
            <div className="mt-2 text-xs text-[hsl(var(--muted))]">
              Mantemos isso para compatibilidade e para textos fixos fora do carrossel.
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Texto de escassez (pequeno)</Label>
                <Input value={scarcityText} onChange={(e) => setScarcityText(e.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Institucional • Título</Label>
                <Input value={institutionalTitle} onChange={(e) => setInstitutionalTitle(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Institucional • Texto</Label>
                <Textarea value={institutionalText} onChange={(e) => setInstitutionalText(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Institucional • Imagem</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input value={institutionalImageUrl} onChange={(e) => setInstitutionalImageUrl(e.target.value)} placeholder="URL (ou selecione na galeria)" />
                  <MediaPicker onPick={(url) => setInstitutionalImageUrl(url)} />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Trust Bar</div>
                <Button type="button" variant="secondary" onClick={addTrust}>Adicionar item</Button>
              </div>

              <div className="mt-4 grid gap-3">
                {trustBarItems.map((it, idx) => (
                  <div key={idx} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Título</Label>
                        <Input
                          value={it.title}
                          onChange={(e) =>
                            setTrustBarItems((arr) => arr.map((x, i) => (i === idx ? { ...x, title: e.target.value } : x)))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Descrição</Label>
                        <Input
                          value={it.desc}
                          onChange={(e) =>
                            setTrustBarItems((arr) => arr.map((x, i) => (i === idx ? { ...x, desc: e.target.value } : x)))
                          }
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <button
                        className="text-xs text-[hsl(var(--muted))] underline"
                        onClick={() => setTrustBarItems((arr) => arr.filter((_, i) => i !== idx))}
                        type="button"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                ))}
                {trustBarItems.length === 0 ? (
                  <div className="text-sm text-[hsl(var(--muted))]">Sem itens.</div>
                ) : null}
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button disabled={saving} onClick={saveSiteContent}>
                {saving ? "Salvando..." : "Salvar textos"}
              </Button>
              <Button variant="secondary" onClick={loadAll} disabled={saving}>
                Recarregar tudo
              </Button>
            </div>
          </section>

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div> : null}
          {ok ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{ok}</div> : null}
        </div>
      )}
    </AdminShell>
  );
}
