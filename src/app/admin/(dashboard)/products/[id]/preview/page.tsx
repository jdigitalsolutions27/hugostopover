import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductVisual } from "@/components/product-visual";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProductById } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
import { formatPeso } from "@/lib/utils";

export default async function ProductPreviewPage({
  params,
}: PageProps<"/admin/products/[id]/preview">) {
  await requireAdmin();
  const { id } = await params;
  const product = await getProductById(id);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow="Private preview"
        title={product.name}
        description="This protected preview shows draft content without making it visible on the public menu."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/admin/products/${product.id}/edit`}>
                <ArrowLeft className="size-4" /> Back to editor
              </Link>
            </Button>
            {product.status === "published" && !product.deleted_at && (
              <Button asChild>
                <Link href={`/menu/${product.slug}`} target="_blank">
                  <ExternalLink className="size-4" /> Open public page
                </Link>
              </Button>
            )}
          </div>
        }
      />
      <div className="paper-card grid overflow-hidden lg:grid-cols-2">
        <div className="relative min-h-[420px]">
          <ProductVisual
            name={product.name}
            categorySlug={product.category?.slug || "pasalubong"}
            imageUrl={product.main_image_url}
            className="absolute inset-0"
            priority
          />
        </div>
        <div className="p-7 sm:p-10">
          <div className="flex flex-wrap gap-2">
            <Badge>{product.status}</Badge>
            <Badge className="capitalize">{product.availability}</Badge>
            {product.is_best_seller && <Badge>Best seller</Badge>}
          </div>
          <p className="eyebrow mt-7">{product.category?.name}</p>
          <h1 className="display-title text-cocoa mt-2 text-5xl">
            {product.name}
          </h1>
          <p className="text-muted mt-5 leading-8">
            {product.full_description}
          </p>
          <dl className="border-cocoa/10 mt-7 grid gap-4 rounded-2xl border p-5 sm:grid-cols-2">
            <div>
              <dt className="text-muted text-xs font-bold uppercase">Price</dt>
              <dd className="text-cocoa mt-1 font-extrabold">
                {formatPeso(
                  product.discounted_price ?? product.price,
                  product.price_label,
                )}
              </dd>
            </div>
            <div>
              <dt className="text-muted text-xs font-bold uppercase">
                Package
              </dt>
              <dd className="text-cocoa mt-1 font-extrabold">
                {product.serving_size || "Not supplied"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
