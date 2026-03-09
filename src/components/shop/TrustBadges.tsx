// file: src/components/shop/TrustBadges.tsx
import { BadgeCheck, Truck, ShieldCheck, Sparkles } from "lucide-react";

export function TrustBadges() {
  const items = [
    { icon: Sparkles, title: "Acabamento premium" },
    { icon: ShieldCheck, title: "Compra segura" },
    { icon: Truck, title: "Envio Brasil" },
    { icon: BadgeCheck, title: "Garantia" },
  ];

  return (
    <section className="container py-4">
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-[hsl(var(--muted))]">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-1.5">
            <it.icon size={16} className="text-[hsl(var(--primary))]" />
            <span>{it.title}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
