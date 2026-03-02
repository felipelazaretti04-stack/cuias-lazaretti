"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const links = [
  { href: "/admin/conteudo", label: "Conteúdo" },
  { href: "/admin/midias", label: "Mídias" },
  { href: "/admin/pedidos", label: "Pedidos" },
  { href: "/admin/produtos", label: "Produtos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/clientes", label: "Clientes" },
  { href: "/admin/avaliacoes", label: "Avaliações" },
  { href: "/admin/cupons", label: "Cupons" },
];

export function AdminNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-[hsl(var(--border))] bg-white">
      <div className="container flex items-center justify-between gap-3 py-3">
        <Link href="/admin" className="text-sm font-semibold">
          Cuias Lazaretti • Admin
        </Link>

        {/* Desktop */}
        <div className="hidden flex-wrap items-center gap-3 text-sm md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:opacity-80">
              {l.label}
            </Link>
          ))}
          <form action="/api/auth/logout" method="post">
            <button className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
              Sair
            </button>
          </form>
        </div>

        {/* Mobile */}
        <button
          className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white p-2 md:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          type="button"
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open ? (
        <div className="md:hidden border-t border-[hsl(var(--border))] bg-white">
          <div className="container grid gap-2 py-3">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm"
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            <form action="/api/auth/logout" method="post">
              <button className="w-full rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-white">
                Sair
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
