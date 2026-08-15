import Image from "next/image";
import { Trash2 } from "lucide-react";
import { deleteMediaAction, updateMediaAction } from "@/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { MediaUploader } from "@/components/admin/media-uploader";
import { Button } from "@/components/ui/button";
import { getMedia } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
import { formatBytes } from "@/lib/utils";
export default async function MediaPage({
  searchParams,
}: PageProps<"/admin/media">) {
  const [media, session, query] = await Promise.all([
    getMedia(),
    requireAdmin(),
    searchParams,
  ]);
  const search = String(query.q ?? "").toLowerCase();
  const filtered = media.filter(
    (item) =>
      !search ||
      `${item.filename} ${item.alt_text} ${item.caption}`
        .toLowerCase()
        .includes(search),
  );
  return (
    <div>
      <AdminPageHeader
        eyebrow="Reusable assets"
        title="Media library"
        description="Upload validated images once, add accessible alt text, and reuse them across products, categories, pages, promotions, and testimonials."
      />
      <MediaUploader />
      <form className="paper-card mt-5 flex gap-3 p-4">
        <input
          name="q"
          className="admin-field"
          defaultValue={String(query.q ?? "")}
          placeholder="Search filename, alt text, or caption…"
        />
        <Button type="submit" variant="outline">
          Search
        </Button>
      </form>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item) => (
          <article key={item.id} className="paper-card overflow-hidden">
            <div className="bg-beige relative aspect-[4/3]">
              <Image
                src={item.public_url}
                alt={item.alt_text || item.filename}
                fill
                sizes="(max-width:640px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
            <form action={updateMediaAction} className="p-5">
              <input type="hidden" name="id" value={item.id} />
              <p
                className="text-cocoa truncate text-sm font-extrabold"
                title={item.filename}
              >
                {item.filename}
              </p>
              <p className="text-muted mt-1 text-xs">
                {formatBytes(item.size_bytes)} • {item.mime_type}
              </p>
              <label className="mt-4 block">
                <span className="text-cocoa text-xs font-bold">Alt text</span>
                <input
                  name="alt_text"
                  className="admin-field mt-1"
                  defaultValue={item.alt_text}
                  required
                />
              </label>
              <label className="mt-3 block">
                <span className="text-cocoa text-xs font-bold">Caption</span>
                <input
                  name="caption"
                  className="admin-field mt-1"
                  defaultValue={item.caption}
                />
              </label>
              <div className="mt-4 flex items-center justify-between">
                <Button type="submit" size="sm" variant="outline">
                  Save metadata
                </Button>
                <code
                  className="text-muted max-w-[150px] truncate text-[.62rem]"
                  title={item.public_url}
                >
                  {item.public_url}
                </code>
              </div>
            </form>
            {(session.role !== "staff" || item.uploaded_by === session.id) && (
              <div className="border-cocoa/10 border-t px-5 py-3">
                <MediaUploader replaceId={item.id} />
                <p className="text-muted mt-2 text-[.62rem]">
                  Use the same image type to preserve every existing URL
                  reference.
                </p>
              </div>
            )}
            {session.role === "owner" && (
              <form
                action={deleteMediaAction}
                className="border-cocoa/10 border-t p-3"
              >
                <input type="hidden" name="id" value={item.id} />
                <ConfirmButton
                  type="submit"
                  variant="ghost"
                  size="sm"
                  className="text-danger"
                  message="Delete this stored image? Check that products and pages no longer use it first."
                >
                  <Trash2 className="size-4" />
                  Delete image
                </ConfirmButton>
              </form>
            )}
          </article>
        ))}
        {!filtered.length && (
          <p className="border-cocoa/20 text-muted col-span-full rounded-xl border border-dashed p-10 text-center text-sm">
            No uploaded media yet.
          </p>
        )}
      </div>
    </div>
  );
}
