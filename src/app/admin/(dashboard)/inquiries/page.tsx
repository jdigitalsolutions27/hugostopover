import Link from "next/link";
import { Download, Mail, Phone, Trash2 } from "lucide-react";
import { deleteInquiryAction, updateInquiryAction } from "@/actions/admin";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getInquiries } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function InquiriesPage() {
  const [inquiries, session] = await Promise.all([
    getInquiries(),
    requireAdmin(),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow="Customer inbox"
        title="Inquiries"
        description="Read private customer submissions, add internal notes, update status, archive records, or export them for authorized business use."
        actions={
          session.role !== "staff" ? (
            <Button asChild variant="outline">
              <Link href="/api/admin/inquiries/export">
                <Download className="size-4" />
                Export CSV
              </Link>
            </Button>
          ) : undefined
        }
      />
      <div className="space-y-4">
        {inquiries.map((item) => (
          <article
            key={item.id}
            className={`paper-card p-5 sm:p-6 ${!item.is_read ? "!border-l-ube border-l-4" : ""}`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-display text-cocoa text-xl font-bold">
                    {item.subject}
                  </h2>
                  {!item.is_read && (
                    <Badge className="bg-ube text-white">Unread</Badge>
                  )}
                  <Badge className="capitalize">
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>
                <p className="text-cocoa mt-2 text-sm font-bold">{item.name}</p>
                <div className="text-muted mt-2 flex flex-wrap gap-4 text-xs">
                  {item.email && (
                    <a
                      href={`mailto:${item.email}`}
                      className="flex items-center gap-1.5"
                    >
                      <Mail className="size-3.5" />
                      {item.email}
                    </a>
                  )}
                  {item.phone && (
                    <a
                      href={`tel:${item.phone}`}
                      className="flex items-center gap-1.5"
                    >
                      <Phone className="size-3.5" />
                      {item.phone}
                    </a>
                  )}
                  <time dateTime={item.created_at}>
                    {new Intl.DateTimeFormat("en-PH", {
                      dateStyle: "medium",
                      timeStyle: "short",
                      timeZone: "Asia/Manila",
                    }).format(new Date(item.created_at))}
                  </time>
                </div>
              </div>
              {session.role === "owner" && (
                <form action={deleteInquiryAction}>
                  <input type="hidden" name="id" value={item.id} />
                  <ConfirmButton
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    message="Delete this inquiry from the active inbox? Personal information will be soft-deleted."
                  >
                    <Trash2 className="size-4" />
                  </ConfirmButton>
                </form>
              )}
            </div>
            <p className="bg-beige/25 text-cocoa mt-5 rounded-xl p-4 text-sm leading-7 whitespace-pre-line">
              {item.message}
            </p>
            <form
              action={updateInquiryAction}
              className="mt-5 grid gap-4 sm:grid-cols-[180px_1fr_auto]"
            >
              <input type="hidden" name="id" value={item.id} />
              <label>
                <span className="text-muted mb-1 block text-xs font-bold">
                  Status
                </span>
                <select
                  name="status"
                  defaultValue={item.status}
                  className="admin-field"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </label>
              <label>
                <span className="text-muted mb-1 block text-xs font-bold">
                  Private notes
                </span>
                <input
                  name="private_notes"
                  className="admin-field"
                  defaultValue={item.private_notes}
                  placeholder="Only administrators can see this."
                />
              </label>
              <div className="flex items-end gap-2">
                <label className="text-cocoa flex min-h-11 items-center gap-2 text-xs font-bold">
                  <input
                    type="checkbox"
                    name="is_read"
                    defaultChecked={item.is_read}
                    className="accent-[#72457A]"
                  />
                  Read
                </label>
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </form>
          </article>
        ))}
        {!inquiries.length && (
          <div className="paper-card p-12 text-center">
            <h2 className="font-display text-cocoa text-2xl font-bold">
              Inbox clear.
            </h2>
            <p className="text-muted mt-2 text-sm">
              New public contact submissions will appear here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
