import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  MessageCircle,
  Package,
  Tags,
} from "lucide-react";
import { ProductVisual } from "@/components/product-visual";
import { ProductCard } from "@/components/product-card";
import { PublicShell } from "@/components/public-shell";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getBusinessSettings,
  getPageSections,
  getProductBySlug,
  getProducts,
} from "@/data/repository";
import { absoluteUrl, formatPeso } from "@/lib/utils";
import { sectionSetting } from "@/lib/content";

export async function generateMetadata({
  params,
}: PageProps<"/menu/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.seo_title || product.name,
    description: product.seo_description || product.short_description,
    alternates: { canonical: `/menu/${slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description: product.short_description,
      url: `/menu/${slug}`,
      images: product.main_image_url
        ? [{ url: product.main_image_url }]
        : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: PageProps<"/menu/[slug]">) {
  const { slug } = await params;
  const [product, products, settings, sections] = await Promise.all([
    getProductBySlug(slug),
    getProducts(),
    getBusinessSettings(),
    getPageSections("product"),
  ]);
  if (!product) notFound();
  const related = products
    .filter(
      (item) =>
        item.id !== product.id && item.category_id === product.category_id,
    )
    .slice(0, 3);
  const controls = sections.find(
    (section) => section.section_key === "detail_controls",
  );
  const label = (key: string, fallback: string) =>
    sectionSetting(controls, key, fallback);
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description,
    image: product.main_image_url
      ? [absoluteUrl(product.main_image_url)]
      : undefined,
    category: product.category?.name,
    brand: { "@type": "Brand", name: settings.business_name },
    offers:
      product.price !== null
        ? {
            "@type": "Offer",
            priceCurrency: "PHP",
            price: product.discounted_price ?? product.price,
            availability:
              product.availability === "available"
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            url: absoluteUrl(`/menu/${product.slug}`),
          }
        : undefined,
  };
  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <section className="py-8 sm:py-14">
        <div className="container-shell">
          <Link
            href="/menu"
            className="text-cocoa/70 hover:text-cocoa mb-7 inline-flex items-center gap-2 text-sm font-extrabold"
          >
            <ArrowLeft className="size-4" />
            {label("back_label", "Back to the menu")}
          </Link>
          <div className="grid gap-8 lg:grid-cols-[1.08fr_.92fr] lg:gap-14">
            <div>
              <div className="paper-card relative aspect-[4/3] overflow-hidden">
                <ProductVisual
                  name={product.name}
                  categorySlug={product.category?.slug ?? "pasalubong"}
                  imageUrl={product.main_image_url}
                  priority
                  className="absolute inset-0"
                />
              </div>
              {product.images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.images.map((image) => (
                    <div
                      key={image.id}
                      className="bg-beige relative aspect-square overflow-hidden rounded-xl"
                    >
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || product.name}
                        fill
                        sizes="(max-width: 640px) 25vw, 12vw"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="py-2">
              <div className="flex flex-wrap gap-2">
                {product.is_best_seller && <Badge>Best seller</Badge>}
                {product.is_featured && (
                  <Badge className="bg-ube text-white">Featured</Badge>
                )}
                {product.is_new && (
                  <Badge className="bg-leaf text-white">New</Badge>
                )}
                {product.is_preorder && (
                  <Badge className="bg-cocoa text-cream">Pre-order</Badge>
                )}
              </div>
              <p className="eyebrow mt-6">{product.category?.name}</p>
              <h1 className="display-title text-cocoa mt-2 text-5xl leading-[1.02] sm:text-6xl">
                {product.name}
              </h1>
              <p className="text-muted mt-6 text-lg leading-8">
                {product.full_description.replace(
                  " This is helpful draft copy and should be reviewed by the owner for exact ingredients, portions, and preparation details.",
                  "",
                )}
              </p>
              <div className="border-cocoa/10 mt-7 grid gap-3 rounded-2xl border bg-white p-5 sm:grid-cols-2">
                <Info
                  icon={<CheckCircle2 />}
                  label={label("availability_label", "Availability")}
                  value={
                    product.availability === "available"
                      ? label(
                          "available_value",
                          "Available today—please confirm",
                        )
                      : product.availability
                  }
                />
                <Info
                  icon={<Package />}
                  label={label("package_label", "Serving / package")}
                  value={product.serving_size}
                />
                <Info
                  icon={<Tags />}
                  label={label("price_label", "Price")}
                  value={formatPeso(
                    product.discounted_price ?? product.price,
                    product.price_label,
                  )}
                />
                <Info
                  icon={<Tags />}
                  label={label("tags_label", "Tags")}
                  value={
                    product.tags.join(", ") ||
                    label("fallback_tags", "Filipino favorite")
                  }
                />
              </div>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="sm:flex-1">
                  <a
                    href={`${settings.messenger_url}?ref=${encodeURIComponent(product.slug)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-5" />
                    {label("inquiry_label", "Ask about this product")}
                  </a>
                </Button>
                <ShareButton
                  title={product.name}
                  url={`/menu/${product.slug}`}
                />
              </div>
              <p className="text-muted mt-4 text-xs leading-5">
                {controls?.body ||
                  "Availability, ingredients, serving details, and prices may change. Please message us for confirmation."}
              </p>
            </div>
          </div>
        </div>
      </section>
      {related.length > 0 && (
        <section className="bg-beige/35 py-16 sm:py-20">
          <div className="container-shell">
            <h2 className="display-title text-cocoa text-4xl">
              {label("related_heading", "You might also enjoy")}
            </h2>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
function Info({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="text-ube mt-0.5 [&_svg]:size-4">{icon}</span>
      <span>
        <span className="text-muted block text-[.62rem] font-extrabold tracking-wider uppercase">
          {label}
        </span>
        <span className="text-cocoa mt-1 block text-sm font-bold capitalize">
          {value}
        </span>
      </span>
    </div>
  );
}
