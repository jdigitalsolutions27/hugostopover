import Link from "next/link";
import { LogOut } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { logoutAction } from "@/actions/auth";
import type { AdminSession } from "@/lib/auth";
import {
  AdminNavigation,
  AdminPageIndicator,
} from "@/components/admin/admin-navigation";

export { adminNavigationForRole } from "@/components/admin/admin-navigation";

export function AdminShell({
  session,
  children,
}: {
  session: AdminSession;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f2e9]">
      <aside className="border-cocoa/10 bg-cocoa text-cream fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r lg:flex">
        <div className="border-cream/10 border-b p-6">
          <Link href="/admin">
            <BrandLogo className="[&_span]:text-cream" />
          </Link>
        </div>
        <AdminNavigation role={session.role} variant="desktop" />
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
            <AdminPageIndicator
              role={session.role}
              className="hidden lg:block"
            />
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
          <div className="border-cocoa/8 border-t px-4 py-2 lg:hidden">
            <AdminPageIndicator role={session.role} />
          </div>
          <div className="lg:hidden">
            <AdminNavigation role={session.role} variant="mobile" />
          </div>
        </header>
        <main className="p-4 sm:p-7 lg:p-9">{children}</main>
      </div>
    </div>
  );
}
