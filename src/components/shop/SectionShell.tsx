// file: src/components/shop/SectionShell.tsx
import { ReactNode } from "react";

export function SectionShell({
  children,
  tone = "light",
  first = false,
}: {
  children: ReactNode;
  tone?: "light" | "accent";
  first?: boolean;
}) {
  const mt = first ? "mt-4" : "mt-12";

  if (tone === "accent") {
    return (
      <section className={`${mt} border-y border-[hsl(var(--border))] bg-[hsl(var(--accent))] py-10`}>
        {children}
      </section>
    );
  }

  return <section className={`${mt} py-2`}>{children}</section>;
}
