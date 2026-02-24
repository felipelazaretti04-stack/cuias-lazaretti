"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState("5");
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ productId, rating, name, comment }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha ao enviar avaliação");
      return;
    }

    setMsg("Avaliação enviada! Após aprovação, ela aparecerá no site.");
    setName("");
    setComment("");
    setRating("5");
  }

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold">Deixar uma avaliação</div>
      <div className="mt-1 text-xs text-[hsl(var(--muted))]">
        Sua avaliação passa por aprovação antes de aparecer no site.
      </div>

      <form className="mt-4 grid gap-4" onSubmit={submit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome" />
          </div>
          <div className="space-y-2">
            <Label>Nota</Label>
            <select
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
            >
              <option value="5">5 — excelente</option>
              <option value="4">4 — muito bom</option>
              <option value="3">3 — bom</option>
              <option value="2">2 — ok</option>
              <option value="1">1 — ruim</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Comentário (opcional)</Label>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="O que tu achou?" />
        </div>

        {err ? <div className="text-sm text-red-700">{err}</div> : null}
        {msg ? <div className="text-sm text-emerald-800">{msg}</div> : null}

        <Button disabled={loading} type="submit">
          {loading ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </form>
    </div>
  );
}
