import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[hsl(var(--border))] bg-white">
      <div className="container py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="text-sm font-semibold">Cuias Lazaretti</div>
            <p className="mt-2 max-w-xl text-sm text-[hsl(var(--muted))]">
              A cuia certa pro teu mate. Cuias premium, bombas e acessórios com estética clean e acabamento de verdade.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge">Checkout Mercado Pago</span>
              <span className="badge">Envio Brasil</span>
              <span className="badge">Retirada em Erechim/RS</span>
            </div>

            <div className="mt-6 text-xs text-[hsl(var(--muted))]">
              Atendimento: Seg–Sáb 9h–18h • Erechim/RS
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Loja</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/produtos" className="text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">Produtos</Link>
              <Link href="/sobre" className="text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">Sobre</Link>
              <Link href="/contato" className="text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">Contato</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Políticas</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/politicas" className="text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">Entrega e trocas</Link>
              <Link href="/privacidade" className="text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">Privacidade (LGPD)</Link>
              <Link href="/termos" className="text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">Termos de uso</Link>
            </div>

            <div className="mt-6 text-xs text-[hsl(var(--muted))]">
              Redes sociais: ajuste os links em <code>/contato</code>.
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[hsl(var(--border))] pt-6 text-xs text-[hsl(var(--muted))]">
          © {new Date().getFullYear()} Cuias Lazaretti. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
