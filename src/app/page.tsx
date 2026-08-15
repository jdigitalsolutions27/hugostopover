import Image from "next/image";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  ThumbsUp,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UtensilsCrossed,
} from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { ProductCard } from "@/components/product-card";
import { MotionReveal } from "@/components/motion-reveal";
import { SectionHeading } from "@/components/section-heading";
import { Button } from "@/components/ui/button";
import {
  CATEGORY_ART,
  DEFAULT_HERO_IMAGE,
  DEFAULT_STORY_IMAGE,
} from "@/lib/constants";
import { sectionImageAlt, sectionSetting } from "@/lib/content";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { safeMapEmbedUrl } from "@/lib/utils";
import {
  getBusinessSettings,
  getCategories,
  getPageSections,
  getPageMeta,
  getProducts,
  getPromotions,
  getTestimonials,
} from "@/data/repository";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("home");
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: "/" },
  };
}

export default async function HomePage() {
  const [products, categories, sections, settings, testimonials, promotions] =
    await Promise.all([
      getProducts(),
      getCategories(),
      getPageSections("home"),
      getBusinessSettings(),
      getTestimonials(),
      getPromotions(),
    ]);
  const hero = sections.find((section) => section.section_key === "hero");
  const about = sections.find(
    (section) => section.section_key === "about_preview",
  );
  const bestSellers = products
    .filter((product) => product.is_best_seller)
    .slice(0, 4);
  const featured =
    products.find((product) => product.is_featured) ?? products[0];
  const promotion = promotions[0];
  const sectionConfig = (key: string) =>
    sections.find((item) => item.section_key === key);
  const isVisible = (key: string) =>
    hasSupabaseConfig() ? Boolean(sectionConfig(key)) : true;
  const displayOrder = (key: string, fallback: number) =>
    sectionConfig(key)?.display_order ?? fallback;
  const mapUrl = safeMapEmbedUrl(settings.map_embed_url);
  const phoneHref = settings.phone.replace(/[^\d+]/g, "");
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings.business_name,
    image: settings.default_seo_image,
    telephone: settings.phone,
    servesCuisine: "Filipino",
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressRegion: "Leyte",
      addressCountry: "PH",
    },
    url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    sameAs: [settings.facebook_url],
    openingHours: settings.opening_hours.map(
      (item) => `${item.days} ${item.hours}`,
    ),
    priceRange: "₱",
  };

  return (
    <PublicShell>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {isVisible("hero") && (
        <section className="bg-cocoa relative min-h-[700px] overflow-hidden lg:min-h-[740px]">
          <Image
            src={hero?.image_url || DEFAULT_HERO_IMAGE}
            alt={sectionImageAlt(
              hero,
              "La Paz Batchoy, buko pie, halo-halo, and Filipino kakanin on a warm table",
            )}
            fill
            preload
            sizes="100vw"
            className="object-cover object-[62%_center] opacity-80 lg:object-center"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(40,24,15,.97)_0%,rgba(49,29,18,.85)_38%,rgba(49,29,18,.2)_72%,rgba(49,29,18,.05)_100%)]" />
          <div className="from-cocoa/70 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
          <div className="container-shell relative flex min-h-[700px] items-center py-14 sm:py-20 lg:min-h-[740px]">
            <div className="text-cream max-w-2xl">
              <p className="border-cream/20 bg-cream/10 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-extrabold tracking-[.16em] uppercase backdrop-blur">
                <Sparkles className="text-gold size-4" />
                {hero?.eyebrow || "Merienda • Meals • Pasalubong"}
              </p>
              <h1 className="display-title text-cream mt-7 text-[clamp(2.8rem,7vw,6.7rem)] leading-[.91]">
                {hero?.heading || settings.tagline}
              </h1>
              <p className="text-cream/78 mt-7 max-w-xl text-base leading-7 sm:text-lg sm:leading-8">
                {hero?.body}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="gold" size="lg">
                  <Link href={hero?.primary_cta_url || "/menu"}>
                    {hero?.primary_cta_label || "Explore Our Menu"}
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-cream/25 bg-cream/10 text-cream hover:bg-cream hover:text-cocoa"
                >
                  <a
                    href={hero?.secondary_cta_url || settings.messenger_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <MessageCircle className="size-5" />
                    {hero?.secondary_cta_label || "Message Us on Facebook"}
                  </a>
                </Button>
              </div>
              <div className="mt-12 grid max-w-2xl gap-3 sm:grid-cols-3">
                <QuickInfo
                  icon={<MapPin />}
                  label={sectionSetting(hero, "location_label", "Find us")}
                  value={settings.address.replace(", Philippines", "")}
                />
                <QuickInfo
                  icon={<Clock3 />}
                  label={
                    settings.opening_hours[0]?.days ||
                    sectionSetting(hero, "hours_label", "Opening hours")
                  }
                  value={
                    settings.opening_hours[0]?.hours || "Message to confirm"
                  }
                />
                <QuickInfo
                  icon={<Phone />}
                  label={sectionSetting(hero, "phone_label", "Call us")}
                  value={settings.phone}
                  href={`tel:${phoneHref}`}
                />
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="flex flex-col">
        {isVisible("best_sellers") && (
          <section
            className="py-20 sm:py-28"
            style={{ order: displayOrder("best_sellers", 2) }}
          >
            <div className="container-shell">
              <MotionReveal>
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <SectionHeading
                    eyebrow={
                      sectionConfig("best_sellers")?.eyebrow || "The favorites"
                    }
                    title={
                      sectionConfig("best_sellers")?.heading ||
                      "Come hungry. Leave happy."
                    }
                    body={
                      sectionConfig("best_sellers")?.body ||
                      "Start with the dishes and merienda favorites customers ask about most."
                    }
                  />
                  <Button asChild variant="outline">
                    <Link
                      href={
                        sectionConfig("best_sellers")?.primary_cta_url ||
                        "/menu"
                      }
                    >
                      {sectionConfig("best_sellers")?.primary_cta_label ||
                        "See the full menu"}
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </MotionReveal>
              <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {bestSellers.map((product, index) => (
                  <MotionReveal key={product.id} delay={index * 0.06}>
                    <ProductCard product={product} />
                  </MotionReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {isVisible("why_hugos") && (
          <section
            className="home-section-deferred bg-cocoa text-cream py-20 sm:py-24"
            style={{ order: displayOrder("why_hugos", 3) }}
          >
            <div className="container-shell">
              <MotionReveal>
                <SectionHeading
                  eyebrow={
                    sectionConfig("why_hugos")?.eyebrow || "Why stop at Hugo’s?"
                  }
                  title={
                    sectionConfig("why_hugos")?.heading ||
                    "Comforting flavors for the road—and for home"
                  }
                  body={
                    sectionConfig("why_hugos")?.body ||
                    "A thoughtfully varied stop for a hearty meal, quick merienda, refreshing dessert, or pasalubong worth bringing back."
                  }
                  className="[&_h2]:text-cream [&_p:last-child]:text-cream/65 [&_.eyebrow]:text-gold"
                />
              </MotionReveal>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {isVisible("why_proudly_filipino") && (
                  <WhyCard
                    icon={<UtensilsCrossed />}
                    title={
                      sectionConfig("why_proudly_filipino")?.heading ||
                      "Proudly Filipino"
                    }
                    body={
                      sectionConfig("why_proudly_filipino")?.body ||
                      "Familiar favorites—from Batchoy and palabok to kakanin and halo-halo."
                    }
                  />
                )}
                {isVisible("why_made_for_sharing") && (
                  <WhyCard
                    icon={<HeartHandshake />}
                    title={
                      sectionConfig("why_made_for_sharing")?.heading ||
                      "Made for sharing"
                    }
                    body={
                      sectionConfig("why_made_for_sharing")?.body ||
                      "Pies, boxes, and take-home treats for family, friends, and gatherings."
                    }
                  />
                )}
                {isVisible("why_easy_to_ask") && (
                  <WhyCard
                    icon={<ShieldCheck />}
                    title={
                      sectionConfig("why_easy_to_ask")?.heading || "Easy to ask"
                    }
                    body={
                      sectionConfig("why_easy_to_ask")?.body ||
                      "Message ahead for current availability, pre-orders, and product details."
                    }
                  />
                )}
              </div>
            </div>
          </section>
        )}

        {isVisible("categories") && (
          <section
            className="native-pattern py-20 sm:py-28"
            style={{ order: displayOrder("categories", 4) }}
          >
            <div className="container-shell">
              <MotionReveal>
                <SectionHeading
                  eyebrow={
                    sectionConfig("categories")?.eyebrow ||
                    "There’s something for everyone"
                  }
                  title={
                    sectionConfig("categories")?.heading || "Explore by craving"
                  }
                  body={
                    sectionConfig("categories")?.body ||
                    "From a steaming bowl to a cool dessert or something special to take home."
                  }
                  align="center"
                />
              </MotionReveal>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {categories.slice(0, 7).map((category) => {
                  const art = CATEGORY_ART[category.slug];
                  const count = products.filter(
                    (product) => product.category?.slug === category.slug,
                  ).length;
                  return (
                    <Link
                      key={category.id}
                      href={`/menu?category=${category.slug}`}
                      className="paper-card group hover:border-gold flex items-center gap-4 p-5 transition hover:-translate-y-1"
                    >
                      <span
                        className={`relative grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-gradient-to-br text-3xl ${art?.tone ?? "from-gold to-beige"}`}
                      >
                        {category.image_url ? (
                          <Image
                            src={category.image_url}
                            alt=""
                            fill
                            sizes="56px"
                            className="object-cover transition duration-300 group-hover:scale-105"
                          />
                        ) : (
                          (art?.emoji ?? "🍽️")
                        )}
                      </span>
                      <span>
                        <span className="font-display text-cocoa block text-lg leading-tight font-bold">
                          {category.name}
                        </span>
                        <span className="text-muted mt-1 block text-xs font-bold">
                          {count} items
                        </span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {featured && isVisible("featured_product") && (
          <section
            className="py-20 sm:py-28"
            style={{ order: displayOrder("featured_product", 5) }}
          >
            <div className="container-shell">
              <div className="paper-card grid overflow-hidden lg:grid-cols-[1.08fr_.92fr]">
                <ProductVisualLarge product={featured} />
                <div className="flex flex-col justify-center p-7 sm:p-12 lg:p-16">
                  <p className="eyebrow">
                    {sectionConfig("featured_product")?.eyebrow ||
                      "Featured at the stop"}
                  </p>
                  <h2 className="display-title text-cocoa mt-3 text-4xl leading-tight sm:text-5xl">
                    {featured.name}
                  </h2>
                  <p className="text-muted mt-5 text-base leading-8">
                    {featured.full_description.replace(
                      " This is helpful draft copy and should be reviewed by the owner for exact ingredients, portions, and preparation details.",
                      "",
                    )}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link
                        href={
                          sectionConfig("featured_product")?.primary_cta_url ||
                          `/menu/${featured.slug}`
                        }
                      >
                        {sectionConfig("featured_product")?.primary_cta_label ||
                          "View product"}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a
                        href={
                          sectionConfig("featured_product")
                            ?.secondary_cta_url || settings.messenger_url
                        }
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-4" />
                        {sectionConfig("featured_product")
                          ?.secondary_cta_label || "Ask about availability"}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isVisible("about_preview") && (
          <section
            className="bg-beige/35 py-20 sm:py-28"
            style={{ order: displayOrder("about_preview", 6) }}
          >
            <div className="container-shell grid items-center gap-12 lg:grid-cols-[.85fr_1.15fr]">
              <MotionReveal>
                <div className="relative mx-auto aspect-[4/5] max-w-md overflow-hidden rounded-[2rem] shadow-[0_28px_80px_rgba(58,36,24,.18)]">
                  <Image
                    src={about?.image_url || DEFAULT_STORY_IMAGE}
                    alt={sectionImageAlt(
                      about,
                      `Filipino food served at ${settings.business_name}`,
                    )}
                    fill
                    loading="lazy"
                    sizes="(max-width: 1024px) 90vw, 40vw"
                    className="object-cover object-[70%_center]"
                  />
                  <div className="bg-cream/92 absolute right-5 bottom-5 left-5 rounded-2xl p-4 backdrop-blur">
                    <p className="font-display text-cocoa text-xl font-bold">
                      {about?.eyebrow || "A delicious reason to slow down."}
                    </p>
                  </div>
                </div>
              </MotionReveal>
              <MotionReveal delay={0.1}>
                <p className="eyebrow">{about?.eyebrow}</p>
                <h2 className="display-title text-cocoa mt-3 text-4xl leading-tight sm:text-6xl">
                  {about?.heading}
                </h2>
                <p className="text-muted mt-6 max-w-xl text-lg leading-8">
                  {about?.body}
                </p>
                <Button asChild variant="outline" size="lg" className="mt-8">
                  <Link href={about?.primary_cta_url || "/about"}>
                    {about?.primary_cta_label || "Discover Our Story"}
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </MotionReveal>
            </div>
          </section>
        )}

        {isVisible("promotion") && (
          <section
            className="py-14"
            style={{ order: displayOrder("promotion", 7) }}
          >
            <div className="container-shell">
              <div className="bg-ube relative overflow-hidden rounded-[2rem] px-7 py-10 text-white shadow-[0_24px_60px_rgba(114,69,122,.2)] sm:px-12">
                {(promotion?.image_url ||
                  sectionConfig("promotion")?.image_url) && (
                  <Image
                    src={
                      promotion?.image_url ||
                      sectionConfig("promotion")?.image_url ||
                      DEFAULT_STORY_IMAGE
                    }
                    alt={sectionImageAlt(
                      sectionConfig("promotion"),
                      "Featured promotion",
                    )}
                    fill
                    loading="lazy"
                    sizes="100vw"
                    className="object-cover opacity-20"
                  />
                )}
                <div className="native-pattern absolute inset-0 opacity-25" />
                <div className="relative flex flex-col gap-7 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-gold text-xs font-extrabold tracking-[.17em] uppercase">
                      {sectionConfig("promotion")?.eyebrow || "Plan your stop"}
                    </p>
                    <h2 className="font-display mt-2 text-3xl font-bold sm:text-4xl">
                      {promotion?.title ||
                        sectionConfig("promotion")?.heading ||
                        "Ordering for a gathering or bringing pasalubong?"}
                    </h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                      {promotion?.description ||
                        sectionConfig("promotion")?.body ||
                        "Send a message to ask about current availability, lead times, and shareable options before you travel."}
                    </p>
                  </div>
                  <Button asChild variant="gold" size="lg" className="shrink-0">
                    <a
                      href={promotion?.cta_url || settings.messenger_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {promotion?.cta_label || "Message ahead"}
                      <MessageCircle className="size-5" />
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {testimonials.length > 0 && isVisible("testimonials") && (
          <section
            className="py-20 sm:py-28"
            style={{ order: displayOrder("testimonials", 8) }}
          >
            <div className="container-shell">
              <SectionHeading
                eyebrow={
                  sectionConfig("testimonials")?.eyebrow || "From our guests"
                }
                title={
                  sectionConfig("testimonials")?.heading ||
                  "Shared with a full heart"
                }
                body={sectionConfig("testimonials")?.body}
                align="center"
              />
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {testimonials.slice(0, 3).map((item) => (
                  <blockquote key={item.id} className="paper-card p-7">
                    <div className="mb-5 flex items-center gap-3">
                      {item.photo_url ? (
                        <span className="bg-beige relative size-11 overflow-hidden rounded-full">
                          <Image
                            src={item.photo_url}
                            alt=""
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </span>
                      ) : (
                        <span className="bg-gold/20 text-ube grid size-11 place-items-center rounded-full font-extrabold">
                          {item.customer_name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                      {item.rating && (
                        <span
                          className="text-gold flex"
                          aria-label={`${item.rating} out of 5 stars`}
                        >
                          {Array.from({ length: item.rating }, (_, index) => (
                            <Star
                              key={index}
                              className="size-3.5 fill-current"
                            />
                          ))}
                        </span>
                      )}
                    </div>
                    <p className="font-display text-cocoa text-2xl leading-9">
                      “{item.quote}”
                    </p>
                    <footer className="text-ube mt-5 text-sm font-extrabold">
                      — {item.customer_name}
                    </footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        )}

        {isVisible("location") && (
          <section
            className="home-section-deferred py-20 sm:py-28"
            style={{ order: displayOrder("location", 9) }}
          >
            <div className="container-shell">
              <div className="border-cocoa/10 grid overflow-hidden rounded-[2rem] border bg-white shadow-[0_20px_60px_rgba(58,36,24,.1)] lg:grid-cols-2">
                {mapUrl && (
                  <iframe
                    title={sectionImageAlt(
                      sectionConfig("location"),
                      `Map showing ${settings.business_name} near Sta. Fe and Alangalang, Leyte`,
                    )}
                    src={mapUrl}
                    className="min-h-[410px] w-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                )}
                <div className="flex flex-col justify-center p-7 sm:p-12">
                  <p className="eyebrow">
                    {sectionConfig("location")?.eyebrow ||
                      "Make Hugo’s your next stop"}
                  </p>
                  <h2 className="display-title text-cocoa mt-3 text-4xl sm:text-5xl">
                    {sectionConfig("location")?.heading ||
                      "Easy to find. Hard to pass up."}
                  </h2>
                  <p className="text-muted mt-5 flex gap-3 text-base leading-7">
                    <MapPin className="text-ube mt-1 size-5 shrink-0" />
                    {settings.address}
                  </p>
                  <div className="mt-7 space-y-3">
                    {settings.opening_hours.map((item) => (
                      <div
                        key={item.days}
                        className="border-cocoa/10 flex justify-between gap-6 border-b pb-3 text-sm"
                      >
                        <span className="text-cocoa font-bold">
                          {item.days}
                        </span>
                        <span className="text-muted">{item.hours}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button asChild>
                      <Link
                        href={
                          sectionConfig("location")?.primary_cta_url || "/visit"
                        }
                      >
                        {sectionConfig("location")?.primary_cta_label ||
                          "Get visit details"}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <a href={`tel:${phoneHref}`}>
                        <Phone className="size-4" />
                        {sectionConfig("location")?.secondary_cta_label ||
                          "Call us"}
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {isVisible("social") && (
          <section
            className="home-section-deferred bg-gold/15 py-16"
            style={{ order: displayOrder("social", 10) }}
          >
            <div className="container-shell flex flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
              <div className="max-w-2xl">
                <p className="eyebrow">
                  {sectionConfig("social")?.eyebrow || "Follow the cravings"}
                </p>
                <h2 className="display-title text-cocoa mt-2 text-3xl sm:text-4xl">
                  {sectionConfig("social")?.heading ||
                    "See what’s fresh on Facebook"}
                </h2>
                <p className="text-muted mt-3 text-sm leading-6">
                  {sectionConfig("social")?.body ||
                    "Check the official page for current dishes, announcements, and the latest product photos."}
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="shrink-0 bg-white"
              >
                <a
                  href={
                    sectionConfig("social")?.primary_cta_url ||
                    settings.facebook_url
                  }
                  target="_blank"
                  rel="noreferrer"
                >
                  <ThumbsUp className="size-5" />
                  {sectionConfig("social")?.primary_cta_label ||
                    "Visit our Facebook page"}
                </a>
              </Button>
            </div>
          </section>
        )}

        {isVisible("final_cta") && (
          <section
            className="home-section-deferred bg-cocoa text-cream py-20 text-center"
            style={{ order: displayOrder("final_cta", 11) }}
          >
            <div className="container-shell">
              <p className="eyebrow !text-gold">
                {sectionConfig("final_cta")?.eyebrow || "See you at the stop"}
              </p>
              <h2 className="display-title text-cream mx-auto mt-3 max-w-4xl text-4xl sm:text-6xl">
                {sectionConfig("final_cta")?.heading ||
                  "Your next Filipino comfort food favorite is waiting."}
              </h2>
              <p className="text-cream/65 mx-auto mt-5 max-w-2xl">
                {sectionConfig("final_cta")?.body ||
                  "Explore the menu, ask what’s available, or simply stop by and enjoy the break."}
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button asChild variant="gold" size="lg">
                  <Link
                    href={
                      sectionConfig("final_cta")?.primary_cta_url || "/menu"
                    }
                  >
                    {sectionConfig("final_cta")?.primary_cta_label ||
                      "Explore our menu"}
                    <ArrowRight className="size-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-cream/25 text-cream hover:bg-cream hover:text-cocoa bg-transparent"
                >
                  <a
                    href={
                      sectionConfig("final_cta")?.secondary_cta_url ||
                      settings.messenger_url
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    {sectionConfig("final_cta")?.secondary_cta_label ||
                      "Message us"}
                    <MessageCircle className="size-5" />
                  </a>
                </Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}

function QuickInfo({
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
      <span className="bg-gold/16 text-gold grid size-9 place-items-center rounded-full [&_svg]:size-4">
        {icon}
      </span>
      <span>
        <span className="text-cream/45 block text-[.62rem] font-extrabold tracking-wider uppercase">
          {label}
        </span>
        <span className="text-cream mt-1 block text-xs font-bold">{value}</span>
      </span>
    </>
  );
  return href ? (
    <a
      href={href}
      className="border-cream/13 bg-cream/8 flex items-center gap-3 rounded-2xl border p-3 backdrop-blur"
    >
      {content}
    </a>
  ) : (
    <div className="border-cream/13 bg-cream/8 flex items-center gap-3 rounded-2xl border p-3 backdrop-blur">
      {content}
    </div>
  );
}
function WhyCard({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <MotionReveal>
      <div className="border-cream/10 bg-cream/6 h-full rounded-[1.5rem] border p-7">
        <span className="bg-gold text-cocoa grid size-12 place-items-center rounded-2xl [&_svg]:size-5">
          {icon}
        </span>
        <h3 className="font-display mt-6 text-2xl font-bold">{title}</h3>
        <p className="text-cream/62 mt-3 text-sm leading-7">{body}</p>
      </div>
    </MotionReveal>
  );
}
async function ProductVisualLarge({
  product,
}: {
  product: Awaited<ReturnType<typeof getProducts>>[number];
}) {
  const { ProductVisual } = await import("@/components/product-visual");
  return (
    <div className="relative min-h-[420px]">
      <ProductVisual
        name={product.name}
        categorySlug={product.category?.slug ?? "pasalubong"}
        imageUrl={product.main_image_url}
        className="absolute inset-0"
      />
    </div>
  );
}
