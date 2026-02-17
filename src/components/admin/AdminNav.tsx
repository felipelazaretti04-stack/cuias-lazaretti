import Link from "next/link";

export function AdminNav() {
  return (
    <div className="border-b border-[hsl(var(--border))] bg-white">
      <div className="container flex items-center justify-between py-3">
        <Link href="/admin" className="text-sm font-semibold">Cuias Lazaretti • Admin</Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/admin/categorias" className="hover:opacity-80">Categorias</Link>
          <Link href="/admin/produtos" className="hover:opacity-80">Produtos</Link>
          <form action="/api/auth/logout" method="post">
            <button className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
              Sair
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
