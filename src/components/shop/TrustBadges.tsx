// file: src/components/shop/TrustBadges.tsx
import { BadgeCheck, Truck, ShieldCheck, Sparkles } from "lucide-react";

export function TrustBadges() {
  const items = [
    { icon: Sparkles, title: "Acabamento premium", desc: "Detalhes que aparecem ao vivo." },
    { icon: ShieldCheck, title: "Compra segura", desc: "Checkout Pro Mercado Pago." },
    { icon: Truck, title: "Envio Brasil", desc: "PAC + retirada em Erechim/RS." },
    { icon: BadgeCheck, title: "Garantia", desc: "Suporte e troca facilitada." },
  ];

  return (
    <section className="container py-4">
      {/* Mobile: compacto COM borda */}
      <div className="grid grid-cols-2 gap-2 md:hidden">
        {items.map((it) => (
          <div
            key={it.title}
            className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 shadow-sm"
          >
            <it.icon size={16} className="shrink-0 text-[hsl(var(--primary))]" />
            <span className="text-xs font-medium">{it.title}</span>
          </div>
        ))}
      </div>

      {/* Desktop: cards completos */}
      <div className="hidden gap-3 md:grid md:grid-cols-4">
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
