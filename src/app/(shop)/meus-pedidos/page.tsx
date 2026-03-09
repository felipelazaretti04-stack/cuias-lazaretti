// file: src/app/(shop)/meus-pedidos/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function MeusPedidosPage() {
  const router = useRouter();
  const [publicId, setPublicId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/orders/lookup", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        publicId: publicId.trim(),
        email: email.trim().toLowerCase(),
      }),
    });

    setLoading(false);

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      setErr(data?.error || "Pedido não encontrado");
      return;
    }

    router.push(`/pedido/${data.publicId}`);
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-xl">
        <h1 className="text-3xl font-semibold">Meus pedidos</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Consulte o andamento do seu pedido informando o número e o e-mail usado na compra.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 card p-6 space-y-4">
          <div className="space-y-2">
            <Label>Número do pedido</Label>
            <Input
              value={publicId}
              onChange={(e) => setPublicId(e.target.value)}
              placeholder="Ex.: CLZ-20260309-5564"
            />
          </div>

          <div className="space-y-2">
            <Label>E-mail da compra</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@email.com"
            />
          </div>

          {err ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {err}
            </div>
          ) : null}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Consultando..." : "Acompanhar pedido"}
          </Button>
        </form>
      </div>
    </div>
  );
}
