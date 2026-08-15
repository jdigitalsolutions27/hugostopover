import Link from "next/link";
import {
  Archive,
  Copy,
  Edit3,
  GripVertical,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react";
import {
  archiveProductAction,
  bulkAvailabilityAction,
  deleteProductAction,
  duplicateProductAction,
  restoreProductAction,
} from "@/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getProducts } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
import { formatPeso } from "@/lib/utils";

export default async function AdminProductsPage({
  searchParams,
}: PageProps<"/admin/products">) {
  const [products, session, query] = await Promise.all([
    getProducts(true),
    requireAdmin(),
    searchParams,
  ]);
  const search = String(query.q ?? "").toLowerCase();
  const status = String(query.status ?? "all");
  const sort = String(query.sort ?? "display_order");
  const filtered = products
    .filter(
      (product) =>
        (!search ||
          `${product.name} ${product.category?.name}`
            .toLowerCase()
            .includes(search)) &&
        (status === "all" ||
          (status === "archived"
            ? Boolean(product.deleted_at)
            : product.status === status && !product.deleted_at)),
    )
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "updated") return b.updated_at.localeCompare(a.updated_at);
      if (sort === "newest") return b.created_at.localeCompare(a.created_at);
      if (sort === "category")
        return (a.category?.name ?? "").localeCompare(b.category?.name ?? "");
      return a.display_order - b.display_order;
    });
  const pageSize = 20;
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(
    totalPages,
    Math.max(1, Number(query.page) || 1),
  );
  const pageItems = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const pageHref = (page: number) => {
    const params = new URLSearchParams();
    if (search) params.set("q", String(query.q ?? ""));
    if (status !== "all") params.set("status", status);
    if (sort !== "display_order") params.set("sort", sort);
    params.set("page", String(page));
    return `/admin/products?${params.toString()}`;
  };
  return (
    <div>
      <AdminPageHeader
        eyebrow="Catalog"
        title="Products"
        description="Create, publish, price, feature, archive, restore, and reorder every item shown on the public menu."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/products/reorder">
                <GripVertical className="size-4" />
                Reorder
              </Link>
            </Button>
            <Button asChild>
              <Link href="/admin/products/new">
                <Plus className="size-4" />
                Add product
              </Link>
            </Button>
          </div>
        }
      />
      <div className="paper-card mb-5 p-4">
        <form className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[1fr_180px_180px_auto]">
          <input
            name="q"
            className="admin-field"
            placeholder="Search products…"
            defaultValue={String(query.q ?? "")}
          />
          <select name="status" className="admin-field" defaultValue={status}>
            <option value="all">All statuses</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
          <select name="sort" className="admin-field" defaultValue={sort}>
            <option value="display_order">Display order</option>
            <option value="name">Name A–Z</option>
            <option value="category">Category</option>
            <option value="updated">Recently updated</option>
            <option value="newest">Newest created</option>
          </select>
          <Button type="submit" variant="outline">
            Filter
          </Button>
        </form>
      </div>
      <div className="paper-card overflow-hidden">
        <div className="border-cocoa/10 flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted text-xs font-bold">
            {filtered.length} products
          </p>
          <form
            id="bulk-product-form"
            action={bulkAvailabilityAction}
            className="flex gap-2"
          >
            <select
              name="availability"
              className="admin-field !w-auto !py-2 text-xs"
            >
              <option value="available">Set available</option>
              <option value="unavailable">Set unavailable</option>
              <option value="seasonal">Set seasonal</option>
              <option value="preorder">Set pre-order</option>
            </select>
            <Button type="submit" variant="outline" size="sm">
              Apply to selected
            </Button>
          </form>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-beige/30 text-muted text-[.66rem] tracking-wider uppercase">
              <tr>
                <th className="p-4">
                  <span className="sr-only">Select</span>
                </th>
                <th className="p-4">Product</th>
                <th className="p-4">Price</th>
                <th className="p-4">Availability</th>
                <th className="p-4">Status</th>
                <th className="p-4">Review</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-cocoa/8 divide-y">
              {pageItems.map((product) => (
                <tr
                  key={product.id}
                  className={
                    product.deleted_at
                      ? "bg-cocoa/[.03] opacity-70"
                      : "bg-white"
                  }
                >
                  <td className="p-4">
                    <input
                      form="bulk-product-form"
                      type="checkbox"
                      name="selected"
                      value={product.id}
                      aria-label={`Select ${product.name}`}
                      className="size-4 accent-[#72457A]"
                      disabled={Boolean(product.deleted_at)}
                    />
                  </td>
                  <td className="p-4">
                    <p className="text-cocoa text-sm font-extrabold">
                      {product.name}
                    </p>
                    <p className="text-muted mt-1 text-xs">
                      {product.category?.name}
                    </p>
                  </td>
                  <td className="text-cocoa p-4 text-sm font-bold">
                    {formatPeso(
                      product.discounted_price ?? product.price,
                      product.price_label,
                    )}
                  </td>
                  <td className="p-4">
                    <Badge className="capitalize">{product.availability}</Badge>
                  </td>
                  <td className="p-4">
                    <Badge
                      className={
                        product.status === "published"
                          ? "bg-leaf/12 text-leaf"
                          : "bg-cocoa/8 text-cocoa"
                      }
                    >
                      {product.deleted_at ? "archived" : product.status}
                    </Badge>
                  </td>
                  <td className="text-muted p-4 text-xs font-bold">
                    {product.needs_review ? "Needs review" : "Confirmed"}
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      {product.deleted_at ? (
                        <form action={restoreProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <Button size="sm" variant="ghost" title="Restore">
                            <RotateCcw className="size-4" />
                          </Button>
                        </form>
                      ) : (
                        <>
                          <Button asChild size="sm" variant="ghost">
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              title="Edit"
                            >
                              <Edit3 className="size-4" />
                            </Link>
                          </Button>
                          <form action={duplicateProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <Button size="sm" variant="ghost" title="Duplicate">
                              <Copy className="size-4" />
                            </Button>
                          </form>
                          <form action={archiveProductAction}>
                            <input type="hidden" name="id" value={product.id} />
                            <ConfirmButton
                              size="sm"
                              variant="ghost"
                              title="Archive"
                              message={`Archive ${product.name}?`}
                            >
                              <Archive className="size-4" />
                            </ConfirmButton>
                          </form>
                        </>
                      )}
                      {session.role === "owner" && (
                        <form action={deleteProductAction}>
                          <input type="hidden" name="id" value={product.id} />
                          <ConfirmButton
                            size="sm"
                            variant="ghost"
                            className="text-danger"
                            title="Delete permanently"
                            message={`Permanently delete ${product.name}? This cannot be undone.`}
                          >
                            <Trash2 className="size-4" />
                          </ConfirmButton>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!filtered.length && (
            <div className="text-muted p-12 text-center text-sm">
              No products match these filters.
            </div>
          )}
        </div>
        {totalPages > 1 && (
          <nav
            className="border-cocoa/10 flex items-center justify-between border-t p-4"
            aria-label="Product pages"
          >
            {currentPage > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(currentPage - 1)}>Previous</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
            )}
            <p className="text-muted text-xs font-bold">
              Page {currentPage} of {totalPages}
            </p>
            {currentPage < totalPages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={pageHref(currentPage + 1)}>Next</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            )}
          </nav>
        )}
      </div>
    </div>
  );
}
