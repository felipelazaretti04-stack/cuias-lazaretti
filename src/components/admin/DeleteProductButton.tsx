"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteProductButton({ productId }: { productId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/produtos/${productId}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setOpen(false);
      alert(data?.error || "Falha ao excluir produto");
      return;
    }

    setOpen(false);

    if (data?.deactivated) {
      alert("Produto possui pedidos vinculados. Ele foi apenas DESATIVADO para preservar o histórico.");
    }

    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={open}
        danger
        loading={loading}
        title="Excluir produto?"
        description="Se houver pedidos vinculados, o produto será desativado (não apagado) para manter o histórico."
        confirmText="Excluir"
        onCancel={() => setOpen(false)}
        onConfirm={doDelete}
      />
    </>
  );
}
