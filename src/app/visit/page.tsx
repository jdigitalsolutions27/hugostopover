import type { Metadata } from "next";
import {
  Clock3,
  ThumbsUp,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { PageHero } from "@/components/page-hero";
import { PublicShell } from "@/components/public-shell";
import { Button } from "@/components/ui/button";
import {
  getBusinessSettings,
  getPageMeta,
  getPageSections,
} from "@/data/repository";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { sectionImageAlt, sectionSetting } from "@/lib/content";
import { safeMapEmbedUrl } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("visit");
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/visit" },
  };
}

export default async function VisitPage() {
  const [settings, sections] = await Promise.all([
    getBusinessSettings(),
    getPageSections("visit"),
  ]);
  const section = (key: string) =>
    sections.find((item) => item.section_key === key);
  const visible = (key: string) =>
    hasSupabaseConfig() ? Boolean(section(key)) : true;
  const hero = section("hero");
  const inquiry = section("inquiry");
  const locationDetails = section("location_details");
  const hoursDetails = section("hours_details");
  const contactDetails = section("contact_details");
  const mapNote = section("map_note");
  const formControls = section("form_controls");
  const mapUrl = safeMapEmbedUrl(settings.map_embed_url);
  const phoneHref = settings.phone.replace(/[^\d+]/g, "");
  return (
    <PublicShell>
      {visible("hero") && (
        <PageHero
          section={hero}
          fallbackEyebrow="Your next stop in Leyte"
          fallbackHeading="Drop by. Take a break. Eat well."
          fallbackBody="Find us near the Sta. Fe–Alangalang boundary. Message ahead if you’re looking for a specific item or placing a pre-order."
          fallbackImageAlt="Filipino favorites served at Hugo’s Stop Over in Leyte"
        />
      )}
      <section className="py-16 sm:py-24">
        <div className="container-shell grid gap-6 lg:grid-cols-3">
          <InfoCard
            icon={<MapPin />}
            title={locationDetails?.heading || "Location"}
          >
            <p>{locationDetails?.body || settings.address}</p>
            <Button asChild variant="outline" size="sm" className="mt-5">
              <a
                href={
                  locationDetails?.primary_cta_url ||
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    settings.latitude !== null && settings.longitude !== null
                      ? `${settings.latitude},${settings.longitude}`
                      : settings.address,
                  )}`
                }
                target="_blank"
                rel="noreferrer"
              >
                <Navigation className="size-4" />
                {locationDetails?.primary_cta_label || "Open in Maps"}
              </a>
            </Button>
          </InfoCard>
          <InfoCard
            icon={<Clock3 />}
            title={hoursDetails?.heading || "Opening hours"}
          >
            <div className="space-y-2">
              {settings.opening_hours.map((item) => (
                <div
                  key={item.days}
                  className="flex justify-between gap-5 text-sm"
                >
                  <span className="text-cocoa font-bold">{item.days}</span>
                  <span>{item.hours}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs">
              {hoursDetails?.body || settings.holiday_schedule}
            </p>
          </InfoCard>
          <InfoCard
            icon={<Phone />}
            title={contactDetails?.heading || "Call or message"}
          >
            <p>{contactDetails?.body || settings.phone}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button asChild size="sm">
                <a href={`tel:${phoneHref}`}>
                  <Phone className="size-4" />
                  {contactDetails?.primary_cta_label || "Call"}
                </a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a
                  href={settings.messenger_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  {contactDetails?.secondary_cta_label || "Messenger"}
                </a>
              </Button>
            </div>
          </InfoCard>
        </div>
      </section>
      <section className="pb-20 sm:pb-28">
        <div className="container-shell border-cocoa/10 overflow-hidden rounded-[2rem] border bg-white shadow-[0_24px_70px_rgba(58,36,24,.1)]">
          {mapUrl && (
            <iframe
              title={sectionImageAlt(
                mapNote,
                `Map showing ${settings.business_name} near Sta. Fe and Alangalang`,
              )}
              src={mapUrl}
              className="h-[460px] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          {visible("map_note") &&
            settings.needs_confirmation.includes("map_location") && (
              <div className="border-cocoa/10 text-muted border-t p-5 text-sm">
                <strong className="text-cocoa">
                  {mapNote?.heading || "Visit note"}:
                </strong>{" "}
                {mapNote?.body ||
                  "The exact pin and route instructions need owner confirmation before launch."}
              </div>
            )}
        </div>
      </section>
      {visible("inquiry") && (
        <section className="bg-beige/35 py-20 sm:py-28">
          <div className="container-shell grid gap-12 lg:grid-cols-[.72fr_1.28fr]">
            <div>
              <p className="eyebrow">{inquiry?.eyebrow || "Send an inquiry"}</p>
              <h2 className="display-title text-cocoa mt-3 text-4xl sm:text-5xl">
                {inquiry?.heading || "What are you craving?"}
              </h2>
              <p className="text-muted mt-5 text-base leading-8">
                {inquiry?.body ||
                  "Ask about product availability, pre-orders, bundles, ingredients, or a planned visit. We’ll keep your contact details private."}
              </p>
              <a
                href={inquiry?.secondary_cta_url || settings.facebook_url}
                target="_blank"
                rel="noreferrer"
                className="text-ube mt-6 inline-flex items-center gap-2 text-sm font-extrabold"
              >
                <ThumbsUp className="size-5" />
                {inquiry?.secondary_cta_label ||
                  "Prefer Facebook? Visit the official page."}
              </a>
            </div>
            <ContactForm
              copy={
                formControls
                  ? {
                      nameLabel: sectionSetting(formControls, "name_label"),
                      phoneLabel: sectionSetting(formControls, "phone_label"),
                      phonePlaceholder: sectionSetting(
                        formControls,
                        "phone_placeholder",
                      ),
                      emailLabel: sectionSetting(formControls, "email_label"),
                      emailHint: sectionSetting(formControls, "email_hint"),
                      subjectLabel: sectionSetting(
                        formControls,
                        "subject_label",
                      ),
                      messageLabel: sectionSetting(
                        formControls,
                        "message_label",
                      ),
                      privacyNote: sectionSetting(formControls, "privacy_note"),
                      submitLabel: sectionSetting(formControls, "submit_label"),
                      sendingLabel: sectionSetting(
                        formControls,
                        "sending_label",
                      ),
                    }
                  : undefined
              }
            />
          </div>
        </section>
      )}
    </PublicShell>
  );
}

function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="paper-card p-6 sm:p-7">
      <span className="bg-gold text-cocoa grid size-12 place-items-center rounded-2xl [&_svg]:size-5">
        {icon}
      </span>
      <h2 className="font-display text-cocoa mt-5 text-2xl font-bold">
        {title}
      </h2>
      <div className="text-muted mt-3 text-sm leading-6">{children}</div>
    </div>
  );
}
