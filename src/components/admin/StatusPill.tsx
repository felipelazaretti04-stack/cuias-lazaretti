export function StatusPill({ status }: { status: string }) {
  const s = status.toUpperCase();
  const cls =
    s === "PAID" ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
    s === "PENDING" ? "border-amber-200 bg-amber-50 text-amber-800" :
    s === "SHIPPED" ? "border-blue-200 bg-blue-50 text-blue-800" :
    "border-zinc-200 bg-zinc-50 text-zinc-800";

  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${cls}`}>
      {s}
    </span>
  );
}
