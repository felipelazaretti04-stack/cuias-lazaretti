"use client";

import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCardCompact } from "@/components/shop/ProductCardCompact";

type Product = {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string | null;
  fromPriceCents: number;
  fromCompareAtCents?: number | null;
  ratingAvg?: number | null;
  ratingCount?: number | null;
  isNew?: boolean | null;
  isFeatured?: boolean | null;
};

export function ProductRail({
  title,
  subtitle,
  hrefAll,
  products,
}: {
  title: string;
  subtitle?: string;
  hrefAll?: string;
  products: Product[];
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  });

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => {
      setCanPrev(emblaApi.canScrollPrev());
      setCanNext(emblaApi.canScrollNext());
    };
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi]);

  if (!products?.length) return null;

  return (
    <section className="container mt-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight">{title}</h2>
          {subtitle ? <p className="mt-1 text-sm text-[hsl(var(--muted))]">{subtitle}</p> : null}
        </div>

        <div className="hidden items-center gap-2 md:flex">
          {hrefAll ? (
            <Link
              href={hrefAll}
              className="rounded-xl border border-[hsl(var(--border))] bg-white px-3 py-2 text-sm hover:bg-[hsl(var(--accent))]"
            >
              Ver todos
            </Link>
          ) : null}

          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canPrev}
            className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white p-2 disabled:opacity-40"
            aria-label="Anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canNext}
            className="inline-flex items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white p-2 disabled:opacity-40"
            aria-label="Próximo"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Mobile: swipe rail */}
      <div className="mt-4 md:hidden" ref={emblaRef}>
        <div className="flex gap-3">
          {products.map((p) => (
            <div key={p.id} className="flex-[0_0_78%] sm:flex-[0_0_46%]">
              <ProductCardCompact
                slug={p.slug}
                name={p.name}
                imageUrl={p.imageUrl}
                isNew={!!p.isNew}
                isFeatured={!!p.isFeatured}
                fromPriceCents={p.fromPriceCents}
                fromCompareAtCents={p.fromCompareAtCents ?? null}
                ratingAvg={p.ratingAvg ?? 0}
                ratingCount={p.ratingCount ?? 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: grid compacto */}
      <div className="mt-4 hidden gap-4 md:grid md:grid-cols-4">
        {products.slice(0, 8).map((p) => (
          <ProductCardCompact
            key={p.id}
            slug={p.slug}
            name={p.name}
            imageUrl={p.imageUrl}
            isNew={!!p.isNew}
            isFeatured={!!p.isFeatured}
            fromPriceCents={p.fromPriceCents}
            fromCompareAtCents={p.fromCompareAtCents ?? null}
            ratingAvg={p.ratingAvg ?? 0}
            ratingCount={p.ratingCount ?? 0}
          />
        ))}
      </div>

      {hrefAll ? (
        <div className="mt-4 md:hidden">
          <Link
            href={hrefAll}
            className="inline-flex w-full items-center justify-center rounded-xl border border-[hsl(var(--border))] bg-white px-4 py-2 text-sm hover:bg-[hsl(var(--accent))]"
          >
            Ver todos os produtos
          </Link>
        </div>
      ) : null}
    </section>
  );
}
