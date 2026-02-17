import Link from "next/link";

export default function ContatoPage() {
  const whatsapp = "https://wa.me/55SEUNUMEROAQUI";
  const instagram = "https://instagram.com/SEUINSTA";
  const email = "contato@cuiaslazaretti.com.br";

  return (
    <div className="container py-10">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Contato</h1>
        <p className="mt-2 text-sm text-[hsl(var(--muted))]">
          Fala com a gente — respondemos rápido.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Link className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 hover:bg-[hsl(var(--accent))]" href={whatsapp}>
            <div className="text-sm font-semibold">WhatsApp</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted))]">Atendimento Seg–Sáb 9h–18h</div>
          </Link>

          <Link className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 hover:bg-[hsl(var(--accent))]" href={instagram}>
            <div className="text-sm font-semibold">Instagram</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted))]">Novidades e lançamentos</div>
          </Link>

          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">E-mail</div>
            <div className="mt-1 text-sm text-[hsl(var(--muted))]">{email}</div>
          </div>
        </div>

        <div className="mt-6 text-xs text-[hsl(var(--muted))]">
          Ajuste os links acima no arquivo <code>src/app/(shop)/contato/page.tsx</code>.
        </div>
      </div>
    </div>
  );
}
