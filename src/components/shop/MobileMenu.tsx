"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white"
        aria-label="Abrir menu"
      >
        <div className="grid gap-1">
          <span className="block h-0.5 w-5 bg-black" />
          <span className="block h-0.5 w-5 bg-black" />
          <span className="block h-0.5 w-5 bg-black" />
        </div>
      </button>

      {open ? (
        <div className="absolute left-0 right-0 top-[64px] border-b border-[hsl(var(--border))] bg-white">
          <div className="container py-4">
            <div className="grid gap-3 text-sm">
              <Link href="/produtos">Produtos</Link>
              <Link href="/sobre">Sobre</Link>
              <Link href="/contato">Contato</Link>
              <Link href="/produtos?featured=1">Destaques</Link>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
