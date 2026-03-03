"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function AdminLoginPage() {
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

    // garante navegação completa (cookie)
    window.location.href = next;
  }

  return (
    <div className="container py-16">
      <div className="mx-auto max-w-md card p-8">
        <h1 className="text-2xl font-semibold">Login do Admin</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">Acesso restrito.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <Label>E-mail</Label>
            <Input
              data-testid="admin-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@..."
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label>Senha</Label>
            <Input
              data-testid="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {err ? <div className="text-sm text-red-700">{err}</div> : null}

          <Button data-testid="admin-login-submit" disabled={loading} className="w-full" type="submit">
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
