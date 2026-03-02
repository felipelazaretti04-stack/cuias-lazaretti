import { ReactNode } from "react";

export function SectionShell({
  children,
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "accent";
}) {
  if (tone === "accent") {
    return (
      <section className="mt-12 border-y border-[hsl(var(--border))] bg-[hsl(var(--accent))] py-10">
        {children}
      </section>
    );
  }

  return <section className="mt-12 py-2">{children}</section>;
}
