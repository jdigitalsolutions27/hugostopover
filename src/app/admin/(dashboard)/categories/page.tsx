import { Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { CategoryForm } from "@/components/admin/category-form";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { getCategories, getMedia, getProducts } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function CategoriesPage({
  searchParams,
}: PageProps<"/admin/categories">) {
  const [categories, products, media, session, query] = await Promise.all([
    getCategories(true),
    getProducts(true),
    getMedia(),
    requireAdmin(["owner", "editor"]),
    searchParams,
  ]);
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Catalog structure"
        title="Categories"
        description="Organize the public menu, control category order, and hide sections without breaking product relationships."
      />
      {query.error === "category-in-use" && (
        <p className="bg-danger/10 text-danger mb-5 rounded-xl p-4 text-sm font-bold">
          This category still has products. Reassign them before deleting the
          category.
        </p>
      )}
      <section className="paper-card p-5 sm:p-7">
        <h2 className="font-display text-cocoa text-2xl font-bold">
          Add category
        </h2>
        <div className="mt-5">
          <CategoryForm media={media} />
        </div>
      </section>
      <section className="mt-6 space-y-4">
        {categories.map((category) => {
          const count = products.filter(
            (p) => p.category_id === category.id && !p.deleted_at,
          ).length;
          return (
            <div key={category.id} className="paper-card p-5 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-cocoa text-xl font-bold">
                    {category.name}
                  </h2>
                  <p className="text-muted mt-1 text-xs">
                    {count} products •{" "}
                    {category.is_visible ? "Visible" : "Hidden"}
                  </p>
                </div>
                {session.role === "owner" && (
                  <form action={deleteCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <ConfirmButton
                      variant="ghost"
                      size="sm"
                      className="text-danger"
                      message={
                        count
                          ? "This category cannot be deleted until products are reassigned."
                          : `Delete ${category.name}?`
                      }
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </ConfirmButton>
                  </form>
                )}
              </div>
              <CategoryForm category={category} media={media} />
            </div>
          );
        })}
      </section>
    </div>
  );
}
