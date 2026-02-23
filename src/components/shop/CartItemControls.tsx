"use client";

export function CartQtyControls({
  variantId,
  qty,
}: {
  variantId: string;
  qty: number;
}) {
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => e.preventDefault()}
    >
      <button
        className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-sm"
        onClick={async () => {
          const next = Math.max(1, qty - 1);
          await fetch("/api/cart/update", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ variantId, qty: next }),
          });
          window.location.reload();
        }}
        type="button"
      >
        −
      </button>

      <div className="min-w-10 text-center text-sm">{qty}</div>

      <button
        className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-sm"
        onClick={async () => {
          const next = Math.min(20, qty + 1);
          await fetch("/api/cart/update", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ variantId, qty: next }),
          });
          window.location.reload();
        }}
        type="button"
      >
        +
      </button>
    </form>
  );
}

export function RemoveItem({ variantId }: { variantId: string }) {
  return (
    <button
      className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]"
      onClick={async () => {
        await fetch("/api/cart/remove", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ variantId }),
        });
        window.location.reload();
      }}
      type="button"
    >
      Remover
    </button>
  );
}