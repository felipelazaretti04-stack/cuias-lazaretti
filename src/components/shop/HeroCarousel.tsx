"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type Slide = {
  imageUrl?: string | null;
  badge: string;
  title: string;
  highlight?: string; // parte cursiva
  subtitle: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
};

export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [index, setIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  // autoplay simples
  useEffect(() => {
    if (!emblaApi) return;
    const t = setInterval(() => emblaApi.scrollNext(), 6000);
    return () => clearInterval(t);
  }, [emblaApi]);

  return (
    <section className="container py-6 md:py-10">
      <div className="card overflow-hidden shadow-soft">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {slides.map((s, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%]">
                <div className="relative">
                  <div
                    className="h-[420px] w-full bg-[hsl(var(--accent))] md:h-[520px] xl:h-[560px]"
                    style={{
                      backgroundImage: s.imageUrl ? `url(${s.imageUrl})` : undefined,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />

                  <div className="absolute inset-0">
                    <div className="container flex h-full items-center">
                      <div className="max-w-xl py-10 text-white">
                        <div className="badge border-white/20 bg-white/10 text-white">
                          {s.badge}
                        </div>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                          {s.title}{" "}
                          {s.highlight ? (
                            <span className="font-script text-[hsl(var(--gold))]">
                              {s.highlight}
                            </span>
                          ) : null}
                        </h1>

                        <p className="mt-3 text-sm text-white/85 md:text-base">
                          {s.subtitle}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-3">
                          <Link
                            href={s.primaryHref}
                            className="inline-flex items-center justify-center rounded-xl bg-[hsl(var(--gold))] px-5 py-2.5 text-sm font-semibold text-[hsl(var(--leather))] hover:opacity-95"
                          >
                            {s.primaryText}
                          </Link>
                          <Link
                            href={s.secondaryHref}
                            className="inline-flex items-center justify-center rounded-xl border border-white/25 bg-white/10 px-5 py-2.5 text-sm font-medium text-white hover:bg-white/15"
                          >
                            {s.secondaryText}
                          </Link>
                        </div>

                        <div className="mt-6 text-xs text-white/70">
                          Produção artesanal • Envio Brasil • Retirada em Erechim/RS
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* dots */}
                  <div className="absolute bottom-5 left-1/2 -translate-x-1/2">
                    <div className="flex gap-2 rounded-full border border-white/15 bg-black/20 px-3 py-1.5 backdrop-blur">
                      {slides.map((_, di) => (
                        <button
                          key={di}
                          aria-label={`Slide ${di + 1}`}
                          onClick={() => emblaApi?.scrollTo(di)}
                          className={`h-2 w-2 rounded-full ${di === index ? "bg-[hsl(var(--gold))]" : "bg-white/40"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
