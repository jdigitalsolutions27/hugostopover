import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SiteFooter } from "@/components/site-footer";
import { seedBusinessSettings, seedPageSections } from "@/data/seed";

describe("SiteFooter", () => {
  it("presents the editable business Bible reference", () => {
    render(
      <SiteFooter
        settings={seedBusinessSettings}
        sections={seedPageSections.filter(
          (section) => section.page_slug === "global",
        )}
      />,
    );

    expect(screen.getByText("Our guiding verse")).toBeInTheDocument();
    expect(screen.getByText("Proverbs 3:5–6")).toBeInTheDocument();
    expect(
      screen.getByText(/Trust in the LORD with all thine heart/),
    ).toBeInTheDocument();
    expect(screen.getByText("King James Version (KJV)")).toBeInTheDocument();
    expect(
      screen
        .getByRole("link", { name: "Follow on Facebook" })
        .querySelector('[data-brand-icon="facebook"]'),
    ).toBeInTheDocument();
  });
});
