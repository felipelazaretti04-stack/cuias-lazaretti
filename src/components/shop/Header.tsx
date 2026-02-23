import Link from "next/link";
import { getCart } from "@/lib/cart";
import { CartDrawer } from "@/components/shop/CartDrawer";

export async function Header() {
  const cart = await getCart();
  const count = cart.items.reduce((acc, it) => acc + it.qty, 0);

  return (
    <header className="border-b border-[hsl(var(--border))] bg-white/70 backdrop-blur">
      <div className="container flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]" />
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-wide">Cuias Lazaretti</div>
            <div className="text-xs text-[hsl(var(--muted))]">Premium • Erechim/RS</div>
          </div>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/produtos" className="hover:opacity-80">Produtos</Link>
          <Link href="/sobre" className="hover:opacity-80">Sobre</Link>
          <Link href="/contato" className="hover:opacity-80">Contato</Link>
          <Link href="/admin" className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
            Admin
          </Link>
          <CartDrawer count={count} />
        </nav>
      </div>
    </header>
  );
}
