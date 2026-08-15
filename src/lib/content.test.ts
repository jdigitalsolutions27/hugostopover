import { describe, expect, it } from "vitest";
import {
  humanizeSectionKey,
  sectionByKey,
  sectionImageAlt,
  sectionSetting,
} from "@/lib/content";
import type { PageSection } from "@/types/domain";

const section: PageSection = {
  id: "10000000-0000-4000-8000-000000000001",
  page_slug: "home",
  section_key: "hero",
  heading: "Welcome",
  eyebrow: "Filipino favorites",
  body: "Freshly prepared food.",
  image_url: "/images/hero.png",
  primary_cta_label: "Explore",
  primary_cta_url: "/menu",
  secondary_cta_label: "Message us",
  secondary_cta_url: "https://m.me/example",
  settings: { image_alt: "A Filipino food spread", empty: "   " },
  is_visible: true,
  display_order: 1,
  status: "published",
};

describe("structured content helpers", () => {
  it("finds sections and safely reads trimmed settings", () => {
    expect(sectionByKey([section], "hero")).toBe(section);
    expect(sectionSetting(section, "image_alt")).toBe("A Filipino food spread");
    expect(sectionSetting(section, "empty", "Fallback")).toBe("Fallback");
  });

  it("uses accessible image fallbacks and readable admin labels", () => {
    expect(sectionImageAlt(undefined, "Fallback photo")).toBe("Fallback photo");
    expect(humanizeSectionKey("nav_visit_us")).toBe("Navigation: Visit Us");
  });
});
