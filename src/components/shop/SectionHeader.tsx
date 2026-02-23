import Link from "next/link";

export function SectionHeader({ title, subtitle, href, hrefLabel }: { title: string; subtitle?: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-[hsl(var(--muted))]">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="text-sm text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
          {hrefLabel || "Ver tudo →"}
        </Link>
      ) : null}
    </div>
  );
}
