"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { track } from "@/lib/analytics";

export function AddToCart({ variants }: { variants: Array<{ id: string; label: string; priceBRL: string; stock: number }> }) {
  const [variantId, setVariantId] = useState(variants[0]?.id || "");
  const [qty, setQty] = useState(1);
  const selected = useMemo(() => variants.find(v => v.id === variantId), [variantId, variants]);
  const disabled = !selected || selected.stock <= 0;

  async function add() {
    const res = await fetch("/api/cart/add", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ variantId, qty }),
    });

    if (res.ok) {
      track("AddToCart", { content_type: "product", content_ids: [variantId], value: 0, currency: "BRL" });
      window.location.href = "/carrinho";
      return;
    }
    const data = await res.json().catch(() => null);
    alert(data?.error || "Erro ao adicionar ao carrinho");
  }

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold">Escolha a variação</div>

      <div className="mt-3 space-y-2">
        <select
          value={variantId}
          onChange={(e) => setVariantId(e.target.value)}
          className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
        >
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.label} — {v.priceBRL} {v.stock <= 0 ? "(sem estoque)" : ""}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min={1}
            max={20}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Math.min(20, Number(e.target.value || 1))))}
            className="w-full rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
          />
          <Button onClick={add} disabled={disabled} className="w-full">
            {disabled ? "Sem estoque" : "Adicionar ao carrinho"}
          </Button>
        </div>

        <div className="text-xs text-[hsl(var(--muted))]">
          No checkout você pode escolher <b>Retirada em Erechim</b> ou <b>PAC</b>.
        </div>
      </div>
    </div>
  );
}
