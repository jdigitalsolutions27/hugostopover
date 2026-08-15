import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Heart, Leaf, MapPinned, Users } from "lucide-react";
import { PublicShell } from "@/components/public-shell";
import { PageHero } from "@/components/page-hero";
import { Button } from "@/components/ui/button";
import { getPageMeta, getPageSections } from "@/data/repository";
import { sectionImageAlt } from "@/lib/content";
import { DEFAULT_HERO_IMAGE } from "@/lib/constants";
import { hasSupabaseConfig } from "@/lib/supabase/config";

export async function generateMetadata(): Promise<Metadata> {
  const meta = await getPageMeta("about");
  return {
    title: meta.title,
    description: meta.description,
    alternates: { canonical: "/about" },
  };
}
export default async function AboutPage() {
  const sections = await getPageSections("about");
  const section = (key: string) =>
    sections.find((item) => item.section_key === key);
  const visible = (key: string) =>
    hasSupabaseConfig() ? Boolean(section(key)) : true;
  const hero = section("hero");
  const story = sections.find((item) => item.section_key === "story");
  const finalCta = section("final_cta");
  const values = [
    { key: "value_hospitality", icon: <Heart /> },
    { key: "value_local", icon: <Leaf /> },
    { key: "value_sharing", icon: <Users /> },
    { key: "value_stop", icon: <MapPinned /> },
  ]
    .map((item) => ({ ...item, section: section(item.key) }))
    .filter((item) => visible(item.key) && item.section)
    .toSorted(
      (a, b) =>
        (a.section?.display_order ?? 0) - (b.section?.display_order ?? 0),
    );
  return (
    <PublicShell>
      {visible("hero") && (
        <PageHero
          section={hero}
          fallbackEyebrow="Proudly local. Warmly Filipino."
          fallbackHeading="Food worth stopping for."
          fallbackBody="A welcoming place for comforting meals, merienda favorites, and pasalubong near the Sta. Fe–Alangalang boundary."
          fallbackImageAlt="Filipino comfort food and pasalubong representing Hugo’s Stop Over"
        />
      )}
      {visible("story") && (
        <section className="py-16 sm:py-24 lg:py-28">
          <div className="container-shell grid items-center gap-12 lg:grid-cols-2">
            <div className="relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden rounded-[1.5rem] shadow-[0_24px_64px_rgba(58,36,24,.14)] sm:aspect-[16/10] sm:rounded-[2rem] lg:aspect-[4/5] lg:max-w-none lg:shadow-[0_30px_80px_rgba(58,36,24,.16)]">
              <Image
                src={story?.image_url || DEFAULT_HERO_IMAGE}
                alt={sectionImageAlt(
                  story,
                  "A Filipino food spread representing Hugo’s Stop Over",
                )}
                fill
                loading={
                  (story?.image_url || DEFAULT_HERO_IMAGE) ===
                  DEFAULT_HERO_IMAGE
                    ? "eager"
                    : "lazy"
                }
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 768px, 50vw"
                className="object-cover object-[62%_58%] lg:object-[68%_center]"
              />
            </div>
            <div>
              <p className="eyebrow">{story?.eyebrow || "Our story"}</p>
              <h2 className="display-title text-cocoa mt-3 text-4xl sm:text-6xl">
                {story?.heading}
              </h2>
              <div className="prose-copy mt-6">
                <p>{story?.body}</p>
              </div>
              <Button asChild className="mt-7" size="lg">
                <Link href={story?.primary_cta_url || "/visit"}>
                  {story?.primary_cta_label || "Plan your visit"}
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
      <section className="bg-beige/35 py-20">
        <div className="container-shell">
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((item) => (
              <Value
                key={item.key}
                icon={item.icon}
                title={item.section?.heading ?? ""}
                body={item.section?.body ?? ""}
              />
            ))}
          </div>
        </div>
      </section>
      {visible("final_cta") && (
        <section className="bg-ube py-20 text-center text-white">
          <div className="container-shell">
            <h2 className="display-title text-4xl sm:text-6xl">
              {finalCta?.heading ||
                "Come hungry. We’ll make the stop worthwhile."}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-white/70">
              {finalCta?.body ||
                "Browse what’s available today, message ahead, or visit us along the road."}
            </p>
            <Button asChild variant="gold" size="lg" className="mt-8">
              <Link href={finalCta?.primary_cta_url || "/menu"}>
                {finalCta?.primary_cta_label || "Explore the menu"}
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </section>
      )}
    </PublicShell>
  );
}
function Value({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="paper-card p-6">
      <span className="bg-gold text-cocoa grid size-11 place-items-center rounded-2xl [&_svg]:size-5">
        {icon}
      </span>
      <h2 className="font-display text-cocoa mt-5 text-2xl font-bold">
        {title}
      </h2>
      <p className="text-muted mt-3 text-sm leading-6">{body}</p>
    </div>
  );
}
