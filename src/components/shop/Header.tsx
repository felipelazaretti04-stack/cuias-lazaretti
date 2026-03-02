import Link from "next/link";
import { getCart } from "@/lib/cart";
import { ShoppingBag } from "lucide-react";
import { SearchBar } from "@/components/shop/SearchBar";
import { MobileMenu } from "@/components/shop/MobileMenu";

export async function Header() {
  const cart = await getCart();
  const count = cart.items.reduce((acc, it) => acc + it.qty, 0);

  const navLinks = [
    { href: "/produtos", label: "Todos" },
    { href: "/produtos?cat=cuias", label: "Cuias" },
    { href: "/produtos?cat=bombas", label: "Bombas" },
    { href: "/produtos?cat=acessorios", label: "Acessórios" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[hsl(var(--border))] bg-white/75 backdrop-blur">
      <div className="container flex items-center justify-between gap-3 py-3">
        {/* Mobile: Menu hambúrguer */}
        <div className="md:hidden">
          <MobileMenu links={navLinks} />
        </div>

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]" />
          <div className="hidden leading-tight sm:block">
            <div className="text-sm font-semibold tracking-wide">Cuias Lazaretti</div>
            <div className="text-xs text-[hsl(var(--muted))]">Premium • Erechim/RS</div>
          </div>
        </Link>

        {/* Desktop: SearchBar */}
        <div className="hidden flex-1 justify-center md:flex">
          <SearchBar />
        </div>

        {/* Carrinho */}
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

      {/* Desktop: nav secundário */}
      <div className="hidden border-t border-[hsl(var(--border))] bg-white md:block">
        <div className="container flex items-center justify-between py-2 text-sm">
          <div className="flex gap-4">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:opacity-80">
                {link.label}
              </Link>
            ))}
          </div>
          <div className="text-xs text-[hsl(var(--muted))]">
            Pagamento seguro • Checkout Mercado Pago
          </div>
        </div>
      </div>
    </header>
  );
}
