export function TrustBar() {
  const items = [
    { title: "Acabamento premium", desc: "Peças selecionadas e detalhes que aparecem ao vivo." },
    { title: "Personalização sob medida", desc: "Opções personalizadas com prazo claro de produção." },
    { title: "Envio Brasil + retirada", desc: "PAC + retirada em Erechim/RS (sem frete)." },
    { title: "Compra segura", desc: "Checkout Pro Mercado Pago." },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-4">
      {items.map((it) => (
        <div key={it.title} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
          <div className="text-sm font-semibold">{it.title}</div>
          <div className="mt-1 text-xs text-[hsl(var(--muted))]">{it.desc}</div>
        </div>
      ))}
    </div>
  );
}
