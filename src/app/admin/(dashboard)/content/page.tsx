import Link from "next/link";
import { Eye, FileText, LayoutTemplate, Megaphone, Trash2 } from "lucide-react";
import {
  deletePromotionAction,
  savePromotionAction,
  updatePageSeoAction,
} from "@/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaPicker } from "@/components/admin/media-picker";
import { SectionForm } from "@/components/admin/section-form";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getMedia } from "@/data/repository";
import type { MediaItem, PageSection, Promotion } from "@/types/domain";

type PageRow = {
  id: string;
  slug: string;
  title: string;
  seo_title: string;
  seo_description: string;
  status: "draft" | "published" | "archived";
};

const pageOrder = ["home", "menu", "product", "about", "visit", "global"];
const pageLabels: Record<string, string> = {
  home: "Homepage",
  menu: "Menu",
  product: "Product page",
  about: "About",
  visit: "Visit & contact",
  global: "Header & footer",
};
const previewPaths: Record<string, string> = {
  home: "/",
  menu: "/menu",
  product: "/menu",
  about: "/about",
  visit: "/visit",
  global: "/",
};

export default async function ContentPage({
  searchParams,
}: PageProps<"/admin/content">) {
  await requireAdmin(["owner", "editor"]);
  const query = await searchParams;
  const supabase = await createSupabaseServerClient();
  const [sectionResult, pageResult, promotionResult, media] = await Promise.all(
    [
      supabase
        .from("page_sections")
        .select("*")
        .order("page_slug")
        .order("display_order"),
      supabase.from("pages").select("*").order("slug"),
      supabase
        .from("promotions")
        .select("*")
        .is("deleted_at", null)
        .order("display_order"),
      getMedia(),
    ],
  );
  const sections = (sectionResult.data ?? []) as PageSection[];
  const pages = ((pageResult.data ?? []) as PageRow[])
    .filter((page) => page.slug !== "gallery")
    .toSorted((a, b) => pageOrder.indexOf(a.slug) - pageOrder.indexOf(b.slug));
  const promotions = (promotionResult.data ?? []) as Promotion[];
  const requested = String(query.page ?? "home");
  const selectedPage =
    pages.find((page) => page.slug === requested) ?? pages[0];
  const selectedSections = sections.filter(
    (section) => section.page_slug === selectedPage?.slug,
  );

  return (
    <div className="mx-auto max-w-7xl">
      <AdminPageHeader
        eyebrow="Website content"
        title="Pages, text & images"
        description="Work one page at a time. Edit structured copy, choose images visually, control calls to action, publish sections, and preview the result safely."
        actions={
          selectedPage && (
            <Button asChild variant="outline">
              <Link
                href={previewPaths[selectedPage.slug] ?? "/"}
                target="_blank"
              >
                <Eye className="size-4" /> Preview page
              </Link>
            </Button>
          )
        }
      />
      <div className="border-gold/30 bg-gold/10 text-cocoa mb-6 flex gap-3 rounded-2xl border p-4 text-sm leading-6">
        <LayoutTemplate className="text-ube mt-0.5 size-5 shrink-0" />
        <p>
          <strong>Safe editing:</strong> content is stored as structured text,
          links, and media selections. The dashboard does not accept raw HTML,
          keeping the website design consistent and reducing security risk.
        </p>
      </div>

      <nav
        className="paper-card sticky top-[4.75rem] z-20 mb-6 flex gap-2 overflow-x-auto p-2"
        aria-label="Website pages"
      >
        {pages.map((page) => {
          const active = page.slug === selectedPage?.slug;
          const count = sections.filter(
            (section) => section.page_slug === page.slug,
          ).length;
          return (
            <Link
              key={page.id}
              href={`/admin/content?page=${page.slug}`}
              className={`shrink-0 rounded-xl px-4 py-3 text-xs font-extrabold transition ${active ? "bg-cocoa text-cream shadow" : "text-cocoa hover:bg-beige/40"}`}
            >
              {pageLabels[page.slug] ?? page.title}
              <span
                className={`ml-2 rounded-full px-2 py-0.5 text-[.6rem] ${active ? "bg-cream/15" : "bg-beige"}`}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </nav>

      {selectedPage ? (
        <>
          <section className="paper-card mb-6 p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <span className="bg-gold/15 text-ube grid size-11 shrink-0 place-items-center rounded-xl">
                <FileText className="size-5" />
              </span>
              <div>
                <p className="eyebrow">Search & sharing</p>
                <h2 className="font-display text-cocoa mt-1 text-2xl font-bold">
                  {pageLabels[selectedPage.slug] ?? selectedPage.title} metadata
                </h2>
                <p className="text-muted mt-2 text-xs leading-5">
                  This controls the browser title and the description shown by
                  search engines and social platforms.
                </p>
              </div>
            </div>
            <form
              action={updatePageSeoAction}
              className="mt-6 grid gap-4 lg:grid-cols-2"
            >
              <input type="hidden" name="id" value={selectedPage.id} />
              <Field label="Dashboard page name">
                <input
                  name="title"
                  className="admin-field"
                  defaultValue={selectedPage.title}
                />
              </Field>
              <Field label="SEO title" hint="Keep this near 50–60 characters.">
                <input
                  name="seo_title"
                  className="admin-field"
                  maxLength={70}
                  defaultValue={selectedPage.seo_title}
                />
              </Field>
              <div className="lg:col-span-2">
                <Field
                  label="SEO description"
                  hint="Describe this page clearly in about 140–160 characters."
                >
                  <textarea
                    name="seo_description"
                    className="admin-field min-h-24"
                    maxLength={170}
                    defaultValue={selectedPage.seo_description}
                  />
                </Field>
              </div>
              <Field label="Page status">
                <select
                  name="status"
                  className="admin-field"
                  defaultValue={selectedPage.status}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </Field>
              <div className="flex items-end justify-end">
                <Button type="submit">Save metadata</Button>
              </div>
            </form>
          </section>

          {selectedPage.slug === "home" && (
            <section className="paper-card mb-6 p-5 sm:p-7">
              <div className="flex items-start gap-4">
                <span className="bg-ube/10 text-ube grid size-11 shrink-0 place-items-center rounded-xl">
                  <Megaphone className="size-5" />
                </span>
                <div>
                  <h2 className="font-display text-cocoa text-2xl font-bold">
                    Promotional banners
                  </h2>
                  <p className="text-muted mt-1 text-xs">
                    Add only current, accurate offers. The first active banner
                    is used on the homepage.
                  </p>
                </div>
              </div>
              <div className="border-cocoa/10 mt-6 rounded-2xl border bg-white p-4">
                <PromotionForm media={media} />
              </div>
              <div className="mt-4 space-y-4">
                {promotions.map((item) => (
                  <div
                    key={item.id}
                    className="border-cocoa/10 rounded-2xl border bg-white p-4"
                  >
                    <PromotionForm item={item} media={media} />
                    <form action={deletePromotionAction} className="mt-3">
                      <input type="hidden" name="id" value={item.id} />
                      <ConfirmButton
                        type="submit"
                        size="sm"
                        variant="ghost"
                        className="text-danger"
                        message="Remove this promotional banner?"
                      >
                        <Trash2 className="size-4" /> Delete promotion
                      </ConfirmButton>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-4 flex items-end justify-between gap-4 px-1">
              <div>
                <p className="eyebrow">Page builder</p>
                <h2 className="font-display text-cocoa mt-1 text-3xl font-bold">
                  {selectedSections.length} editable sections
                </h2>
              </div>
              <p className="text-muted hidden max-w-sm text-right text-xs sm:block">
                Expand a section to edit it. Lower order numbers appear first
                where the page layout supports reordering.
              </p>
            </div>
            <div className="space-y-4">
              {selectedSections.map((section, index) => (
                <SectionForm
                  key={section.id}
                  section={section}
                  media={media}
                  defaultOpen={index === 0}
                />
              ))}
              {!selectedSections.length && (
                <div className="border-cocoa/15 text-muted rounded-2xl border border-dashed p-10 text-center text-sm">
                  No editable sections are configured for this page yet.
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <div className="paper-card p-10 text-center">No pages configured.</div>
      )}
    </div>
  );
}

function PromotionForm({
  item,
  media,
}: {
  item?: Promotion;
  media: MediaItem[];
}) {
  return (
    <form action={savePromotionAction} className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="id" value={item?.id ?? ""} />
      <Field label="Promotion title">
        <input
          name="title"
          className="admin-field"
          defaultValue={item?.title}
          required
        />
      </Field>
      <Field label="Button label">
        <input
          name="cta_label"
          className="admin-field"
          defaultValue={item?.cta_label}
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Promotion details">
          <textarea
            name="description"
            className="admin-field min-h-24"
            defaultValue={item?.description}
          />
        </Field>
      </div>
      <Field label="Button link">
        <input
          name="cta_url"
          className="admin-field"
          defaultValue={item?.cta_url}
          placeholder="/menu or Messenger URL"
        />
      </Field>
      <Field label="Display order">
        <input
          name="display_order"
          type="number"
          min="0"
          className="admin-field"
          defaultValue={item?.display_order ?? 0}
        />
      </Field>
      <div className="sm:col-span-2">
        <MediaPicker
          name="image_url"
          media={media}
          value={item?.image_url}
          label="Promotion image"
          hint="Optional. The banner stays readable even without an image."
        />
      </div>
      <label className="text-cocoa flex items-center gap-3 text-sm font-bold">
        <input
          name="is_active"
          type="checkbox"
          defaultChecked={item?.is_active}
          className="size-4 accent-[#72457A]"
        />
        Active on the website
      </label>
      <div className="flex justify-end">
        <Button type="submit" size="sm">
          {item ? "Save promotion" : "Add promotion"}
        </Button>
      </div>
    </form>
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
