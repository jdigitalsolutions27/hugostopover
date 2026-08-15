import Link from "next/link";
import { BookOpen, MapPin, Phone } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import { FacebookIcon } from "@/components/icons/facebook-icon";
import { NAV_ITEMS } from "@/lib/constants";
import { sectionByKey, sectionSetting } from "@/lib/content";
import { safeLinkUrl } from "@/lib/utils";
import type { BusinessSettings, PageSection } from "@/types/domain";

export function SiteFooter({
  settings,
  sections = [],
}: {
  settings: BusinessSettings;
  sections?: PageSection[];
}) {
  const phoneHref = settings.phone.replace(/[^\d+]/g, "");
  const intro = sectionByKey(sections, "footer_intro");
  const verse = sectionByKey(sections, "footer_verse");
  const links = sectionByKey(sections, "footer_links");
  const contact = sectionByKey(sections, "footer_contact");
  const legal = sectionByKey(sections, "footer_legal");
  const editableNav = sections
    .filter((section) => section.section_key.startsWith("nav_"))
    .map((section) => ({
      href: safeLinkUrl(section.primary_cta_url, "/"),
      label: section.heading,
    }))
    .filter((item) => item.href !== "/" || item.label);
  const navItems = editableNav.length ? editableNav : NAV_ITEMS;
  const verseTranslation = sectionSetting(
    verse,
    "translation_label",
    "King James Version (KJV)",
  );
  return (
    <footer className="bg-cocoa text-cream">
      <div className="native-pattern border-cream/10 border-b">
        <div className="container-shell grid gap-11 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.35fr)_minmax(9rem,.55fr)_minmax(16rem,.8fr)] lg:gap-14">
          <div className="min-w-0">
            <BrandLogo
              name={settings.business_name}
              logoUrl={settings.logo_url}
              className="[&_span]:text-cream"
            />
            <p className="text-cream/70 mt-5 max-w-lg text-sm leading-7">
              {intro?.body || settings.tagline}
            </p>
            {verse && (
              <figure className="border-gold/25 relative mt-7 max-w-xl overflow-hidden rounded-3xl border bg-black/10 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,.04)] sm:p-6">
                <span
                  className="text-gold/10 font-display pointer-events-none absolute -top-5 right-4 text-[7rem] leading-none"
                  aria-hidden="true"
                >
                  “
                </span>
                <div className="relative flex items-center gap-3">
                  <span className="border-gold/25 bg-gold/10 text-gold grid size-9 shrink-0 place-items-center rounded-xl border">
                    <BookOpen className="size-4" aria-hidden="true" />
                  </span>
                  <div>
                    {verse.eyebrow && (
                      <p className="text-gold text-[0.62rem] font-extrabold tracking-[0.17em] uppercase">
                        {verse.eyebrow}
                      </p>
                    )}
                    <p className="font-display mt-0.5 text-lg font-bold text-white">
                      {verse.heading}
                    </p>
                  </div>
                </div>
                {verse.body && (
                  <blockquote className="text-cream/85 font-display relative mt-4 text-[0.95rem] leading-7 font-medium italic sm:text-base sm:leading-8">
                    “{verse.body}”
                  </blockquote>
                )}
                {verseTranslation && (
                  <figcaption className="text-cream/45 relative mt-4 flex items-center gap-3 text-[0.62rem] font-bold tracking-[0.1em] uppercase">
                    <span className="bg-gold/35 h-px w-7" aria-hidden="true" />
                    {verseTranslation}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
          <nav aria-label="Footer navigation">
            <h2 className="font-display text-2xl font-bold text-white">
              {links?.heading || "Explore"}
            </h2>
            <div className="bg-gold mt-3 h-0.5 w-8 rounded-full" />
            <ul className="text-cream/70 mt-5 space-y-1 text-sm">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group focus-visible:ring-gold inline-flex min-h-9 items-center rounded-lg py-1 pr-2 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#3A2418] focus-visible:outline-none"
                  >
                    <span
                      className="bg-gold mr-0 h-0.5 w-0 rounded-full transition-all duration-300 ease-out group-hover:mr-2 group-hover:w-4 group-focus-visible:mr-2 group-focus-visible:w-4"
                      aria-hidden="true"
                    />
                    <span className="transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-focus-visible:translate-x-0.5">
                      {item.label}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="font-display text-2xl font-bold text-white">
              {contact?.heading || "Find us"}
            </h2>
            <div className="bg-gold mt-3 h-0.5 w-8 rounded-full" />
            <ul className="text-cream/70 mt-5 space-y-2 text-sm">
              <li className="flex gap-3 rounded-xl py-2">
                <span className="border-gold/20 bg-gold/8 text-gold grid size-9 shrink-0 place-items-center rounded-xl border">
                  <MapPin className="size-4" aria-hidden="true" />
                </span>
                <span className="pt-1.5 leading-6">{settings.address}</span>
              </li>
              <li>
                <a
                  className="group hover:bg-cream/5 focus-visible:ring-gold -mx-2 flex gap-3 rounded-xl px-2 py-2 transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
                  href={`tel:${phoneHref}`}
                >
                  <span className="border-gold/20 bg-gold/8 text-gold group-hover:bg-gold group-hover:text-cocoa grid size-9 shrink-0 place-items-center rounded-xl border transition group-hover:scale-105">
                    <Phone className="size-4" aria-hidden="true" />
                  </span>
                  <span className="pt-2">{settings.phone}</span>
                </a>
              </li>
              <li>
                <a
                  className="group hover:bg-cream/5 focus-visible:ring-gold -mx-2 flex gap-3 rounded-xl px-2 py-2 transition hover:text-white focus-visible:ring-2 focus-visible:outline-none"
                  href={contact?.primary_cta_url || settings.facebook_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span className="border-gold/20 bg-gold/8 text-gold grid size-9 shrink-0 place-items-center rounded-xl border transition group-hover:scale-105 group-hover:border-[#1877F2] group-hover:bg-[#1877F2] group-hover:text-white">
                    <FacebookIcon className="size-4" />
                  </span>
                  <span className="pt-2">
                    {contact?.primary_cta_label || "Follow on Facebook"}
                  </span>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="container-shell text-cream/45 flex flex-col gap-3 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {settings.business_name}.{" "}
          {legal?.body || "All rights reserved."}
        </p>
        <p>{settings.address}</p>
      </div>
    </footer>
  );
}
