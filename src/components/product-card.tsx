import Link from "next/link";
import { ArrowUpRight, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductVisual } from "@/components/product-visual";
import { formatPeso } from "@/lib/utils";
import type { Product } from "@/types/domain";

export function ProductCard({
  product,
  priority = false,
}: {
  product: Product;
  priority?: boolean;
}) {
  const categorySlug = product.category?.slug ?? "pasalubong";
  return (
    <article className="group paper-card flex h-full flex-col overflow-hidden transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(58,36,24,.14)]">
      <Link
        href={`/menu/${product.slug}`}
        className="relative block aspect-[4/3] overflow-hidden"
      >
        <ProductVisual
          name={product.name}
          categorySlug={categorySlug}
          imageUrl={product.main_image_url}
          priority={priority}
          className="absolute inset-0"
        />
        <div className="absolute top-4 left-4 flex flex-wrap gap-2">
          {product.is_best_seller && (
            <Badge className="bg-gold text-cocoa">Best seller</Badge>
          )}
          {product.is_new && <Badge className="bg-ube text-white">New</Badge>}
          {product.is_preorder && (
            <Badge className="text-cocoa bg-white/90">Pre-order</Badge>
          )}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <p className="text-ube text-xs font-bold tracking-wider uppercase">
          {product.category?.name}
        </p>
        <h3 className="font-display text-cocoa mt-2 text-[1.45rem] leading-tight font-bold">
          <Link href={`/menu/${product.slug}`} className="after:absolute">
            {product.name}
          </Link>
        </h3>
        <p className="text-muted mt-3 line-clamp-2 text-sm leading-6">
          {product.short_description}
        </p>
        <div className="mt-auto flex items-end justify-between gap-3 pt-5">
          <div>
            <p className="text-muted text-[0.64rem] font-bold tracking-wider uppercase">
              Price
            </p>
            <p className="text-cocoa mt-1 font-extrabold">
              {formatPeso(
                product.discounted_price ?? product.price,
                product.price_label,
              )}
            </p>
          </div>
          <Link
            href={`/menu/${product.slug}`}
            className="bg-cocoa text-cream group-hover:bg-gold group-hover:text-cocoa grid size-11 place-items-center rounded-full transition"
            aria-label={`View ${product.name}`}
          >
            <ArrowUpRight className="size-5" />
          </Link>
        </div>
        <a
          href={`https://m.me/61557086043030?ref=${encodeURIComponent(product.slug)}`}
          target="_blank"
          rel="noreferrer"
          className="border-cocoa/10 text-cocoa mt-4 inline-flex items-center justify-center gap-2 border-t pt-4 text-xs font-extrabold"
        >
          <MessageCircle className="text-ube size-4" /> Ask about this product
        </a>
      </div>
    </article>
  );
}
