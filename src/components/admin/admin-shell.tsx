import Link from "next/link";
import {
  Archive,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  PackageSearch,
  Settings,
  Tags,
  UsersRound,
} from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { logoutAction } from "@/actions/auth";
import type { AdminSession } from "@/lib/auth";
import type { AdminRole } from "@/types/domain";

const links = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
    roles: ["owner", "editor", "staff"],
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: PackageSearch,
    roles: ["owner", "editor", "staff"],
  },
  {
    href: "/admin/categories",
    label: "Categories",
    icon: Tags,
    roles: ["owner", "editor"],
  },
  {
    href: "/admin/content",
    label: "Pages & homepage",
    icon: FileText,
    roles: ["owner", "editor"],
  },
  {
    href: "/admin/settings",
    label: "Business settings",
    icon: Settings,
    roles: ["owner"],
  },
  {
    href: "/admin/inquiries",
    label: "Inquiries",
    icon: MessageSquareText,
    roles: ["owner", "editor", "staff"],
  },
  {
    href: "/admin/testimonials",
    label: "Testimonials",
    icon: Archive,
    roles: ["owner", "editor"],
  },
  {
    href: "/admin/media",
    label: "Media library",
    icon: ImageIcon,
    roles: ["owner", "editor", "staff"],
  },
  {
    href: "/admin/users",
    label: "Team access",
    icon: UsersRound,
    roles: ["owner"],
  },
] as const;

export function adminNavigationForRole(role: AdminRole) {
  return links.filter((item) =>
    (item.roles as readonly AdminRole[]).includes(role),
  );
}

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  const visibleLinks = adminNavigationForRole(session.role);
  return (
    <div className="min-h-screen bg-[#f7f2e9]">
      <aside className="border-cocoa/10 bg-cocoa text-cream fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex">
        <div className="border-cream/10 border-b p-6">
          <Link href="/admin">
            <BrandLogo className="[&_span]:text-cream" />
          </Link>
        </div>
        <nav
          className="flex-1 space-y-1 overflow-y-auto p-3"
          aria-label="Admin dashboard"
        >
          {visibleLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="text-cream/65 hover:bg-cream/10 hover:text-cream flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition"
            >
              <Icon className="text-gold size-[1.1rem]" />
              {label}
              <ChevronRight className="ml-auto size-3.5 opacity-35" />
            </Link>
          ))}
        </nav>
        <div className="border-cream/10 border-t p-4">
          <p className="text-cream px-2 text-xs font-bold">
            {session.displayName}
          </p>
          <p className="text-cream/40 mt-1 px-2 text-[.65rem] tracking-wider uppercase">
            {session.role}
          </p>
          <form action={logoutAction} className="mt-3">
            <button className="text-cream/60 hover:bg-cream/10 hover:text-cream flex w-full items-center gap-2 rounded-xl px-2 py-2 text-xs font-bold">
              <LogOut className="size-4" />
              Log out
            </button>
          </form>
        </div>
      </aside>
      <div className="lg:pl-64">
        <header className="border-cocoa/10 sticky top-0 z-30 border-b bg-[#f7f2e9]/92 backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between px-4 sm:px-7">
            <Link href="/admin" className="lg:hidden">
              <BrandLogo compact />
            </Link>
            <div className="hidden lg:block">
              <p className="text-muted text-xs font-extrabold tracking-wider uppercase">
                Hugo’s content studio
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                target="_blank"
                className="border-cocoa/15 text-cocoa rounded-full border bg-white px-4 py-2 text-xs font-extrabold"
              >
                View website
              </Link>
              <form action={logoutAction} className="lg:hidden">
                <button
                  className="border-cocoa/15 grid size-10 place-items-center rounded-full border bg-white"
                  aria-label="Log out"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>
          <nav
            className="border-cocoa/8 flex gap-1 overflow-x-auto border-t px-3 py-2 lg:hidden"
            aria-label="Mobile admin navigation"
          >
            {visibleLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="text-cocoa flex shrink-0 items-center gap-2 rounded-full bg-white px-3 py-2 text-[.68rem] font-bold"
              >
                <Icon className="text-ube size-3.5" />
                {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="p-4 sm:p-7 lg:p-9">{children}</main>
      </div>
    </div>
  );
}
