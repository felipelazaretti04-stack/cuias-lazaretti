// file: src/components/shop/HeroCarousel.tsx
"use client";

import useEmblaCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Slide = {
  imageUrl?: string | null;
  badge: string;
  title: string;
  highlight?: string;
  subtitle: string;
  primaryText: string;
  primaryHref: string;
  secondaryText: string;
  secondaryHref: string;
};

function isCloudinary(url?: string | null) {
  if (!url) return false;
  return url.includes("res.cloudinary.com") && url.includes("/upload/");
}

/**
 * Normaliza imagens do Cloudinary para ficar SEMPRE bonito no hero:
 * - crop fill (sem distorcer)
 * - gravity auto (tenta preservar o assunto)
 * - formato/qualidade automáticos
 * - tamanho consistente (evita “corte feio” e melhora performance)
 */
function cloudinaryHero(url: string, w: number, h: number) {
  // injeta transformação depois de /upload/
  const t = `c_fill,g_auto,w_${w},h_${h},q_auto,f_auto`;
  return url.replace("/upload/", `/upload/${t}/`);
}

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

  const normalizedSlides = useMemo(() => {
    return slides.map((s) => {
      const raw = s.imageUrl || null;

      // tamanhos alvo do hero (ajuste fino)
      // mobile: 1080x1350 (4:5) — bonito e “commerce-like”
      // desktop: 1920x1080 (16:9)
      const mobile = raw && isCloudinary(raw) ? cloudinaryHero(raw, 1080, 1350) : raw;
      const desktop = raw && isCloudinary(raw) ? cloudinaryHero(raw, 1920, 1080) : raw;

      return { ...s, _imgMobile: mobile, _imgDesktop: desktop };
    });
  }, [slides]);

  return (
    <section className="container py-6 md:py-10">
      <div className="card overflow-hidden shadow-soft">
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex">
            {normalizedSlides.map((s, i) => (
              <div key={i} className="min-w-0 flex-[0_0_100%]">
                <div className="relative">
                  {/* HERO MEDIA:
                      - mobile: aspect 4/5
                      - desktop+: aspect 16/9
                      - sempre usando next/image (melhor LCP/CLS)
                  */}
                  <div className="relative w-full bg-[hsl(var(--accent))]">
                    <div className="md:hidden">
                      <div className="relative aspect-[4/5] w-full">
                        {s._imgMobile ? (
                          <Image
                            src={s._imgMobile}
                            alt={s.title}
                            fill
                            priority={i === 0}
                            sizes="100vw"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <div className="relative aspect-[16/9] w-full">
                        {s._imgDesktop ? (
                          <Image
                            src={s._imgDesktop}
                            alt={s.title}
                            fill
                            priority={i === 0}
                            sizes="(min-width: 1024px) 100vw, 100vw"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                    </div>

                    {/* overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent" />
                  </div>

                  <div className="absolute inset-0">
                    <div className="container flex h-full items-center">
                      <div className="max-w-xl py-10 text-white">
                        <div className="badge border-white/20 bg-white/10 text-white">{s.badge}</div>

                        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-5xl">
                          {s.title}{" "}
                          {s.highlight ? (
                            <span className="font-script text-[hsl(var(--gold))]">{s.highlight}</span>
                          ) : null}
                        </h1>

                        <p className="mt-3 text-sm text-white/85 md:text-base">{s.subtitle}</p>

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
                      {normalizedSlides.map((_, di) => (
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
