import { BadgeCheck, Truck, ShieldCheck, Sparkles } from "lucide-react";

export function TrustBadges() {
  const items = [
    { icon: Sparkles, title: "Acabamento premium", desc: "Detalhes que aparecem ao vivo." },
    { icon: ShieldCheck, title: "Compra segura", desc: "Checkout Pro Mercado Pago." },
    { icon: Truck, title: "Envio Brasil", desc: "PAC + retirada em Erechim/RS." },
    { icon: BadgeCheck, title: "Garantia", desc: "Suporte e troca facilitada." },
  ];

  return (
    <section className="container">
      <div className="grid gap-3 md:grid-cols-4">
        {items.map((it) => (
          <div key={it.title} className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-[hsl(var(--accent))] p-2 text-[hsl(var(--primary))]">
                <it.icon size={18} />
              </div>
              <div>
                <div className="text-sm font-semibold">{it.title}</div>
                <div className="mt-1 text-xs text-[hsl(var(--muted))]">{it.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
