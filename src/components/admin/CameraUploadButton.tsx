// file: src/components/admin/CameraUploadButton.tsx
"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { saveMediaAsset, uploadToCloudinary } from "@/lib/cloudinaryClientUpload";

export function CameraUploadButton({
  onUploaded,
  label = "Tirar foto / Enviar",
  alt,
}: {
  onUploaded: (url: string) => void;
  label?: string;
  alt?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setErr(null);

    try {
      const up = await uploadToCloudinary(file);

      await saveMediaAsset({
        url: up.url,
        publicId: up.publicId,
        width: up.width,
        height: up.height,
        bytes: up.bytes,
        format: up.format,
        alt: alt ?? null,
      });

      onUploaded(up.url);
    } catch (e: any) {
      setErr(e?.message || "Falha no upload");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) void handleFile(f);
        }}
      />

      <Button
        type="button"
        variant="secondary"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Enviando..." : label}
      </Button>

      {err ? <div className="text-xs text-red-700">{err}</div> : null}
    </div>
  );
}
