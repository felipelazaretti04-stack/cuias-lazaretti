// file: src/lib/cloudinaryClientUpload.ts
export type CloudinarySignedUpload = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

export type UploadedAsset = {
  url: string;
  publicId: string | null;
  width: number | null;
  height: number | null;
  bytes: number | null;
  format: string | null;
};

export async function uploadToCloudinary(file: File): Promise<UploadedAsset> {
  const signRes = await fetch("/api/admin/midias/sign", { method: "POST" });
  if (!signRes.ok) {
    const d = await signRes.json().catch(() => null);
    throw new Error(d?.error || "Falha ao assinar upload");
  }

  const signed = (await signRes.json()) as CloudinarySignedUpload;

  const form = new FormData();
  form.append("file", file);
  form.append("api_key", signed.apiKey);
  form.append("timestamp", String(signed.timestamp));
  form.append("folder", signed.folder);
  form.append("signature", signed.signature);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const up = await uploadRes.json().catch(() => null);

  if (!uploadRes.ok) {
    const msg = up?.error?.message || "Falha no upload do Cloudinary";
    throw new Error(msg);
  }

  return {
    url: up.secure_url || up.url,
    publicId: up.public_id || null,
    width: typeof up.width === "number" ? up.width : null,
    height: typeof up.height === "number" ? up.height : null,
    bytes: typeof up.bytes === "number" ? up.bytes : null,
    format: up.format || null,
  };
}

export async function saveMediaAsset(payload: {
  url: string;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  bytes?: number | null;
  format?: string | null;
  alt?: string | null;
}) {
  const res = await fetch("/api/admin/midias", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider: "CLOUDINARY", ...payload }),
  });

  if (!res.ok) {
    const d = await res.json().catch(() => null);
    throw new Error(d?.error || "Falha ao salvar mídia");
  }

  return res.json();
}
