import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre",
  description: "Conheça a Cuias Lazaretti — peças premium para chimarrão, direto de Erechim/RS.",
};

export default function SobrePage() {
  return (
    <div className="container py-10">
      <div className="card p-8">
        <div className="badge">Erechim/RS</div>
        <h1 className="mt-3 text-2xl font-semibold">Sobre a Cuias Lazaretti</h1>
        <p className="mt-3 text-sm text-[hsl(var(--muted))]">
          A gente acredita que o mate do dia a dia merece peça boa: acabamento premium, estética limpa e escolhas honestas.
          Aqui tu encontra cuias, bombas e acessórios com um padrão que dá gosto de usar — e de presentear.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            { title: "Premium de verdade", desc: "Seleção e acabamento pensados pra durar e manter aparência." },
            { title: "Personalização", desc: "Opções personalizáveis com prazo de produção transparente." },
            { title: "Compra simples", desc: "Checkout Mercado Pago + entrega PAC ou retirada em Erechim." },
          ].map((it) => (
            <div key={it.title} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
              <div className="text-sm font-semibold">{it.title}</div>
              <div className="mt-1 text-sm text-[hsl(var(--muted))]">{it.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
