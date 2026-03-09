// file: src/components/shop/Header.tsx
import Link from "next/link";
import Image from "next/image";
import { getCart } from "@/lib/cart";
import { ShoppingBag, Phone, MapPin, PackageSearch } from "lucide-react";
import { SearchBar } from "@/components/shop/SearchBar";
import { MobileMenu } from "@/components/shop/MobileMenu";

export async function Header() {
  const cart = await getCart();
  const count = cart.items.reduce((acc, it) => acc + it.qty, 0);

  const whatsappRaw = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const whatsappDigits = whatsappRaw.replace(/\D/g, "");
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS || "Erechim/RS";
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-white/90 backdrop-blur">
      <div className="border-b border-[hsl(var(--border))] bg-[hsl(var(--bg))]">
        <div className="container flex min-h-10 items-center justify-between gap-3 py-2 text-xs">
          <div className="flex min-w-0 flex-wrap items-center gap-3 text-[hsl(var(--muted))]">
            {whatsappDigits && (
              <a
                href={`https://wa.me/55${whatsappDigits}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-green-700 transition hover:bg-green-100"
              >
                <Phone size={12} />
                <span className="font-medium">WhatsApp</span>
              </a>
            )}

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 transition hover:text-[hsl(var(--fg))]"
            >
              <MapPin size={12} />
              <span className="hidden sm:inline">{address}</span>
              <span className="sm:hidden">Endereço</span>
            </a>
          </div>

          <div className="hidden text-[hsl(var(--muted))] md:block">
            Retirada em Erechim/RS • Envio para todo o Brasil
          </div>
        </div>
      </div>

      <div className="container grid grid-cols-[1fr_auto_auto] items-center gap-3 py-3 md:grid-cols-3">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <div className="relative h-10 w-12 overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-white">
            <Image
              src="/brand/logo-mark.png"
              alt="Cuias Lazaretti"
              fill
              className="object-contain p-1.5"
              priority
            />
          </div>

          <div className="min-w-0 leading-tight">
            <div className="truncate text-sm font-semibold tracking-wide">Cuias Lazaretti</div>
            <div className="truncate text-xs text-[hsl(var(--muted))]">Artesanal premium • Erechim/RS</div>
          </div>
        </Link>

        <div className="hidden md:flex md:justify-center">
          <div className="w-full max-w-xl">
            <SearchBar />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <div className="md:hidden">
            <MobileMenu />
          </div>

          <Link
            href="/meus-pedidos"
            className="hidden items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm hover:bg-[hsl(var(--accent))] md:inline-flex"
          >
            <PackageSearch size={16} />
            <span>Meus pedidos</span>
          </Link>

          <Link
            href="/carrinho"
            className="relative inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-3 py-2 text-sm font-medium text-white hover:opacity-95"
            title="Carrinho"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Carrinho</span>
            {count > 0 && (
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[hsl(var(--gold))] px-1 text-[11px] font-bold text-[hsl(var(--leather))]">
                {count}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="hidden border-t border-[hsl(var(--border))] bg-white md:block">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex items-center gap-5">
            <Link href="/produtos?cat=cuias" className="hover:text-[hsl(var(--primary))]">Cuias</Link>
            <Link href="/produtos?cat=bombas" className="hover:text-[hsl(var(--primary))]">Bombas</Link>
            <Link href="/produtos?cat=acessorios" className="hover:text-[hsl(var(--primary))]">Acessórios</Link>
            <Link href="/sobre" className="hover:text-[hsl(var(--primary))]">Sobre</Link>
            <Link href="/contato" className="hover:text-[hsl(var(--primary))]">Contato</Link>
          </div>

          <div className="text-xs text-[hsl(var(--muted))]">
            Pagamento seguro • Mercado Pago
          </div>
        </div>
      </div>
    </header>
  );
}
