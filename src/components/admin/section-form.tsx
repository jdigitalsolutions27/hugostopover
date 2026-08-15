"use client";

import { ChevronDown, Eye, EyeOff, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import { updateSectionAction } from "@/actions/admin";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { humanizeSectionKey, sectionSetting } from "@/lib/content";
import { initialActionState } from "@/lib/validation";
import type { MediaItem, PageSection } from "@/types/domain";

export function SectionForm({
  section,
  media = [],
  defaultOpen = false,
}: {
  section: PageSection;
  media?: MediaItem[];
  defaultOpen?: boolean;
}) {
  const [state, action, pending] = useActionState(
    updateSectionAction,
    initialActionState,
  );
  return (
    <details
      className="paper-card group overflow-hidden"
      open={defaultOpen || state.status !== "idle"}
    >
      <summary className="hover:bg-beige/20 flex cursor-pointer list-none items-center gap-4 px-5 py-5 sm:px-7 [&::-webkit-details-marker]:hidden">
        <span
          className={`grid size-10 shrink-0 place-items-center rounded-xl ${section.is_visible && section.status === "published" ? "bg-leaf/10 text-leaf" : "bg-beige text-muted"}`}
        >
          {section.is_visible && section.status === "published" ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="text-ube block text-[.65rem] font-extrabold tracking-wider uppercase">
            {humanizeSectionKey(section.section_key)}
          </span>
          <span className="font-display text-cocoa mt-1 block truncate text-xl font-bold">
            {section.heading || "Untitled section"}
          </span>
        </span>
        <span className="text-muted hidden text-right text-[.65rem] font-bold sm:block">
          Order {section.display_order}
          <span className="mt-1 block capitalize">{section.status}</span>
        </span>
        <ChevronDown className="text-muted size-5 transition group-open:rotate-180" />
      </summary>
      <form action={action} className="border-cocoa/10 border-t p-5 sm:p-7">
        <input type="hidden" name="id" value={section.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Eyebrow / small heading">
            <input
              name="eyebrow"
              className="admin-field"
              defaultValue={section.eyebrow}
            />
          </Field>
          <Field label="Main heading">
            <input
              name="heading"
              className="admin-field"
              defaultValue={section.heading}
              required
            />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Body copy">
            <textarea
              name="body"
              className="admin-field min-h-32"
              defaultValue={section.body}
            />
          </Field>
        </div>
        <div className="border-cocoa/10 mt-5 border-t pt-5">
          <MediaPicker
            name="image_url"
            media={media}
            value={section.image_url}
            label="Section image"
            hint="Optional. If this layout displays an image, this selection replaces the placeholder."
          />
          <div className="mt-4">
            <Field
              label="Image description (alt text)"
              hint="Describe the image for visitors using screen readers."
            >
              <input
                name="image_alt"
                className="admin-field"
                defaultValue={sectionSetting(section, "image_alt")}
                maxLength={220}
              />
            </Field>
          </div>
        </div>
        {section.page_slug === "menu" &&
          section.section_key === "catalog_controls" && (
            <div className="border-cocoa/10 mt-5 border-t pt-5">
              <h3 className="font-display text-cocoa text-xl font-bold">
                Catalog controls
              </h3>
              <p className="text-muted mt-1 text-xs">
                Edit the search, filter, and empty-state labels around the
                product grid.
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["search_placeholder", "Search placeholder"],
                    ["all_label", "All filter"],
                    ["best_label", "Best sellers filter"],
                    ["featured_label", "Featured filter"],
                    ["available_label", "Available filter"],
                    ["category_label", "Category label"],
                    ["results_label", "Results summary"],
                    ["clear_label", "Clear filters button"],
                    ["empty_heading", "No-results heading"],
                    ["empty_body", "No-results message"],
                    ["show_all_label", "Show-all button"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      name={key}
                      className="admin-field"
                      defaultValue={sectionSetting(section, key)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}
        {section.page_slug === "home" && section.section_key === "hero" && (
          <div className="border-cocoa/10 mt-5 border-t pt-5">
            <h3 className="font-display text-cocoa text-xl font-bold">
              Quick-information labels
            </h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {(
                [
                  ["location_label", "Location label"],
                  ["hours_label", "Hours fallback label"],
                  ["phone_label", "Phone label"],
                ] as const
              ).map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    name={key}
                    className="admin-field"
                    defaultValue={sectionSetting(section, key)}
                  />
                </Field>
              ))}
            </div>
          </div>
        )}
        {section.page_slug === "global" &&
          section.section_key === "footer_verse" && (
            <div className="border-cocoa/10 mt-5 border-t pt-5">
              <h3 className="font-display text-cocoa text-xl font-bold">
                Verse presentation
              </h3>
              <p className="text-muted mt-1 text-xs">
                The body copy is the verse quotation. Name the translation so
                visitors know which wording is shown.
              </p>
              <div className="mt-4 max-w-md">
                <Field label="Bible translation label">
                  <input
                    name="translation_label"
                    className="admin-field"
                    defaultValue={sectionSetting(section, "translation_label")}
                    placeholder="King James Version (KJV)"
                  />
                </Field>
              </div>
            </div>
          )}
        {section.page_slug === "product" &&
          section.section_key === "detail_controls" && (
            <div className="border-cocoa/10 mt-5 border-t pt-5">
              <h3 className="font-display text-cocoa text-xl font-bold">
                Product-page labels
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["back_label", "Back link"],
                    ["availability_label", "Availability label"],
                    ["package_label", "Package label"],
                    ["price_label", "Price label"],
                    ["tags_label", "Tags label"],
                    ["inquiry_label", "Inquiry button"],
                    ["related_heading", "Related-products heading"],
                    ["available_value", "Available status text"],
                    ["fallback_tags", "Fallback tags text"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      name={key}
                      className="admin-field"
                      defaultValue={sectionSetting(section, key)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}
        {section.page_slug === "visit" &&
          section.section_key === "form_controls" && (
            <div className="border-cocoa/10 mt-5 border-t pt-5">
              <h3 className="font-display text-cocoa text-xl font-bold">
                Inquiry-form labels
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(
                  [
                    ["name_label", "Name field"],
                    ["phone_label", "Phone field"],
                    ["phone_placeholder", "Phone placeholder"],
                    ["email_label", "Email field"],
                    ["email_hint", "Email/phone hint"],
                    ["subject_label", "Subject field"],
                    ["message_label", "Message field"],
                    ["privacy_note", "Privacy note"],
                    ["submit_label", "Submit button"],
                    ["sending_label", "Sending state"],
                  ] as const
                ).map(([key, label]) => (
                  <Field key={key} label={label}>
                    <input
                      name={key}
                      className="admin-field"
                      defaultValue={sectionSetting(section, key)}
                    />
                  </Field>
                ))}
              </div>
            </div>
          )}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Primary button label">
            <input
              name="primary_cta_label"
              className="admin-field"
              defaultValue={section.primary_cta_label}
            />
          </Field>
          <Field label="Primary button link">
            <input
              name="primary_cta_url"
              className="admin-field"
              defaultValue={section.primary_cta_url}
            />
          </Field>
          <Field label="Secondary button label">
            <input
              name="secondary_cta_label"
              className="admin-field"
              defaultValue={section.secondary_cta_label}
            />
          </Field>
          <Field label="Secondary button link">
            <input
              name="secondary_cta_url"
              className="admin-field"
              defaultValue={section.secondary_cta_url}
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-[160px_180px_1fr] sm:items-end">
          <Field label="Section order">
            <input
              type="number"
              min="0"
              max="10000"
              name="display_order"
              className="admin-field"
              defaultValue={section.display_order}
            />
          </Field>
          <Field label="Publication status">
            <select
              name="status"
              defaultValue={section.status}
              className="admin-field"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </Field>
          <label className="border-cocoa/10 text-cocoa flex min-h-12 items-center gap-3 rounded-xl border bg-white px-4 text-sm font-bold">
            <input
              type="checkbox"
              name="is_visible"
              defaultChecked={section.is_visible}
              className="size-4 accent-[#72457A]"
            />
            Show this section on the website
          </label>
        </div>
        {state.message && (
          <p
            className={`mt-4 rounded-xl px-4 py-3 text-xs font-bold ${state.status === "success" ? "bg-leaf/10 text-leaf" : "bg-danger/10 text-danger"}`}
            role="status"
          >
            {state.message}
          </p>
        )}
        <div className="mt-5 flex justify-end">
          <Button type="submit" disabled={pending}>
            {pending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {pending ? "Saving…" : "Save section"}
          </Button>
        </div>
      </form>
    </details>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-cocoa mb-1.5 block text-xs font-extrabold">
        {label}
      </span>
      {children}
      {hint && <span className="text-muted mt-1 block text-xs">{hint}</span>}
    </label>
  );
}
