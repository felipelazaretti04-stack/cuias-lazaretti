import { notFound } from "next/navigation";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { AddToCart } from "@/components/shop/AddToCart";

function labelVariant(v: { size: string | null; finish: string | null; color: string | null; personalization: string | null }) {
  return [v.size, v.finish, v.color, v.personalization].filter(Boolean).join(" • ") || "Padrão";
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { where: { isActive: true }, orderBy: [{ priceCents: "asc" }] },
      category: true,
    },
  });

  if (!product || !product.isActive) return notFound();

  const first = product.variants[0];

  const variantsForClient = product.variants.map((v) => ({
    id: v.id,
    label: labelVariant(v),
    priceBRL: formatBRL(v.priceCents),
    stock: v.stock,
  }));

  return (
    <div className="container py-10">
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="relative aspect-[4/3] w-full bg-[hsl(var(--accent))]">
            {product.images[0]?.url ? (
              <Image
                src={product.images[0].url}
                alt={product.images[0].alt || product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : null}
          </div>
          {product.images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 p-3">
              {product.images.slice(0, 4).map((img) => (
                <div key={img.id} className="relative aspect-square overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-white">
                  <Image src={img.url} alt={img.alt || product.name} fill className="object-cover" sizes="120px" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div>
          <div className="badge">{product.category?.name ?? "Produto"}</div>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{product.name}</h1>

          {first ? (
            <div className="mt-4">
              <div className="text-2xl font-semibold">{formatBRL(first.priceCents)}</div>
              <div className="mt-2 text-sm text-[hsl(var(--muted))]">
                {product.isPersonalized ? (
                  <>
                    Prazo de produção:{" "}
                    <span className="font-medium text-[hsl(var(--fg))]">{product.productionDays} dias</span>
                  </>
                ) : (
                  <>Pronto para envio</>
                )}
              </div>
            </div>
          ) : (
            <div className="mt-4 text-sm text-[hsl(var(--muted))]">Sem variantes ativas.</div>
          )}

          <div className="mt-6">
            <AddToCart variants={variantsForClient} />
          </div>

          {product.description ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Descrição</div>
              <p className="mt-2 text-sm text-[hsl(var(--muted))] whitespace-pre-line">{product.description}</p>
            </div>
          ) : null}

          {product.care ? (
            <div className="mt-6">
              <div className="text-sm font-semibold">Cuidados</div>
              <p className="mt-2 text-sm text-[hsl(var(--muted))] whitespace-pre-line">{product.care}</p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
