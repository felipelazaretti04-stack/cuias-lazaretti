// file: src/components/shop/HomeInstitutional.tsx
import Link from "next/link";
import { Phone, MapPin, ShieldCheck, Truck } from "lucide-react";

export function HomeInstitutional() {
  const whatsapp = process.env.NEXT_PUBLIC_STORE_WHATSAPP || "";
  const address = process.env.NEXT_PUBLIC_STORE_ADDRESS || "Erechim/RS";

  return (
    <section className="container py-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
        <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-6 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[hsl(var(--muted))]">
            Atendimento próximo
          </div>
          <h2 className="mt-2 text-2xl font-semibold md:text-3xl">
            Compre com confiança e fale direto com a gente pelo WhatsApp
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[hsl(var(--muted))]">
            A Cuias Lazaretti atende com rapidez, envio para todo o Brasil e suporte próximo para tirar dúvidas,
            acompanhar pedidos e personalizações.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Phone size={16} />
                WhatsApp
              </div>
              <div className="mt-2 text-sm text-[hsl(var(--muted))]">{whatsapp || "Configurar no .env"}</div>
            </div>

            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-4">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <MapPin size={16} />
                Endereço / retirada
              </div>
              <div className="mt-2 text-sm text-[hsl(var(--muted))]">{address}</div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contato"
              className="inline-flex rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm font-medium"
            >
              Ver contato completo
            </Link>

            <a
              href={`https://wa.me/55${(whatsapp || "").replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white"
            >
              Falar no WhatsApp
            </a>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-green-100 p-3 text-green-700">
                <Truck size={18} />
              </div>
              <div>
                <div className="font-semibold">Envio para todo o Brasil</div>
                <div className="text-sm text-[hsl(var(--muted))]">Frete calculado no checkout</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
                <ShieldCheck size={18} />
              </div>
              <div>
                <div className="font-semibold">Pagamento seguro</div>
                <div className="text-sm text-[hsl(var(--muted))]">Pix e cartão com Mercado Pago</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[hsl(var(--border))] bg-white p-5 shadow-sm">
            <div className="text-sm font-semibold">Retirada em Erechim/RS</div>
            <div className="mt-2 text-sm text-[hsl(var(--muted))]">
              Ideal para clientes da região que querem economizar no frete e retirar direto com a loja.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
