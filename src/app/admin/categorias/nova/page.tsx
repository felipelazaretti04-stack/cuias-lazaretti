"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function NovaCategoriaPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name, sortOrder, isActive }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Erro ao salvar");
      return;
    }

    router.push("/admin/categorias");
    router.refresh();
  }

  return (
    <AdminShell title="Nova categoria">
      <form className="grid gap-4 max-w-xl" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label>Nome</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Cuias" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Ordem</Label>
            <Input value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} inputMode="numeric" />
          </div>

          <div className="space-y-2">
            <Label>Ativa</Label>
            <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2">
              <input checked={isActive} onChange={(e) => setIsActive(e.target.checked)} type="checkbox" />
              <span className="text-sm">Mostrar no site</span>
            </div>
          </div>
        </div>

        {err ? <div className="text-sm text-red-700">{err}</div> : null}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>Salvar</Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        </div>
      </form>
    </AdminShell>
  );
}
