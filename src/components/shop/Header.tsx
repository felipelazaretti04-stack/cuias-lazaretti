// file: src/components/shop/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/lib/cart";
import { ShoppingBag, Phone, MapPin } from "lucide-react";
import { SearchBar } from "@/components/shop/SearchBar";
import { MobileMenu } from "@/components/shop/MobileMenu";

export async function Header() {
  const cart = await getCart();
  const count = cart.items.reduce((acc, it) => acc + it.qty, 0);

  const whatsapp = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS || "Erechim/RS";

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-white/75 backdrop-blur">
      {/* Faixa de contato */}
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]">
        <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs text-[hsl(var(--muted))]">
          <div className="flex items-center gap-4">
            {whatsapp && (
              <a
                href={`https://wa.me/55${whatsapp.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-[hsl(var(--fg))]"
              >
                <Phone size={12} />
                <span>{whatsapp}</span>
              </a>
            )}
            <span className="hidden items-center gap-1 sm:flex">
              <MapPin size={12} />
              <span>{address}</span>
            </span>
          </div>
          <span className="hidden md:block">Envio para todo o Brasil</span>
        </div>
      </div>

      <div className="container relative grid grid-cols-2 items-center gap-3 py-3 md:grid-cols-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-12 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
            <Image
              src="/brand/logo-mark.png"
              alt="Cuias Lazaretti"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Cuias Lazaretti</div>
            <div className="text-xs text-[hsl(var(--muted))]">Premium • Erechim/RS</div>
          </div>
        </Link>

        <div className="hidden md:flex md:justify-center">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end gap-2">
          <MobileMenu />

          <Link
            href="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            title="Carrinho"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 ? (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--gold))] px-1 text-[11px] font-bold text-[hsl(var(--leather))]">
                {count}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      <div className="hidden border-t border-[hsl(var(--border))] bg-white md:block">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex gap-4">
            <Link href="/produtos?cat=cuias" className="hover:opacity-80">Cuias</Link>
            <Link href="/produtos?cat=bombas" className="hover:opacity-80">Bombas</Link>
            <Link href="/produtos?cat=acessorios" className="hover:opacity-80">Acessórios</Link>
            <Link href="/meus-pedidos" className="hover:opacity-80">Meus pedidos</Link>
          </div>
          <div className="hidden text-xs text-[hsl(var(--muted))] md:block">
            Pagamento seguro • Checkout Mercado Pago
          </div>
        </div>
      </div>
    </header>
  );
}
