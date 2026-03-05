"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  // Trava scroll do body quando menu aberto
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white"
        aria-label={open ? "Fechar menu" : "Abrir menu"}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 top-[64px] z-40 bg-black/30"
            onClick={() => setOpen(false)}
          />
          
          {/* Menu */}
          <div className="fixed left-0 right-0 top-[64px] z-50 border-b border-[hsl(var(--border))] bg-white shadow-lg">
            <div className="px-4 py-4">
              <nav className="grid gap-3 text-sm">
                <Link href="/produtos" className="py-2 hover:text-[hsl(var(--primary))]">
                  Produtos
                </Link>
                <Link href="/produtos?featured=1" className="py-2 hover:text-[hsl(var(--primary))]">
                  Destaques
                </Link>
                <Link href="/sobre" className="py-2 hover:text-[hsl(var(--primary))]">
                  Sobre
                </Link>
                <Link href="/contato" className="py-2 hover:text-[hsl(var(--primary))]">
                  Contato
                </Link>
              </nav>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
