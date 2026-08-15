import { Trash2 } from "lucide-react";
import {
  deleteTestimonialAction,
  saveTestimonialAction,
} from "@/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { getMedia, getTestimonials } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
import type { MediaItem } from "@/types/domain";
export default async function TestimonialsPage() {
  const [items, media] = await Promise.all([
    getTestimonials(true),
    getMedia(),
    requireAdmin(["owner", "editor"]),
  ]);
  return (
    <div className="mx-auto max-w-5xl">
      <AdminPageHeader
        eyebrow="Social proof"
        title="Testimonials"
        description="Only publish genuine, owner-verified customer quotes. No testimonials are pre-seeded."
      />
      <section className="paper-card p-5 sm:p-7">
        <h2 className="font-display text-cocoa text-2xl font-bold">
          Add a genuine testimonial
        </h2>
        <p className="text-muted mt-2 text-xs">
          Record the source so the quote can be verified later.
        </p>
        <TestimonialForm media={media} />
      </section>
      <div className="mt-6 space-y-4">
        {items.map((item) => (
          <section key={item.id} className="paper-card p-5 sm:p-7">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-cocoa text-xl font-bold">
                {item.customer_name}
              </h2>
              <form action={deleteTestimonialAction}>
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  message="Remove this testimonial from the website?"
                >
                  <Trash2 className="size-4" />
                </ConfirmButton>
              </form>
            </div>
            <TestimonialForm item={item} media={media} />
          </section>
        ))}
        {!items.length && (
          <p className="border-cocoa/20 text-muted mt-6 rounded-xl border border-dashed p-8 text-center text-sm">
            No testimonials yet. This is intentional—add only real customer
            feedback.
          </p>
        )}
      </div>
    </div>
  );
}
function TestimonialForm({
  item,
  media,
}: {
  item?: Awaited<ReturnType<typeof getTestimonials>>[number];
  media: MediaItem[];
}) {
  return (
    <form action={saveTestimonialAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <Field label="Customer name">
        <input
          name="customer_name"
          className="admin-field"
          defaultValue={item?.customer_name}
          required
        />
      </Field>
      <Field label="Source">
        <input
          name="source"
          className="admin-field"
          defaultValue={item?.source}
          placeholder="Facebook comment, written card…"
          required
        />
      </Field>
      <label className="sm:col-span-2">
        <span className="text-cocoa mb-1.5 block text-xs font-extrabold">
          Quote
        </span>
        <textarea
          name="quote"
          className="admin-field min-h-28"
          defaultValue={item?.quote}
          required
        />
      </label>
      <Field label="Rating (optional)">
        <input
          name="rating"
          className="admin-field"
          type="number"
          min="1"
          max="5"
          defaultValue={item?.rating ?? ""}
        />
      </Field>
      <div className="sm:col-span-2">
        <MediaPicker
          name="photo_url"
          media={media}
          value={item?.photo_url}
          label="Optional customer photo"
          hint="Publish only with the customer’s permission."
        />
      </div>
      <Field label="Status">
        <select
          name="status"
          className="admin-field"
          defaultValue={item?.status ?? "draft"}
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </Field>
      <Field label="Display order">
        <input
          name="display_order"
          className="admin-field"
          type="number"
          min="0"
          defaultValue={item?.display_order ?? 0}
        />
      </Field>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm">
          {item ? "Save testimonial" : "Add as draft"}
        </Button>
      </div>
    </form>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="text-cocoa mb-1.5 block text-xs font-extrabold">
        {label}
      </span>
      {children}
    </label>
  );
}
