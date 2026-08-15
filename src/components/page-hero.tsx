import Image from "next/image";
import { sectionImageAlt } from "@/lib/content";
import { DEFAULT_HERO_IMAGE } from "@/lib/constants";
import type { PageSection } from "@/types/domain";

export function PageHero({
  section,
  fallbackEyebrow,
  fallbackHeading,
  fallbackBody,
  fallbackImage = DEFAULT_HERO_IMAGE,
  fallbackImageAlt = "Filipino comfort food and pasalubong at Hugo’s Stop Over",
}: {
  section?: PageSection;
  fallbackEyebrow: string;
  fallbackHeading: string;
  fallbackBody: string;
  fallbackImage?: string;
  fallbackImageAlt?: string;
}) {
  return (
    <section className="bg-cocoa text-cream relative isolate flex min-h-[500px] items-center overflow-hidden sm:min-h-[540px]">
      <Image
        src={section?.image_url || fallbackImage}
        alt={sectionImageAlt(section, fallbackImageAlt)}
        fill
        loading="eager"
        fetchPriority="high"
        sizes="100vw"
        className="-z-30 object-cover object-[62%_center] lg:object-center"
      />
      <div className="from-cocoa via-cocoa/88 absolute inset-0 -z-20 bg-gradient-to-r to-transparent" />
      <div className="from-cocoa/75 absolute inset-0 -z-20 bg-gradient-to-t via-transparent to-transparent" />
      <div className="native-pattern absolute inset-0 -z-10 opacity-[.06]" />
      <div className="container-shell relative py-20 sm:py-24">
        <p className="eyebrow !text-gold">
          {section?.eyebrow || fallbackEyebrow}
        </p>
        <h1 className="display-title text-cream mt-4 max-w-4xl text-5xl leading-[.96] sm:text-7xl">
          {section?.heading || fallbackHeading}
        </h1>
        <p className="text-cream/78 mt-7 max-w-2xl text-base leading-7 sm:text-lg sm:leading-8">
          {section?.body || fallbackBody}
        </p>
      </div>
    </section>
  );
}
