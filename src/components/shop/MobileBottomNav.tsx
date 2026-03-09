// file: src/components/shop/MobileBottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function Item({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] ${
        active ? "text-[hsl(var(--primary))]" : "text-[hsl(var(--muted))]"
      }`}
    >
      <span className="h-5 w-5">{children}</span>
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-[hsl(var(--border))] bg-white/95 backdrop-blur md:hidden">
      <div className="mx-auto flex h-16 max-w-xl items-center">
        <Item href="/" label="Início" active={pathname === "/"}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 10.5 12 3l9 7.5" />
            <path d="M5 9.5V21h14V9.5" />
          </svg>
        </Item>

        <Item href="/produtos" label="Buscar" active={pathname.startsWith("/produtos")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </Item>

        <Item href="/carrinho" label="Carrinho" active={pathname.startsWith("/carrinho")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="9" cy="20" r="1" />
            <circle cx="18" cy="20" r="1" />
            <path d="M3 4h2l2.4 10.2A2 2 0 0 0 9.35 16H18a2 2 0 0 0 1.94-1.5L21 8H7" />
          </svg>
        </Item>

        <Item href="/meus-pedidos" label="Pedidos" active={pathname.startsWith("/meus-pedidos")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 11l3 3L22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </Item>

        <button
          type="button"
          aria-label="Abrir menu"
          className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 py-2 text-[11px] text-[hsl(var(--muted))]"
          onClick={() => {
            window.dispatchEvent(new CustomEvent("open-mobile-menu"));
          }}
        >
          <span className="h-5 w-5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16" />
              <path d="M4 12h16" />
              <path d="M4 18h16" />
            </svg>
          </span>
          <span>Menu</span>
        </button>
      </div>
    </nav>
  );
}
