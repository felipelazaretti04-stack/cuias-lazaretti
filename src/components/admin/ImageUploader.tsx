"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

type Uploaded = {
  secure_url: string;
  public_id?: string;
  width?: number;
  height?: number;
  bytes?: number;
  format?: string;
};

export function ImageUploader({ onUploaded }: { onUploaded?: (url: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [alt, setAlt] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function upload() {
    if (!file) return;
    setErr(null);
    setLoading(true);

    // 1) pega assinatura no server
    const sigRes = await fetch("/api/admin/midias/sign", { method: "POST" });
    if (!sigRes.ok) {
      setLoading(false);
      setErr("Falha ao assinar upload");
      return;
    }
    const sig = await sigRes.json();

    // 2) upload direto pro Cloudinary
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", sig.apiKey);
    form.append("timestamp", String(sig.timestamp));
    form.append("folder", sig.folder);
    form.append("signature", sig.signature);

    const upRes = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: form,
    });

    if (!upRes.ok) {
      setLoading(false);
      const t = await upRes.text().catch(() => "");
      setErr(`Upload falhou: ${t.slice(0, 160)}`);
      return;
    }

    const uploaded = (await upRes.json()) as Uploaded;

    // 3) registra no banco (galeria reutilizável)
    const dbRes = await fetch("/api/admin/midias", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        url: uploaded.secure_url,
        publicId: uploaded.public_id || null,
        width: uploaded.width,
        height: uploaded.height,
        bytes: uploaded.bytes,
        format: uploaded.format,
        alt: alt || null,
        provider: "CLOUDINARY",
      }),
    });

    setLoading(false);

    if (!dbRes.ok) {
      setErr("Upload ok, mas falhou registrar na galeria");
      return;
    }

    onUploaded?.(uploaded.secure_url);
    setFile(null);
    setAlt("");
  }

  return (
    <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-4">
      <div className="text-sm font-semibold">Upload de imagem (Cloudinary)</div>
      <div className="mt-4 grid gap-3">
        <div className="space-y-2">
          <Label>Arquivo</Label>
          <Input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div className="space-y-2">
          <Label>Alt (opcional)</Label>
          <Input value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Ex.: cuia premium torpedo" />
        </div>
        {err ? <div className="text-sm text-red-700">{err}</div> : null}
        <Button onClick={upload} disabled={!file || loading}>
          {loading ? "Enviando..." : "Enviar"}
        </Button>
        <div className="text-xs text-[hsl(var(--muted))]">
          Após enviar, a imagem fica na <b>Galeria</b> para reutilizar na Home e em banners.
        </div>
      </div>
    </div>
  );
}
