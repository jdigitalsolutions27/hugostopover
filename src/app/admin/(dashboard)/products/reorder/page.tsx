import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ProductOrderList } from "@/components/admin/product-order-list";
import { getProducts } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function ReorderProductsPage() {
  const [allProducts] = await Promise.all([getProducts(true), requireAdmin()]);
  const products = allProducts
    .filter((p) => !p.deleted_at)
    .sort((a, b) => a.display_order - b.display_order);
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader
        eyebrow="Catalog order"
        title="Reorder products"
        description="Drag with a pointer, or focus a handle and use the keyboard controls to change the menu’s display order."
      />
      <ProductOrderList products={products} />
    </div>
  );
}
