import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  Coffee,
  MapPin,
  MessageCircle,
  Navigation,
  PackageOpen,
  Phone,
  Soup,
} from "lucide-react";
import { PageHero } from "@/components/page-hero";
import { ProductCard } from "@/components/product-card";
import { PublicShell } from "@/components/public-shell";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import {
  getBusinessSettings,
  getPageMeta,
  getPageSections,
  getProducts,
} from "@/data/repository";
import { sectionByKey, sectionImageAlt } from "@/lib/content";
import { DEFAULT_STORY_IMAGE } from "@/lib/constants";
import { buildLocalBusinessJsonLd, serializeJsonLd } from "@/lib/seo";
import { safeMediaUrl } from "@/lib/utils";
import type { PageSection } from "@/types/domain";

const PAGE_PATH = "/food-stop-over-leyte";

export async function generateMetadata(): Promise<Metadata> {
  const [meta, settings] = await Promise.all([
    getPageMeta("food-stop-over-leyte"),
    getBusinessSettings(),
  ]);
  const image =
    safeMediaUrl(settings.default_seo_image) ||
    "/images/filipino-food-hero.png";
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: PAGE_PATH },
    openGraph: {
      type: "website",
      locale: "en_PH",
      siteName: settings.business_name,
      url: PAGE_PATH,
      title: meta.title,
      description: meta.description,
      images: [
        {
          url: image,
          width: 1536,
          height: 1024,
          alt: `Filipino food at ${settings.business_name} in Leyte`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [image],
    },
  };
}

export default async function FoodStopOverLeytePage() {
  const [settings, sections, products, meta] = await Promise.all([
    getBusinessSettings(),
    getPageSections("food-stop-over-leyte"),
    getProducts(),
    getPageMeta("food-stop-over-leyte"),
  ]);
  const section = (key: string) => sectionByKey(sections, key);
  const hero = section("hero");
  const intro = section("stopover_intro");
  const specialties = [
    section("specialty_meals"),
    section("specialty_pastries"),
    section("specialty_refreshments"),
  ].filter((item): item is PageSection => Boolean(item));
  const faqSections = sections.filter((item) =>
    item.section_key.startsWith("faq_"),
  );
  const route = section("plan_your_stop");
  const finalCta = section("final_cta");
  const featuredProducts = products
    .filter((product) => product.is_best_seller || product.is_featured)
    .slice(0, 4);
  const phoneHref = settings.phone.replace(/[^\d+]/g, "");
  const mapsUrl =
    settings.latitude !== null && settings.longitude !== null
      ? `https://www.google.com/maps/search/?api=1&query=${settings.latitude},${settings.longitude}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address)}`;
  const localBusiness = buildLocalBusinessJsonLd(settings, meta.description);
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqSections.map((item) => ({
      "@type": "Question",
      name: item.heading,
      acceptedAnswer: { "@type": "Answer", text: item.body },
    })),
  };
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: localBusiness.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Food Stop Over in Leyte",
        item: `${localBusiness.url}${PAGE_PATH}`,
      },
    ],
  };

  return (
    <PublicShell>
      {[localBusiness, faqJsonLd, breadcrumbJsonLd].map((jsonLd, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
        />
      ))}

      <PageHero
        section={hero}
        fallbackEyebrow="Meals · Merienda · Pasalubong in Leyte"
        fallbackHeading="A Filipino food stop over in Leyte worth the pause."
        fallbackBody="Make Hugo’s Stop Over part of your drive through Alangalang and Sta. Fe for comforting meals, merienda, cold desserts, refreshments, and take-home favorites."
        fallbackImageAlt="Filipino meals, buko pie, halo-halo, and kakanin at Hugo’s Stop Over in Leyte"
      />

      <section className="py-18 sm:py-24">
        <div className="container-shell grid items-center gap-10 lg:grid-cols-[.92fr_1.08fr] lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem] shadow-[0_28px_80px_rgba(58,36,24,.16)]">
            <Image
              src={intro?.image_url || DEFAULT_STORY_IMAGE}
              alt={sectionImageAlt(
                intro,
                "A Filipino food spread at Hugo’s Stop Over in Leyte",
              )}
              fill
              sizes="(min-width: 1024px) 44vw, 100vw"
              className="object-cover"
            />
          </div>
          <div>
            <SectionHeading
              eyebrow={intro?.eyebrow || "A convenient Leyte food stop"}
              title={
                intro?.heading ||
                "Good food for the journey—and something to bring home"
              }
              body={
                intro?.body ||
                "Hugo’s Stop Over is located in Alangalang near the Sta. Fe boundary, making it a practical stop for travelers, families, and anyone craving Filipino comfort food or pasalubong."
              }
            />
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href={intro?.primary_cta_url || "/menu"}>
                  {intro?.primary_cta_label || "Browse the menu"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a
                  href={intro?.secondary_cta_url || settings.messenger_url}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  {intro?.secondary_cta_label || "Ask what’s available"}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="native-pattern bg-beige/35 py-18 sm:py-24">
        <div className="container-shell">
          <SectionHeading
            eyebrow="What to enjoy at Hugo’s"
            title="A stop for every kind of craving"
            body="Choose a hearty meal, a refreshing merienda, or a local favorite to share when you arrive home."
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {(specialties.length ? specialties : fallbackSpecialties).map(
              (item, index) => {
                const Icon = [Soup, PackageOpen, Coffee][index] || Soup;
                return (
                  <article
                    key={item.section_key}
                    className="paper-card p-7 sm:p-8"
                  >
                    <span className="bg-gold/20 text-cocoa grid size-13 place-items-center rounded-2xl">
                      <Icon className="size-6" aria-hidden="true" />
                    </span>
                    <h2 className="font-display text-cocoa mt-6 text-2xl font-bold">
                      {item.heading}
                    </h2>
                    <p className="text-muted mt-3 text-sm leading-7">
                      {item.body}
                    </p>
                    {item.primary_cta_label && (
                      <Link
                        href={item.primary_cta_url || "/menu"}
                        className="text-ube mt-5 inline-flex items-center gap-2 text-sm font-extrabold"
                      >
                        {item.primary_cta_label}
                        <ArrowRight className="size-4" />
                      </Link>
                    )}
                  </article>
                );
              },
            )}
          </div>
        </div>
      </section>

      {featuredProducts.length > 0 && (
        <section className="py-18 sm:py-24">
          <div className="container-shell">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <SectionHeading
                eyebrow="Popular choices"
                title="Start with Hugo’s featured favorites"
                body="See current prices and availability, then message ahead if you are traveling for a particular item."
              />
              <Button asChild variant="outline">
                <Link href="/menu">
                  View the full menu <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-cocoa text-cream py-18 sm:py-24">
        <div className="container-shell grid gap-10 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div>
            <p className="eyebrow !text-gold">
              {route?.eyebrow || "Plan your stop"}
            </p>
            <h2 className="display-title mt-3 max-w-3xl text-4xl sm:text-6xl">
              {route?.heading || "Find Hugo’s along your Leyte journey."}
            </h2>
            <p className="text-cream/70 mt-5 max-w-2xl text-base leading-8">
              {route?.body ||
                "We’re in Alangalang near the Sta. Fe boundary. Use the exact map pin for directions and message before traveling if you need a specific product."}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="gold" size="lg">
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  <Navigation className="size-4" />
                  {route?.primary_cta_label || "Open exact map pin"}
                </a>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-cream/25 bg-cream/5 text-cream hover:bg-cream hover:text-cocoa"
              >
                <Link href={route?.secondary_cta_url || "/visit"}>
                  {route?.secondary_cta_label || "Visit details"}
                </Link>
              </Button>
            </div>
          </div>
          <div className="border-cream/12 bg-cream/7 rounded-[2rem] border p-6 sm:p-8">
            <ContactRow
              icon={<MapPin />}
              label="Location"
              value={settings.address}
            />
            <ContactRow
              icon={<Clock3 />}
              label={settings.opening_hours[0]?.days || "Opening days"}
              value={settings.opening_hours[0]?.hours || "Message to confirm"}
            />
            <ContactRow
              icon={<Phone />}
              label="Call Hugo’s"
              value={settings.phone}
              href={`tel:${phoneHref}`}
            />
          </div>
        </div>
      </section>

      {faqSections.length > 0 && (
        <section className="py-18 sm:py-24">
          <div className="container-shell grid gap-10 lg:grid-cols-[.65fr_1.35fr]">
            <SectionHeading
              eyebrow="Before you stop"
              title="Helpful local information"
              body="Quick answers for travelers planning a visit to Hugo’s Stop Over."
            />
            <div className="space-y-4">
              {faqSections.map((item) => (
                <details key={item.id} className="paper-card group p-6">
                  <summary className="text-cocoa flex cursor-pointer list-none items-center justify-between gap-5 font-extrabold [&::-webkit-details-marker]:hidden">
                    {item.heading}
                    <span className="bg-gold/20 grid size-8 shrink-0 place-items-center rounded-full text-lg transition group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="text-muted mt-4 pr-10 text-sm leading-7">
                    {item.body}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-ube py-18 text-center text-white sm:py-24">
        <div className="container-shell max-w-4xl">
          <p className="text-gold text-xs font-extrabold tracking-[.18em] uppercase">
            {finalCta?.eyebrow || "See you at the stop"}
          </p>
          <h2 className="display-title mt-4 text-4xl sm:text-6xl">
            {finalCta?.heading || "Make Hugo’s part of your next Leyte trip."}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl leading-8 text-white/75">
            {finalCta?.body ||
              "Browse the menu, check today’s availability, and use the exact map pin when you’re ready to visit."}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg">
              <Link href={finalCta?.primary_cta_url || "/menu"}>
                {finalCta?.primary_cta_label || "Explore the menu"}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="hover:text-ube border-white/25 bg-white/5 text-white hover:bg-white"
            >
              <a
                href={finalCta?.secondary_cta_url || settings.messenger_url}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle className="size-4" />
                {finalCta?.secondary_cta_label || "Message Hugo’s"}
              </a>
            </Button>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}

const fallbackSpecialties: PageSection[] = [
  {
    id: "fallback-meals",
    page_slug: "food-stop-over-leyte",
    section_key: "specialty_meals",
    eyebrow: "",
    heading: "Filipino meals and merienda",
    body: "Enjoy La Paz Batchoy, pansit palabok, traditional kakanin, and other comforting favorites.",
    image_url: null,
    primary_cta_label: "See meals",
    primary_cta_url: "/menu",
    secondary_cta_label: "",
    secondary_cta_url: "",
    settings: {},
    is_visible: true,
    display_order: 3,
    status: "published",
  },
  {
    id: "fallback-pastries",
    page_slug: "food-stop-over-leyte",
    section_key: "specialty_pastries",
    eyebrow: "",
    heading: "Pies and pasalubong",
    body: "Bring home buko pie, kakanin boxes, local snacks, tablea, and other shareable treats.",
    image_url: null,
    primary_cta_label: "See pasalubong",
    primary_cta_url: "/menu?category=pasalubong",
    secondary_cta_label: "",
    secondary_cta_url: "",
    settings: {},
    is_visible: true,
    display_order: 4,
    status: "published",
  },
  {
    id: "fallback-refreshments",
    page_slug: "food-stop-over-leyte",
    section_key: "specialty_refreshments",
    eyebrow: "",
    heading: "Desserts and refreshments",
    body: "Cool down with halo-halo, buko shakes, fresh juices, lemonade, or brewed coffee.",
    image_url: null,
    primary_cta_label: "See refreshments",
    primary_cta_url: "/menu?category=shakes-refreshments",
    secondary_cta_label: "",
    secondary_cta_url: "",
    settings: {},
    is_visible: true,
    display_order: 5,
    status: "published",
  },
];

function ContactRow({
  icon,
  label,
  value,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  href?: string;
}) {
  const content = (
    <>
      <span className="border-gold/25 bg-gold/10 text-gold grid size-11 shrink-0 place-items-center rounded-2xl border [&_svg]:size-5">
        {icon}
      </span>
      <span>
        <span className="text-gold block text-[.65rem] font-extrabold tracking-wider uppercase">
          {label}
        </span>
        <span className="text-cream/80 mt-1 block text-sm leading-6">
          {value}
        </span>
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      className="focus-visible:ring-gold flex gap-4 rounded-2xl py-4 transition hover:bg-white/5 focus-visible:ring-2 focus-visible:outline-none"
    >
      {content}
    </a>
  ) : (
    <div className="flex gap-4 py-4">{content}</div>
  );
}
