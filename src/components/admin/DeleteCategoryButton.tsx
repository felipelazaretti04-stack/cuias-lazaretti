"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteCategoryButton({ categoryId }: { categoryId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/categorias/${categoryId}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setOpen(false);
      // categoria com produtos vinculados => alerta simples por enquanto
      alert(data?.error || "Falha ao excluir categoria");
      return;
    }

    setOpen(false);
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
        title="Excluir categoria?"
        description="Se existirem produtos vinculados, a exclusão será bloqueada."
        confirmText="Excluir"
        onCancel={() => setOpen(false)}
        onConfirm={doDelete}
      />
    </>
  );
}
