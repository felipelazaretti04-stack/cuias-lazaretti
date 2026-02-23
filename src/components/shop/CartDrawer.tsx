"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";

export function CartDrawer({ count }: { count: number }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-1.5 text-xs text-[hsl(var(--muted))] hover:text-[hsl(var(--fg))]">
          Carrinho ({count})
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed right-0 top-0 h-dvh w-full max-w-md border-l border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold">Carrinho</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-[hsl(var(--muted))]">
            Confira os itens no carrinho.
          </Dialog.Description>

          <div className="mt-6 grid gap-3">
            <Link href="/carrinho" className="rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-center text-sm font-medium text-white">
              Abrir carrinho
            </Link>
            <Dialog.Close asChild>
              <button className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm">
                Continuar comprando
              </button>
            </Dialog.Close>
          </div>

          <Dialog.Close className="absolute right-4 top-4 rounded-xl border border-[hsl(var(--border))] bg-white px-2 py-1 text-xs">
            Fechar
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
