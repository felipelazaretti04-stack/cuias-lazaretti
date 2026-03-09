// file: src/components/shop/Footer.tsx
import Link from "next/link";

export function Footer() {
  const whatsapp = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS || "Erechim/RS";

  return (
    <footer className="border-t border-[hsl(var(--border))] bg-white">
      <div className="container py-10">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-sm font-semibold">Cuias Lazaretti</div>
            <div className="mt-2 text-sm text-[hsl(var(--muted))]">
              Cuias premium, bombas e acessórios com atendimento próximo e envio para todo o Brasil.
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Navegação</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link href="/produtos">Produtos</Link>
              <Link href="/meus-pedidos">Meus pedidos</Link>
              <Link href="/sobre">Sobre</Link>
              <Link href="/contato">Contato</Link>
              <Link href="/privacidade">Privacidade</Link>
              <Link href="/termos">Termos</Link>
            </div>
          </div>

          <div>
            <div className="text-sm font-semibold">Atendimento</div>
            <div className="mt-3 space-y-2 text-sm text-[hsl(var(--muted))]">
              <div>{whatsapp || "Configurar WhatsApp no .env"}</div>
              <div>{address}</div>
              <div>Retirada em Erechim/RS • Envio Brasil</div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-[hsl(var(--border))] pt-6">
          <div className="text-xs text-[hsl(var(--muted))]">
            © {new Date().getFullYear()} Cuias Lazaretti
          </div>

          <Link href="/admin" className="text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
            Área administrativa
          </Link>
        </div>
      </div>
    </footer>
  );
}
