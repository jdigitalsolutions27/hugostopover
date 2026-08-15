"use client";
import { LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import { saveCategoryAction } from "@/actions/admin";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/validation";
import type { Category, MediaItem } from "@/types/domain";
export function CategoryForm({
  category,
  media = [],
}: {
  category?: Category;
  media?: MediaItem[];
}) {
  const [state, action, pending] = useActionState(
    saveCategoryAction,
    initialActionState,
  );
  return (
    <form
      action={action}
      className="border-cocoa/10 rounded-2xl border bg-white p-5"
    >
      <input type="hidden" name="id" value={category?.id ?? ""} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" error={state.errors?.name?.[0]}>
          <input
            name="name"
            className="admin-field"
            defaultValue={category?.name}
            required
          />
        </Field>
        <Field label="Slug" error={state.errors?.slug?.[0]}>
          <input
            name="slug"
            className="admin-field font-mono text-sm"
            defaultValue={category?.slug}
            required
          />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Description">
          <textarea
            name="description"
            className="admin-field min-h-20"
            defaultValue={category?.description}
          />
        </Field>
      </div>
      <div className="mt-4 max-w-[130px]">
        <Field label="Display order">
          <input
            name="display_order"
            type="number"
            min="0"
            className="admin-field"
            defaultValue={category?.display_order ?? 0}
          />
        </Field>
      </div>
      <div className="border-cocoa/10 mt-5 border-t pt-5">
        <MediaPicker
          name="image_url"
          media={media}
          value={category?.image_url}
          label="Category cover image"
          hint="Optional. Used in the homepage category preview when supplied."
        />
      </div>
      <label className="text-cocoa mt-4 flex items-center gap-3 text-sm font-bold">
        <input
          name="is_visible"
          type="checkbox"
          defaultChecked={category?.is_visible ?? true}
          className="size-4 accent-[#72457A]"
        />
        Visible on the website
      </label>
      {state.message && (
        <p
          className={`mt-4 text-xs font-bold ${state.status === "success" ? "text-leaf" : "text-danger"}`}
        >
          {state.message}
        </p>
      )}
      <Button type="submit" size="sm" className="mt-4" disabled={pending}>
        {pending ? (
          <LoaderCircle className="size-4 animate-spin" />
        ) : (
          <Save className="size-4" />
        )}
        {category ? "Save category" : "Add category"}
      </Button>
    </form>
  );
}
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-cocoa mb-1.5 block text-xs font-extrabold">
        {label}
      </span>
      {children}
      {error && (
        <span className="text-danger mt-1 block text-xs font-bold">
          {error}
        </span>
      )}
    </label>
  );
}
