"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { MediaPicker } from "@/components/admin/MediaPicker";

type TrustItem = { title: string; desc: string };

export default function AdminConteudoPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

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

  async function load() {
    setErr(null);
    setOk(null);
    setLoading(true);
    const res = await fetch("/api/admin/conteudo");
    setLoading(false);
    if (!res.ok) {
      setErr("Falha ao carregar conteúdo");
      return;
    }
    const data = await res.json();
    const c = data.content;

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
  }

  useEffect(() => { load(); }, []);

  function addTrust() {
    setTrustBarItems((arr) => [...arr, { title: "Novo item", desc: "Descrição" }]);
  }

  async function save() {
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

    setOk("Conteúdo atualizado. Recarregue a Home para ver.");
  }

  return (
    <AdminShell title="Conteúdo da Home">
      {loading ? (
        <div className="text-sm text-[hsl(var(--muted))]">Carregando...</div>
      ) : (
        <div className="grid gap-8">
          <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="text-sm font-semibold">Hero</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Badge</Label>
                <Input value={heroBadgeText} onChange={(e) => setHeroBadgeText(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Título</Label>
                <Input value={heroTitle} onChange={(e) => setHeroTitle(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Subtítulo</Label>
                <Textarea value={heroSubtitle} onChange={(e) => setHeroSubtitle(e.target.value)} rows={3} />
              </div>

              <div className="space-y-2">
                <Label>Botão primário (texto)</Label>
                <Input value={heroPrimaryButtonText} onChange={(e) => setHeroPrimaryButtonText(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Botão primário (link)</Label>
                <Input value={heroPrimaryButtonLink} onChange={(e) => setHeroPrimaryButtonLink(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Botão secundário (texto)</Label>
                <Input value={heroSecondaryButtonText} onChange={(e) => setHeroSecondaryButtonText(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Botão secundário (link)</Label>
                <Input value={heroSecondaryButtonLink} onChange={(e) => setHeroSecondaryButtonLink(e.target.value)} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Imagem do Hero</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="URL (ou selecione na galeria)" />
                  <MediaPicker onPick={(url) => setHeroImageUrl(url)} />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>Texto de escassez (pequeno)</Label>
                <Input value={scarcityText} onChange={(e) => setScarcityText(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
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
          </section>

          <section className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="text-sm font-semibold">Institucional</div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Título</Label>
                <Input value={institutionalTitle} onChange={(e) => setInstitutionalTitle(e.target.value)} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Texto</Label>
                <Textarea value={institutionalText} onChange={(e) => setInstitutionalText(e.target.value)} rows={3} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Imagem</Label>
                <div className="grid gap-2 md:grid-cols-2">
                  <Input value={institutionalImageUrl} onChange={(e) => setInstitutionalImageUrl(e.target.value)} placeholder="URL (ou selecione na galeria)" />
                  <MediaPicker onPick={(url) => setInstitutionalImageUrl(url)} />
                </div>
              </div>
            </div>
          </section>

          {err ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{err}</div> : null}
          {ok ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">{ok}</div> : null}

          <div className="flex gap-3">
            <Button disabled={saving} onClick={save}>
              {saving ? "Salvando..." : "Salvar"}
            </Button>
            <Button variant="secondary" onClick={load} disabled={saving}>Recarregar</Button>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
