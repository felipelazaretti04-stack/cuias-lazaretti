"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";

type Review = {
  id: string;
  rating: number;
  name: string;
  comment?: string | null;
  approved: boolean;
  createdAt: string;
  product: { name: string; slug: string };
};

export default function AdminAvaliacoesPage() {
  const [approved, setApproved] = useState<"" | "true" | "false">("false");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const q = approved ? `?approved=${approved}` : "";
    const res = await fetch(`/api/admin/avaliacoes${q}`);
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setReviews(data.reviews || []);
  }

  useEffect(() => { load(); }, [approved]);

  async function setStatus(id: string, value: boolean) {
    await fetch("/api/admin/avaliacoes", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, approved: value }),
    });
    await load();
  }

  return (
    <AdminShell title="Avaliações">
      <div className="flex flex-wrap items-center gap-2">
        <Button variant={approved === "false" ? "primary" : "secondary"} onClick={() => setApproved("false")}>
          Pendentes
        </Button>
        <Button variant={approved === "true" ? "primary" : "secondary"} onClick={() => setApproved("true")}>
          Aprovadas
        </Button>
        <Button variant={approved === "" ? "primary" : "secondary"} onClick={() => setApproved("")}>
          Todas
        </Button>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="text-sm text-[hsl(var(--muted))]">Carregando...</div>
        ) : reviews.length === 0 ? (
          <div className="text-sm text-[hsl(var(--muted))]">Sem avaliações.</div>
        ) : (
          reviews.map((r) => (
            <div key={r.id} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {r.product.name} — {r.rating}★
                  </div>
                  <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                    por <b>{r.name}</b> • {new Date(r.createdAt).toLocaleString("pt-BR")}
                  </div>
                  {r.comment ? <div className="mt-3 text-sm text-[hsl(var(--muted))]">{r.comment}</div> : null}
                </div>

                <div className="flex gap-2">
                  {r.approved ? (
                    <Button variant="secondary" onClick={() => setStatus(r.id, false)}>Reprovar</Button>
                  ) : (
                    <Button onClick={() => setStatus(r.id, true)}>Aprovar</Button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AdminShell>
  );
}
