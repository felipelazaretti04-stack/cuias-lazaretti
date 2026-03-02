import Link from "next/link";
import Image from "next/image";
import { Price } from "@/components/shop/Price";
import { RatingStars } from "@/components/shop/RatingStars";

type Props = {
  slug: string;
  name: string;
  imageUrl?: string | null;
  isNew?: boolean;
  isFeatured?: boolean;
  fromPriceCents: number;
  fromCompareAtCents?: number | null;
  ratingAvg?: number;
  ratingCount?: number;
};

export function ProductCardCompact(props: Props) {
  return (
    <Link href={`/produtos/${props.slug}`} className="group block">
      <div className="card overflow-hidden shadow-sm transition hover:shadow-soft">
        <div className="relative aspect-[4/3] w-full bg-[hsl(var(--accent))]">
          {props.imageUrl ? (
            <Image
              src={props.imageUrl}
              alt={props.name}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 768px) 72vw, 25vw"
            />
          ) : null}

          <div className="absolute left-3 top-3 flex gap-2">
            {props.isNew ? <span className="badge">Novidade</span> : null}
            {props.isFeatured ? <span className="badge">Destaque</span> : null}
          </div>
        </div>

        <div className="p-4">
          <div className="line-clamp-2 text-sm font-semibold leading-snug">{props.name}</div>

          <div className="mt-2">
            <RatingStars value={props.ratingAvg || 0} count={props.ratingCount || 0} />
          </div>

          <div className="mt-2">
            <Price priceCents={props.fromPriceCents} compareAtCents={props.fromCompareAtCents ?? null} />
          </div>

          <div className="mt-3 text-xs text-[hsl(var(--muted))]">
            Ver detalhes <span className="ml-1 transition group-hover:translate-x-0.5">→</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
