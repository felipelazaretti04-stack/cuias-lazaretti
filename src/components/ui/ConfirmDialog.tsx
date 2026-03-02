"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  danger = false,
  loading = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  // evita erro em SSR
  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onCancel} />

      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-[hsl(var(--border))] bg-white shadow-soft">
          <div className="p-5">
            <div className="text-base font-semibold">{title}</div>
            {description ? (
              <div className="mt-2 text-sm text-[hsl(var(--muted))]">{description}</div>
            ) : null}

            <div className="mt-5 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm hover:bg-[hsl(var(--accent))] disabled:opacity-60"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={[
                  "rounded-xl px-4 py-2 text-sm font-medium text-white disabled:opacity-60",
                  danger ? "bg-red-600 hover:bg-red-700" : "bg-[hsl(var(--primary))] hover:opacity-95",
                ].join(" ")}
              >
                {loading ? "Processando..." : confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
