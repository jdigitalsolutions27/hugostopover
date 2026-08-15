import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductForm } from "@/components/admin/product-form";
import { getCategories, getMedia } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function NewProductPage() {
  const [categories, media] = await Promise.all([
    getCategories(true),
    getMedia(),
    requireAdmin(),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow="Catalog"
        title="Add a product"
        description="Start as a draft, review the details, then publish when ready."
      />
      <ProductForm categories={categories} media={media} />
    </div>
  );
}
