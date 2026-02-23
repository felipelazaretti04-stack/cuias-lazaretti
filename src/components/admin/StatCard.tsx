import Link from "next/link";

export function StatCard({
  title,
  value,
  hint,
  href,
}: {
  title: string;
  value: string;
  hint?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5 hover:bg-[hsl(var(--accent))] transition">
      <div className="text-xs text-[hsl(var(--muted))]">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-2 text-xs text-[hsl(var(--muted))]">{hint}</div> : null}
    </div>
  );

  return href ? <Link href={href}>{inner}</Link> : inner;
}
