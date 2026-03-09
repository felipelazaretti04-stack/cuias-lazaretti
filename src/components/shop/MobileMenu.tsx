// file: src/components/shop/MobileMenu.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MapPin, PackageSearch } from "lucide-react";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  const whatsappRaw = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const whatsappDigits = whatsappRaw.replace(/\D/g, "");
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS || "Erechim/RS";

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("open-mobile-menu", onOpen as EventListener);
    return () => window.removeEventListener("open-mobile-menu", onOpen as EventListener);
  }, []);

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

      {open ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)} />

          <div className="fixed inset-x-0 top-0 z-50 max-h-dvh overflow-y-auto rounded-b-3xl border-b border-[hsl(var(--border))] bg-white shadow-xl">
            <div className="container py-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Menu</div>
                  <div className="text-xs text-[hsl(var(--muted))]">Acesse produtos, pedidos e informações</div>
                </div>

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mt-5 grid gap-5">
                <section>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                    Comprar
                  </div>
                  <nav className="grid overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
                    <Link href="/" className="px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Início</Link>
                    <Link href="/produtos" className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Produtos</Link>
                    <Link href="/produtos?featured=1" className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Destaques</Link>
                    <Link href="/meus-pedidos" className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">
                      <span className="inline-flex items-center gap-2">
                        <PackageSearch size={16} />
                        Meus pedidos
                      </span>
                    </Link>
                  </nav>
                </section>

                <section>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-[hsl(var(--muted))]">
                    Institucional
                  </div>
                  <nav className="grid overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
                    <Link href="/sobre" className="px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Sobre</Link>
                    <Link href="/contato" className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Contato</Link>
                    <Link href="/privacidade" className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Privacidade</Link>
                    <Link href="/termos" className="border-t border-[hsl(var(--border))] px-4 py-3 text-sm hover:bg-[hsl(var(--accent))]">Termos</Link>
                  </nav>
                </section>

                <section className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
                  <div className="text-sm font-semibold">Atendimento</div>

                  <div className="mt-3 grid gap-3 text-sm">
                    {whatsappDigits ? (
                      <a
                        href={`https://wa.me/55${whatsappDigits}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 text-green-700"
                      >
                        <Phone size={16} />
                        <span>{whatsappRaw}</span>
                      </a>
                    ) : null}

                    <div className="inline-flex items-start gap-2 text-[hsl(var(--muted))]">
                      <MapPin size={16} className="mt-0.5 shrink-0" />
                      <span>{address}</span>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
