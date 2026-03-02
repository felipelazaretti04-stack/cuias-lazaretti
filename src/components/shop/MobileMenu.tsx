"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SearchBar } from "@/components/shop/SearchBar";

type NavLink = {
  href: string;
  label: string;
};

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white p-2"
        aria-label="Abrir menu"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed left-0 top-0 z-50 h-full w-72 transform bg-white shadow-xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-[hsl(var(--border))] p-4">
          <div className="text-sm font-semibold">Menu</div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg p-1 hover:bg-[hsl(var(--accent))]"
            aria-label="Fechar menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-4">
          <SearchBar />
        </div>

        <nav className="flex flex-col">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="border-b border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 text-xs text-[hsl(var(--muted))]">
          Pagamento seguro • Checkout Mercado Pago
        </div>
      </div>
    </>
  );
}
