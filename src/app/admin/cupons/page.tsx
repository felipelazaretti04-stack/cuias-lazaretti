"use client";

import { useEffect, useState } from "react";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

type Coupon = {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  active: boolean;
  expiresAt?: string | null;
  maxUses?: number | null;
  usesCount: number;
};

export default function AdminCuponsPage() {
  const [cupons, setCupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"PERCENTAGE" | "FIXED">("PERCENTAGE");
  const [value, setValue] = useState("10");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/cupons");
    setLoading(false);
    if (!res.ok) return;
    const data = await res.json();
    setCupons(data.cupons || []);
  }

  useEffect(() => { load(); }, []);

  async function create() {
    await fetch("/api/admin/cupons", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        code,
        type,
        value,
        active: true,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
        maxUses: maxUses ? Number(maxUses) : null,
      }),
    });
    setCode("");
    setValue("10");
    setExpiresAt("");
    setMaxUses("");
    await load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/admin/cupons", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, active: !active }),
    });
    await load();
  }

  return (
    <AdminShell title="Cupons">
      <div className="grid gap-6">
        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="text-sm font-semibold">Novo cupom</div>
          <div className="mt-4 grid gap-4 md:grid-cols-5">
            <div className="space-y-2 md:col-span-2">
              <Label>Código</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="BEMVINDO10" />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="PERCENTAGE">%</option>
                <option value="FIXED">R$ fixo</option>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input value={value} onChange={(e) => setValue(e.target.value)} />
              <div className="text-[11px] text-[hsl(var(--muted))]">
                FIXED em centavos (ex.: 2000 = R$ 20,00)
              </div>
            </div>
            <div className="space-y-2">
              <Label>Máx usos (opcional)</Label>
              <Input value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Ex.: 100" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Expira em (opcional)</Label>
              <Input value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} placeholder="2026-12-31" />
            </div>

            <div className="md:col-span-5">
              <Button onClick={create} disabled={!code.trim()}>
                Criar cupom
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="text-sm font-semibold">Lista</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[hsl(var(--muted))]">
                  <th className="py-2">Código</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Ativo</th>
                  <th>Usos</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="py-3" colSpan={6}>Carregando...</td></tr>
                ) : cupons.map((c) => (
                  <tr key={c.id} className="border-t border-[hsl(var(--border))]">
                    <td className="py-3 font-medium">{c.code}</td>
                    <td>{c.type}</td>
                    <td>{c.value}</td>
                    <td>{c.active ? "Sim" : "Não"}</td>
                    <td>{c.usesCount}{c.maxUses ? `/${c.maxUses}` : ""}</td>
                    <td>
                      <Button variant="secondary" onClick={() => toggle(c.id, c.active)}>
                        {c.active ? "Desativar" : "Ativar"}
                      </Button>
                    </td>
                  </tr>
                ))}
                {!loading && cupons.length === 0 ? (
                  <tr><td className="py-3 text-[hsl(var(--muted))]" colSpan={6}>Sem cupons.</td></tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
