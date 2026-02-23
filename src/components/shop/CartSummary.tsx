"use client";
import Link from "next/link";
import { formatBRL } from "@/lib/money";

export function CartSummary({ subtotalCents }: { subtotalCents: number }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[hsl(var(--muted))]">Subtotal</span>
        <span className="font-medium">{formatBRL(subtotalCents)}</span>
      </div>
      <div className="mt-4">
        <Link
          href="/checkout"
          className="inline-flex w-full items-center justify-center rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-sm font-medium text-white hover:opacity-95"
        >
          Ir para o checkout
        </Link>
      </div>
      <div className="mt-2 text-xs text-[hsl(var(--muted))]">
        Frete calculado no checkout.
      </div>
    </div>
  );
}
