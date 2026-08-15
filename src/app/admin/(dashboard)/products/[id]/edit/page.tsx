import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getMedia, getProductById } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function EditProductPage({
  params,
}: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await params;
  const [product, categories, media] = await Promise.all([
    getProductById(id),
    getCategories(true),
    getMedia(),
    requireAdmin(),
  ]);
  if (!product) notFound();
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow="Catalog"
        title={`Edit ${product.name}`}
        description="Changes apply to the public menu after saving when the item is published."
      />
      <ProductForm product={product} categories={categories} media={media} />
    </div>
  );
}
