"use client";

export const dynamic = "force-dynamic";


import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function AdminLoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setErr(data?.error || "Falha no login");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md card p-8">
        <h1 className="text-2xl font-semibold">Login do Admin</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Acesso restrito.
        </p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@..." />
          </div>
          <div className="space-y-2">
            <Label>Senha</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {err ? <div className="text-sm text-red-700">{err}</div> : null}

          <Button disabled={loading} className="w-full" type="submit">
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <div className="text-xs text-[hsl(var(--muted))]">
            Seed cria 1 admin via <code>SEED_ADMIN_EMAIL</code> e <code>SEED_ADMIN_PASSWORD</code>.
          </div>
        </form>
      </div>
    </div>
  );
}
