"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type Asset = { id: string; url: string; alt?: string | null; createdAt: string };

export function MediaPicker({ onPick }: { onPick: (url: string) => void }) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/midias");
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setAssets(data.assets || []);
  }

  useEffect(() => {
    if (open) load();
  }, [open]);

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Selecionar da galeria
      </Button>
    );
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-xs text-[hsl(var(--muted))]">Galeria</div>
        <button className="text-xs underline" type="button" onClick={() => setOpen(false)}>
          Fechar
        </button>
      </div>

      {loading ? (
        <div className="mt-2 text-xs text-[hsl(var(--muted))]">Carregando...</div>
      ) : (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {assets.slice(0, 24).map((a) => (
            <button
              key={a.id}
              type="button"
              className="aspect-square overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]"
              onClick={() => {
                onPick(a.url);
                setOpen(false);
              }}
              title={a.alt || ""}
            >
              {/* img simples pra não depender do next/image dentro do picker */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.alt || "media"} className="h-full w-full object-cover" />
            </button>
          ))}
          {assets.length === 0 ? (
            <div className="col-span-3 text-xs text-[hsl(var(--muted))]">Sem mídias ainda.</div>
          ) : null}
        </div>
      )}
    </div>
  );
}
