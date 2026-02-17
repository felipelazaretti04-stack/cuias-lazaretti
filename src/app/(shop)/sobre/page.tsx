export default function SobrePage() {
  return (
    <div className="container py-10">
      <div className="card p-8">
        <h1 className="text-2xl font-semibold">Sobre</h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted))]">
          A Cuias Lazaretti nasce no norte do RS com uma ideia simples: elevar o mate do dia a dia
          com peças de acabamento premium e estética limpa.
        </p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">Acabamento</div>
            <p className="mt-1 text-sm text-[hsl(var(--muted))]">Detalhes que fazem diferença ao vivo.</p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">Personalização</div>
            <p className="mt-1 text-sm text-[hsl(var(--muted))]">Opções sob medida (pra presente ou pra ti).</p>
          </div>
          <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
            <div className="text-sm font-semibold">Confiança</div>
            <p className="mt-1 text-sm text-[hsl(var(--muted))]">Envio Brasil + retirada em Erechim/RS.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
