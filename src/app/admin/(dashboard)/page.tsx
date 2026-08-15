import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ImageOff,
  MessageSquareText,
  PackageCheck,
  PackageSearch,
  Sparkles,
  Tags,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { Button } from "@/components/ui/button";
import { getCategories, getInquiries, getProducts } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function AdminOverviewPage() {
  const [products, categories, inquiries, session] = await Promise.all([
    getProducts(true),
    getCategories(true),
    getInquiries(),
    requireAdmin(),
  ]);
  const active = products.filter((p) => !p.deleted_at);
  const missing = active.filter(
    (p) => !p.main_image_url || !p.full_description || p.price === null,
  );
  const unread = inquiries.filter((i) => !i.is_read);
  return (
    <div>
      <AdminPageHeader
        eyebrow="Overview"
        title="Good day—here’s the stop at a glance."
        description="Monitor content quality, availability, and customer inquiries from one clear workspace."
        actions={
          <Button asChild>
            <Link href="/admin/products/new">
              Add product
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat
          icon={<PackageSearch />}
          label="Total products"
          value={active.length}
        />
        <Stat
          icon={<PackageCheck />}
          label="Available"
          value={active.filter((p) => p.availability === "available").length}
        />
        <Stat
          icon={<Sparkles />}
          label="Featured"
          value={active.filter((p) => p.is_featured).length}
        />
        <Stat icon={<Tags />} label="Categories" value={categories.length} />
        <Stat
          icon={<MessageSquareText />}
          label="Unread inquiries"
          value={unread.length}
          urgent={unread.length > 0}
        />
      </div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.15fr_.85fr]">
        <section className="paper-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Content check</p>
              <h2 className="font-display text-cocoa mt-2 text-2xl font-bold">
                Items needing attention
              </h2>
            </div>
            <span className="bg-gold/15 text-ube grid size-11 place-items-center rounded-full">
              <AlertTriangle className="size-5" />
            </span>
          </div>
          {missing.length ? (
            <ul className="divide-cocoa/10 mt-5 divide-y">
              {missing.slice(0, 6).map((product) => (
                <li key={product.id} className="flex items-center gap-4 py-4">
                  <span className="bg-beige/50 text-muted grid size-10 place-items-center rounded-xl">
                    <ImageOff className="size-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-cocoa truncate text-sm font-extrabold">
                      {product.name}
                    </p>
                    <p className="text-muted mt-1 text-xs">
                      {[
                        !product.main_image_url && "photo",
                        !product.full_description && "description",
                        product.price === null && "confirmed price",
                      ]
                        .filter(Boolean)
                        .join(" • ")}{" "}
                      missing
                    </p>
                  </div>
                  <Link
                    href={`/admin/products/${product.id}/edit`}
                    className="text-ube text-xs font-extrabold"
                  >
                    Fix
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="bg-leaf/10 mt-6 rounded-2xl p-6 text-center">
              <CheckCircle2 className="text-leaf mx-auto size-7" />
              <p className="text-leaf mt-3 text-sm font-bold">
                All published products have the essentials.
              </p>
            </div>
          )}
        </section>
        <section className="paper-card p-6">
          <p className="eyebrow">Quick actions</p>
          <h2 className="font-display text-cocoa mt-2 text-2xl font-bold">
            Keep things current
          </h2>
          <div className="mt-5 space-y-3">
            <Quick
              href="/admin/products"
              label="Update price or availability"
            />
            {session.role !== "staff" && (
              <Quick href="/admin/content" label="Edit homepage sections" />
            )}
            <Quick href="/admin/media" label="Upload owner photos" />
            <Quick
              href="/admin/inquiries"
              label={`Review ${unread.length} unread inquiries`}
            />
            {session.role === "owner" && (
              <Quick href="/admin/settings" label="Confirm business details" />
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
function Stat({
  icon,
  label,
  value,
  urgent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  urgent?: boolean;
}) {
  return (
    <div className="paper-card p-5">
      <span
        className={`grid size-10 place-items-center rounded-xl ${urgent ? "bg-danger/10 text-danger" : "bg-gold/15 text-ube"} [&_svg]:size-4`}
      >
        {icon}
      </span>
      <p className="display-title text-cocoa mt-4 text-3xl">{value}</p>
      <p className="text-muted mt-1 text-xs font-bold">{label}</p>
    </div>
  );
}
function Quick({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="border-cocoa/10 text-cocoa hover:border-gold flex items-center justify-between rounded-xl border bg-white px-4 py-3 text-sm font-bold transition"
    >
      <span>{label}</span>
      <ArrowRight className="text-ube size-4" />
    </Link>
  );
}
