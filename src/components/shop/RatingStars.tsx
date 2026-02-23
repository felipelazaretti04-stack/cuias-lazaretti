export function RatingStars({ value, count }: { value: number; count: number }) {
  const v = Math.max(0, Math.min(5, value));
  const full = Math.floor(v);
  const half = v - full >= 0.5;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const idx = i + 1;
          const filled = idx <= full || (idx === full + 1 && half);
          return (
            <span key={i} className={`text-sm ${filled ? "text-[hsl(var(--gold))]" : "text-zinc-300"}`}>
              ★
            </span>
          );
        })}
      </div>
      <div className="text-xs text-[hsl(var(--muted))]">
        {count ? `${v.toFixed(1)} (${count})` : "Sem avaliações"}
      </div>
    </div>
  );
}
