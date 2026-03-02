import Link from "next/link";
import { getCart } from "@/lib/cart";
import { ShoppingBag, UserRound } from "lucide-react";
import { SearchBar } from "@/components/shop/SearchBar";

export async function Header() {
  const cart = await getCart();
  const count = cart.items.reduce((acc, it) => acc + it.qty, 0);

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-white/75 backdrop-blur">
      <div className="container grid grid-cols-2 items-center gap-3 py-3 md:grid-cols-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Cuias Lazaretti</div>
            <div className="text-xs text-[hsl(var(--muted))]">Premium • Erechim/RS</div>
          </div>
        </Link>

        <div className="hidden md:flex md:justify-center">
          <SearchBar />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
            title="Conta/Admin"
          >
            <UserRound size={16} />
            <span className="hidden sm:inline">Conta</span>
          </Link>

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

      {/* nav secundário */}
      <div className="border-t border-[hsl(var(--border))] bg-white">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex gap-4">
            <Link href="/produtos?cat=cuias" className="hover:opacity-80">Cuias</Link>
            <Link href="/produtos?cat=bombas" className="hover:opacity-80">Bombas</Link>
            <Link href="/produtos?cat=acessorios" className="hover:opacity-80">Acessórios</Link>
          </div>
          <div className="text-xs text-[hsl(var(--muted))] hidden md:block">
            Pagamento seguro • Checkout Mercado Pago
          </div>
        </div>
      </div>
    </header>
  );
}