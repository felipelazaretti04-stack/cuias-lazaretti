import Link from "next/link";
import Image from "next/image";
import { Price } from "./Price";

type Props = {
  slug: string;
  name: string;
  imageUrl?: string | null;
  isNew?: boolean;
  isFeatured?: boolean;
  fromPriceCents: number;
  fromCompareAtCents?: number | null;
};

export function ProductCard(props: Props) {
  return (
    <Link href={`/produtos/${props.slug}`} className="group">
      <div className="card overflow-hidden">
        <div className="relative aspect-[4/3] w-full bg-[hsl(var(--accent))]">
          {props.imageUrl ? (
            <Image
              src={props.imageUrl}
              alt={props.name}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          ) : null}
          <div className="absolute left-3 top-3 flex gap-2">
            {props.isNew ? <span className="badge">Novidade</span> : null}
            {props.isFeatured ? <span className="badge">Destaque</span> : null}
          </div>
        </div>
        <div className="p-4">
          <div className="text-sm font-semibold">{props.name}</div>
          <div className="mt-2">
            <Price priceCents={props.fromPriceCents} compareAtCents={props.fromCompareAtCents} />
          </div>
          <div className="mt-3 text-xs text-[hsl(var(--muted))]">
            Ver detalhes →
          </div>
        </div>
      </div>
    </Link>
  );
}
