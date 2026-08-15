import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PageHero } from "@/components/page-hero";
import type { PageSection } from "@/types/domain";

describe("PageHero", () => {
  it("always renders the professional fallback food photo", () => {
    render(
      <PageHero
        fallbackEyebrow="Meals"
        fallbackHeading="Find your next favorite."
        fallbackBody="Browse the menu."
        fallbackImageAlt="Filipino food spread"
      />,
    );
    const image = screen.getByRole("img", { name: "Filipino food spread" });
    expect(image).toHaveAttribute(
      "src",
      expect.stringContaining("filipino-food-hero.png"),
    );
    expect(image).toHaveAttribute("loading", "eager");
  });

  it("uses the administrator-selected photo and description", () => {
    const section: PageSection = {
      id: "10000000-0000-4000-8000-000000000001",
      page_slug: "menu",
      section_key: "hero",
      eyebrow: "Menu",
      heading: "Our food",
      body: "Fresh Filipino favorites.",
      image_url: "/images/owner-menu-photo.png",
      primary_cta_label: "",
      primary_cta_url: "",
      secondary_cta_label: "",
      secondary_cta_url: "",
      settings: { image_alt: "Owner-approved menu spread" },
      is_visible: true,
      display_order: 1,
      status: "published",
    };
    render(
      <PageHero
        section={section}
        fallbackEyebrow="Meals"
        fallbackHeading="Menu"
        fallbackBody="Browse the menu."
      />,
    );
    expect(
      screen.getByRole("img", { name: "Owner-approved menu spread" }),
    ).toHaveAttribute("src", expect.stringContaining("owner-menu-photo.png"));
  });
});
