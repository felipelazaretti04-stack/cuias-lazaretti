import Link from "next/link";

export function AdminNav() {
  return (
    <div className="border-b border-[hsl(var(--border))] bg-white">
      <div className="container flex flex-wrap items-center justify-between gap-3 py-3">
        <Link href="/admin" className="text-sm font-semibold">Cuias Lazaretti • Admin</Link>

        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link href="/admin/conteudo" className="hover:opacity-80">Conteúdo</Link>
          <Link href="/admin/midias" className="hover:opacity-80">Mídias</Link>
          <Link href="/admin/pedidos" className="hover:opacity-80">Pedidos</Link>
          <Link href="/admin/produtos" className="hover:opacity-80">Produtos</Link>
          <Link href="/admin/categorias" className="hover:opacity-80">Categorias</Link>
          <Link href="/admin/clientes" className="hover:opacity-80">Clientes</Link>
          <Link href="/admin/avaliacoes" className="hover:opacity-80">Avaliações</Link>
          <Link href="/admin/cupons" className="hover:opacity-80">Cupons</Link>

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
