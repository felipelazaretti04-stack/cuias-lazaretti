"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({ initial }: { initial?: string }) {
  const [q, setQ] = useState(initial || "");
  const router = useRouter();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const qs = q.trim();
        router.push(qs ? `/produtos?q=${encodeURIComponent(qs)}` : "/produtos");
      }}
      className="hidden w-full max-w-xl md:block"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-white px-3 py-2 shadow-sm">
        <Search size={16} className="text-[hsl(var(--muted))]" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar cuia, bomba, kit..."
          className="w-full bg-transparent text-sm outline-none"
        />
      </div>
    </form>
  );
}
