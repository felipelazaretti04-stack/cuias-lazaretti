import { AdminShell } from "@/components/admin/AdminShell";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { prisma } from "@/lib/prisma";
<<<<<<< HEAD
=======
import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";
>>>>>>> 8cb04a5a8bf609eab8837c3e974c3b76f2d53f0e

export const dynamic = "force-dynamic";

export default async function AdminMidiasPage() {
  const assets = await prisma.mediaAsset.findMany({ orderBy: { createdAt: "desc" }, take: 120 });

  return (
    <AdminShell title="Mídias">
      <div className="grid gap-6">
        <ImageUploader />

        <div className="rounded-2xl border border-[hsl(var(--border))] bg-white p-5">
          <div className="text-sm font-semibold">Galeria</div>
          <div className="mt-1 text-xs text-[hsl(var(--muted))]">
            Use essas imagens na Home (Conteúdo) ou cole URLs em produtos.
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {assets.map((a) => (
              <div key={a.id} className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--bg))] p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.url} alt={a.alt || "media"} className="aspect-square w-full rounded-xl object-cover" />
                <div className="mt-2 truncate text-[11px] text-[hsl(var(--muted))]" title={a.url}>
                  {a.alt || "—"}
                </div>
<<<<<<< HEAD
=======

                <DeleteMediaButton assetId={a.id} />
>>>>>>> 8cb04a5a8bf609eab8837c3e974c3b76f2d53f0e
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
