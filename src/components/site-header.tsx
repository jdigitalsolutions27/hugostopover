"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, X } from "lucide-react";
import { useRef } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { Button } from "@/components/ui/button";
import { NAV_ITEMS } from "@/lib/constants";
import { sectionByKey } from "@/lib/content";
import { cn, safeLinkUrl, safeMediaUrl } from "@/lib/utils";
import type { BusinessSettings, PageSection } from "@/types/domain";

export function SiteHeader({
  settings,
  sections = [],
}: {
  settings: BusinessSettings;
  sections?: PageSection[];
}) {
  const mobileMenuRef = useRef<HTMLDetailsElement>(null);
  const pathname = usePathname();
  const header = sectionByKey(sections, "header_actions");
  const editableNav = sections
    .filter((section) => section.section_key.startsWith("nav_"))
    .map((section) => ({
      href: safeLinkUrl(section.primary_cta_url, "/"),
      label: section.heading,
    }))
    .filter((item) => item.label && item.href);
  const navItems = editableNav.length ? editableNav : NAV_ITEMS;
  const facebookUrl = safeLinkUrl(
    header?.secondary_cta_url || settings.facebook_url,
    "/visit",
  );
  const messengerUrl = safeLinkUrl(
    header?.primary_cta_url || settings.messenger_url,
    "/visit",
  );
  const facebookLabel = header?.secondary_cta_label || "Facebook";
  const messageLabel = header?.primary_cta_label || "Message us";
  const logoUrl = safeMediaUrl(settings.logo_url);

  const closeMobileMenu = () => {
    mobileMenuRef.current?.removeAttribute("open");
  };

  return (
    <header className="border-cocoa/10 bg-cream/92 sticky top-0 z-50 border-b backdrop-blur-xl">
      {settings.show_announcement && settings.announcement && (
        <div className="bg-cocoa text-cream px-4 py-2 text-center text-xs font-bold tracking-wide">
          {settings.announcement}
        </div>
      )}
      <div className="container-shell flex h-[4.6rem] items-center justify-between gap-6">
        <Link href="/" aria-label={`${settings.business_name} home`}>
          <BrandLogo name={settings.business_name} logoUrl={logoUrl} />
        </Link>
        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label={header?.body || "Primary navigation"}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-cocoa/70 hover:text-cocoa rounded-full px-4 py-2 text-sm font-bold transition hover:bg-white",
                pathname === item.href && "text-cocoa bg-white shadow-sm",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 lg:flex">
          <Button asChild variant="ghost" size="sm">
            <a href={facebookUrl} target="_blank" rel="noreferrer">
              <FacebookIcon className="size-4" /> {facebookLabel}
            </a>
          </Button>
          <Button asChild variant="primary" size="sm">
            <a href={messengerUrl} target="_blank" rel="noreferrer">
              <MessageCircle className="size-4" /> {messageLabel}
            </a>
          </Button>
        </div>
        <details
          ref={mobileMenuRef}
          className="group shrink-0 lg:hidden"
          onKeyDown={(event) => {
            if (event.key === "Escape") closeMobileMenu();
          }}
        >
          <summary
            role="button"
            className="border-cocoa/15 focus-visible:ring-ube grid size-11 cursor-pointer list-none place-items-center rounded-full border bg-white select-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden"
            aria-label="Open menu"
            aria-controls="mobile-menu"
          >
            <Menu className="size-5 group-open:hidden" aria-hidden="true" />
            <X className="hidden size-5 group-open:block" aria-hidden="true" />
          </summary>
          <nav
            id="mobile-menu"
            className="border-cocoa/10 bg-cream absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t px-4 pt-3 pb-6 shadow-[0_24px_45px_rgba(58,36,24,.18)] lg:hidden"
            aria-label="Mobile navigation"
          >
            <div className="container-shell flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={cn(
                    "text-cocoa/75 rounded-xl px-4 py-3 font-bold",
                    pathname === item.href && "text-cocoa bg-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Button asChild variant="outline" className="mt-3">
                <a href={facebookUrl} target="_blank" rel="noreferrer">
                  <FacebookIcon className="size-4" /> {facebookLabel}
                </a>
              </Button>
              <Button asChild>
                <a href={messengerUrl} target="_blank" rel="noreferrer">
                  <MessageCircle className="size-4" /> {messageLabel}
                </a>
              </Button>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}
