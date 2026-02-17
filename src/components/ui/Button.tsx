import * as React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function Button({ className = "", variant = "primary", ...props }: Props) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed";
  const styles =
    variant === "primary"
      ? "bg-[hsl(var(--primary))] text-white hover:opacity-95"
      : variant === "secondary"
        ? "bg-[hsl(var(--accent))] text-[hsl(var(--fg))] border border-[hsl(var(--border))] hover:bg-white"
        : "bg-transparent text-[hsl(var(--fg))] hover:bg-white border border-transparent hover:border-[hsl(var(--border))]";

  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
