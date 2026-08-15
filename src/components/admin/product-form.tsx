"use client";

import { AlertCircle, Check, Eye, LoaderCircle, Save } from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { saveProductAction } from "@/actions/admin";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/validation";
import type { Category, MediaItem, Product } from "@/types/domain";

export function ProductForm({
  product,
  categories,
  media = [],
}: {
  product?: Product;
  categories: Category[];
  media?: MediaItem[];
}) {
  const [state, action, pending] = useActionState(
    saveProductAction,
    initialActionState,
  );
  const [dirty, setDirty] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);
  const p = product;
  return (
    <form
      ref={formRef}
      action={action}
      onChange={() => setDirty(true)}
      onSubmit={() => setDirty(false)}
      className="space-y-6"
    >
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="paper-card p-5 sm:p-7">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField label="Product name" error={state.errors?.name?.[0]}>
            <input
              name="name"
              className="admin-field"
              defaultValue={p?.name}
              required
            />
          </FormField>
          <FormField
            label="URL slug"
            hint="Lowercase words separated by hyphens."
            error={state.errors?.slug?.[0]}
          >
            <input
              name="slug"
              className="admin-field font-mono text-sm"
              defaultValue={p?.slug}
              required
              pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            />
          </FormField>
        </div>
        <div className="mt-5">
          <FormField
            label="Short description"
            error={state.errors?.short_description?.[0]}
          >
            <textarea
              name="short_description"
              className="admin-field min-h-24"
              defaultValue={p?.short_description}
              required
              maxLength={300}
            />
          </FormField>
        </div>
        <div className="mt-5">
          <FormField
            label="Full description"
            hint="Plain text only. Exact ingredients and claims should be owner-verified."
            error={state.errors?.full_description?.[0]}
          >
            <textarea
              name="full_description"
              className="admin-field min-h-40"
              defaultValue={p?.full_description}
              required
              maxLength={5000}
            />
          </FormField>
        </div>
        <div className="mt-5">
          <FormField label="Category" error={state.errors?.category_id?.[0]}>
            <select
              name="category_id"
              className="admin-field"
              defaultValue={p?.category_id}
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </FormField>
        </div>
        <div className="border-cocoa/10 mt-6 grid gap-6 border-t pt-6 lg:grid-cols-2">
          <MediaPicker
            name="main_image_url"
            media={media}
            value={p?.main_image_url}
            label="Main product image"
            hint="Shown on menu cards, the product page, and social previews."
          />
          <MediaPicker
            name="gallery_image_urls"
            media={media}
            value={p?.images
              .toSorted((a, b) => a.display_order - b.display_order)
              .map((image) => image.image_url)}
            multiple
            max={12}
            label="Product gallery"
            hint="Select images in the order they should appear."
          />
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <div className="paper-card p-5 sm:p-7">
          <h2 className="font-display text-cocoa text-2xl font-bold">
            Price & availability
          </h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField
              label="Regular price (PHP)"
              hint="Leave blank if unconfirmed."
            >
              <input
                name="price"
                className="admin-field"
                type="number"
                min="0"
                step="0.01"
                defaultValue={p?.price ?? ""}
              />
            </FormField>
            <FormField label="Discounted price (PHP)">
              <input
                name="discounted_price"
                className="admin-field"
                type="number"
                min="0"
                step="0.01"
                defaultValue={p?.discounted_price ?? ""}
              />
            </FormField>
            <FormField label="Fallback price label">
              <input
                name="price_label"
                className="admin-field"
                defaultValue={p?.price_label ?? "Ask for price"}
              />
            </FormField>
            <FormField label="Serving / package size">
              <input
                name="serving_size"
                className="admin-field"
                defaultValue={p?.serving_size}
              />
            </FormField>
            <FormField label="Availability">
              <select
                name="availability"
                className="admin-field"
                defaultValue={p?.availability ?? "available"}
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
                <option value="seasonal">Seasonal</option>
                <option value="preorder">Pre-order</option>
              </select>
            </FormField>
            <FormField label="Publish status">
              <select
                name="status"
                className="admin-field"
                defaultValue={p?.status ?? "draft"}
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </FormField>
          </div>
        </div>
        <div className="paper-card p-5 sm:p-7">
          <h2 className="font-display text-cocoa text-2xl font-bold">
            Merchandising
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <CheckField
              name="is_best_seller"
              label="Best seller"
              checked={p?.is_best_seller}
            />
            <CheckField
              name="is_featured"
              label="Featured"
              checked={p?.is_featured}
            />
            <CheckField name="is_new" label="New" checked={p?.is_new} />
            <CheckField
              name="is_seasonal"
              label="Seasonal"
              checked={p?.is_seasonal}
            />
            <CheckField
              name="is_preorder"
              label="Pre-order"
              checked={p?.is_preorder}
            />
            <CheckField
              name="needs_review"
              label="Needs owner review"
              checked={p?.needs_review ?? true}
            />
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField label="Display order">
              <input
                name="display_order"
                className="admin-field"
                type="number"
                min="0"
                defaultValue={p?.display_order ?? 0}
              />
            </FormField>
            <FormField label="Tags" hint="Comma-separated">
              <input
                name="tags"
                className="admin-field"
                defaultValue={p?.tags.join(", ")}
              />
            </FormField>
          </div>
        </div>
      </div>
      <div className="paper-card p-5 sm:p-7">
        <h2 className="font-display text-cocoa text-2xl font-bold">
          Search & sharing
        </h2>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField label="SEO title" hint="Aim for 50–60 characters.">
            <input
              name="seo_title"
              className="admin-field"
              defaultValue={p?.seo_title}
              maxLength={70}
            />
          </FormField>
          <FormField label="SEO description" hint="Aim for 140–160 characters.">
            <textarea
              name="seo_description"
              className="admin-field min-h-24"
              defaultValue={p?.seo_description}
              maxLength={170}
            />
          </FormField>
        </div>
      </div>
      {state.message && (
        <div
          className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold ${state.status === "success" ? "bg-leaf/10 text-leaf" : "bg-danger/10 text-danger"}`}
          role="status"
        >
          {state.status === "success" ? (
            <Check className="size-4" />
          ) : (
            <AlertCircle className="size-4" />
          )}
          {state.message}
        </div>
      )}
      <div className="border-cocoa/10 sticky bottom-4 z-20 flex flex-col gap-3 rounded-2xl border bg-white/92 p-4 shadow-[0_18px_50px_rgba(58,36,24,.14)] backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted text-xs font-bold">
          {dirty
            ? "You have unsaved changes."
            : "All current changes are saved."}
        </p>
        <div className="flex gap-3">
          {p && (
            <Button asChild type="button" variant="outline">
              <Link href={`/admin/products/${p.id}/preview`}>
                <Eye className="size-4" />
                Preview
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              formRef.current?.reset();
              setDirty(false);
            }}
            disabled={pending}
          >
            Reset
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {pending ? "Saving…" : p ? "Save changes" : "Create product"}
          </Button>
        </div>
      </div>
    </form>
  );
}
function FormField({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-cocoa mb-2 block text-sm font-extrabold">
        {label}
      </span>
      {children}
      {error ? (
        <span className="text-danger mt-1.5 block text-xs font-bold">
          {error}
        </span>
      ) : hint ? (
        <span className="text-muted mt-1.5 block text-xs">{hint}</span>
      ) : null}
    </label>
  );
}
function CheckField({
  name,
  label,
  checked = false,
}: {
  name: string;
  label: string;
  checked?: boolean;
}) {
  return (
    <label className="border-cocoa/10 text-cocoa flex min-h-11 items-center gap-3 rounded-xl border bg-white px-4 py-3 text-sm font-bold">
      <input
        type="checkbox"
        name={name}
        defaultChecked={checked}
        className="size-4 accent-[#72457A]"
      />
      {label}
    </label>
  );
}
