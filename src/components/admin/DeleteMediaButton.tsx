"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function DeleteMediaButton({ assetId }: { assetId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function doDelete() {
    setLoading(true);
    const res = await fetch(`/api/admin/midias/${assetId}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setLoading(false);

    if (!res.ok) {
      setOpen(false);
      alert(data?.error || "Falha ao excluir mídia");
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
        className="mt-2 inline-flex w-full items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-1.5 text-xs text-red-700 hover:bg-red-50"
      >
        Excluir
      </button>

      <ConfirmDialog
        open={open}
        danger
        loading={loading}
        title="Excluir mídia da galeria?"
        description="Isto remove apenas do banco. Se algum produto usa essa URL, ele continuará funcionando."
        confirmText="Excluir"
        onCancel={() => setOpen(false)}
        onConfirm={doDelete}
      />
    </>
  );
}
