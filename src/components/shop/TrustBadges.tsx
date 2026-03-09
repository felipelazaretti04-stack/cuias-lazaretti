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
    <section className="container pt-4 pb-1">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-xl border border-[hsl(var(--border))] bg-white p-3 shadow-sm md:rounded-2xl md:p-4"
          >
            <div className="flex items-start gap-2 md:gap-3">
              <div className="rounded-lg bg-[hsl(var(--accent))] p-1.5 text-[hsl(var(--primary))] md:rounded-xl md:p-2">
                <it.icon size={16} className="md:h-[18px] md:w-[18px]" />
              </div>
              <div>
                <div className="text-xs font-semibold md:text-sm">{it.title}</div>
                <div className="mt-0.5 text-[10px] leading-tight text-[hsl(var(--muted))] md:mt-1 md:text-xs">
                  {it.desc}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
