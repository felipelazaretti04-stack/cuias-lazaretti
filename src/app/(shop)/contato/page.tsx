import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato",
  description: "Fale com a Cuias Lazaretti por WhatsApp, Instagram ou e-mail.",
};

export default function ContatoPage() {
  // TROQUE AQUI
  const whatsapp = "https://wa.me/5554999822150";
  const instagram = "https://www.instagram.com/cuias_lazaretti";
  const email = "ambrosiolazaretti@hotmail.com";

  return (
    <div className="container py-10">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Contato</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Resposta rápida em horário comercial.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5 hover:bg-[hsl(var(--accent))]" href={whatsapp}>
            <div className="text-sm font-semibold">WhatsApp</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted))]">Orçamentos e dúvidas</div>
            <div className="mt-3 text-xs text-[hsl(var(--muted))]">Seg–Sáb 9h–18h</div>
          </Link>

          <Link className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5 hover:bg-[hsl(var(--accent))]" href={instagram}>
            <div className="text-sm font-semibold">Instagram</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted))]">Novidades e lançamentos</div>
            <div className="mt-3 text-xs text-[hsl(var(--muted))]">@cuiaslazaretti</div>
          </Link>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
            <div className="text-sm font-semibold">E-mail</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted))]">{email}</div>
            <div className="mt-3 text-xs text-[hsl(var(--muted))]">Até 24h úteis</div>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="text-sm font-semibold">Retirada em Erechim/RS</div>
          <div className="mt-1 text-sm text-[hsl(var(--muted))]">
            Após a compra, combinamos o local e horário de retirada pelo WhatsApp.
          </div>
        </div>
      </div>
    </div>
  );
}
