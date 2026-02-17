import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminHome() {
  return (
    <AdminShell title="Painel">
      <div className="grid gap-4 md:grid-cols-2">
        <Link href="/admin/produtos" className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 hover:bg-[hsl(var(--accent))]">
          <div className="text-sm font-semibold">Produtos</div>
          <div className="mt-1 text-sm text-[hsl(var(--muted))]">Cadastrar e gerenciar variantes/estoque.</div>
        </Link>
        <Link href="/admin/categorias" className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 hover:bg-[hsl(var(--accent))]">
          <div className="text-sm font-semibold">Categorias</div>
          <div className="mt-1 text-sm text-[hsl(var(--muted))]">Organizar catálogo por slug amigável.</div>
        </Link>
      </div>
      <div className="mt-6 text-xs text-[hsl(var(--muted))]">
        Pedidos entram no Bloco B.
      </div>
    </AdminShell>
  );
}
