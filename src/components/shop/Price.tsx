import { formatBRL } from "@/lib/money";

export function Price({ priceCents, compareAtCents }: { priceCents: number; compareAtCents?: number | null }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-semibold">{formatBRL(priceCents)}</span>
      {compareAtCents ? (
        <span className="text-sm text-[hsl(var(--muted))] line-through">{formatBRL(compareAtCents)}</span>
      ) : null}
    </div>
  );
}
