"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Archive,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  MessageSquareText,
  PackageSearch,
  Settings,
  Tags,
  UsersRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

export function isAdminRouteActive(pathname: string, href: string) {
  return href === "/admin"
    ? pathname === href
    : pathname === href || pathname.startsWith(`${href}/`);
}

function currentAdminPage(pathname: string, role: AdminRole) {
  return adminNavigationForRole(role)
    .filter((item) => isAdminRouteActive(pathname, item.href))
    .toSorted((a, b) => b.href.length - a.href.length)[0];
}

export function AdminPageIndicator({
  role,
  className,
}: {
  role: AdminRole;
  className?: string;
}) {
  const pathname = usePathname();
  const current = currentAdminPage(pathname, role);

  return (
    <div className={cn("min-w-0", className)} aria-live="polite">
      <p className="text-muted text-[0.6rem] font-extrabold tracking-[0.14em] uppercase">
        Current page
      </p>
      <p className="text-cocoa truncate text-sm font-extrabold">
        {current?.label ?? "Admin workspace"}
      </p>
    </div>
  );
}

export function AdminNavigation({
  role,
  variant,
}: {
  role: AdminRole;
  variant: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  const visibleLinks = adminNavigationForRole(role);

  if (variant === "mobile") {
    return (
      <nav
        className="border-cocoa/8 flex gap-1 overflow-x-auto border-t px-3 py-2"
        aria-label="Mobile admin navigation"
      >
        {visibleLinks.map(({ href, label, icon: Icon }) => {
          const active = isAdminRouteActive(pathname, href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "text-cocoa flex shrink-0 items-center gap-2 rounded-full border border-transparent bg-white px-3 py-2 text-[0.68rem] font-bold transition",
                active &&
                  "border-gold/50 bg-cocoa text-cream shadow-[0_6px_18px_rgba(58,36,24,.18)]",
              )}
            >
              <Icon
                className={cn("text-ube size-3.5", active && "text-gold")}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      className="flex-1 space-y-1 overflow-y-auto p-3"
      aria-label="Admin dashboard"
    >
      {visibleLinks.map(({ href, label, icon: Icon }) => {
        const active = isAdminRouteActive(pathname, href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "text-cream/65 hover:bg-cream/10 hover:text-cream relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
              active &&
                "bg-cream text-cocoa hover:bg-cream hover:text-cocoa shadow-[0_8px_24px_rgba(0,0,0,.16)]",
            )}
          >
            <span
              className={cn(
                "bg-gold absolute inset-y-2 left-0 w-0 rounded-r-full transition-all",
                active && "w-1",
              )}
              aria-hidden="true"
            />
            <Icon
              className={cn("text-gold size-[1.1rem]", active && "text-ube")}
            />
            {label}
            <ChevronRight
              className={cn(
                "ml-auto size-3.5 opacity-35",
                active && "text-ube opacity-80",
              )}
            />
          </Link>
        );
      })}
    </nav>
  );
}
