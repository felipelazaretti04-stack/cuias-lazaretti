import Link from "next/link";

export function Hero() {
  return (
    <section className="container py-10">
      <div className="card overflow-hidden">
        <div className="grid gap-8 p-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="badge">Artesanal premium • Sul do Brasil</div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
              A cuia certa pro teu mate.
            </h1>
            <p className="mt-3 text-sm text-[hsl(var(--muted))]">
              Cuias premium, bombas e acessórios com estética clean. Envio para todo o Brasil — e retirada em Erechim/RS.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/produtos"
                className="inline-flex items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-5 py-2.5 text-sm font-medium text-white hover:opacity-95"
              >
                Comprar agora
              </Link>
              <Link
                href="/produtos?cat=cuias"
                className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-5 py-2.5 text-sm font-medium hover:bg-[hsl(var(--accent))]"
              >
                Ver cuias
              </Link>
            </div>

            <div className="mt-6 grid gap-2 text-sm">
              {[
                "Acabamento premium",
                "Personalização sob medida",
                "Envio Brasil + retirada em Erechim",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[hsl(var(--gold))]" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--accent))]">
            <div className="absolute inset-0 bg-gradient-to-tr from-[hsl(var(--primary))]/12 via-transparent to-[hsl(var(--gold))]/10" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white/85 p-4 backdrop-blur">
              <div className="text-sm font-semibold">Minimalista. Premium. Feito pra durar.</div>
              <div className="mt-1 text-xs text-[hsl(var(--muted))]">
                Peças que elevam o mate do dia a dia.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
