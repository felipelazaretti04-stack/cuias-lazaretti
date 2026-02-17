import * as React from "react";

export function AdminShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="container py-8">
      <div className="mb-5">
        <div className="text-xs text-[hsl(var(--muted))]">Admin</div>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
      <div className="card p-6">{children}</div>
    </div>
  );
}
