import { describe, expect, it } from "vitest";
import { seedBusinessSettings } from "@/data/seed";
import {
  buildLocalBusinessJsonLd,
  buildOpeningHoursSpecification,
  serializeJsonLd,
} from "@/lib/seo";

describe("local SEO utilities", () => {
  it("converts editable business hours into schema.org hours", () => {
    expect(
      buildOpeningHoursSpecification([
        { days: "Tuesday–Sunday", hours: "7:00 AM–8:30 PM" },
        { days: "Monday", hours: "Closed" },
      ]),
    ).toEqual([
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "07:00",
        closes: "20:30",
      },
    ]);
  });

  it("builds a restaurant entity with exact coordinates and canonical URLs", () => {
    const result = buildLocalBusinessJsonLd(
      seedBusinessSettings,
      "Filipino food stop over in Leyte.",
    );
    expect(result["@type"]).toBe("Restaurant");
    expect(result.geo).toMatchObject({
      latitude: 11.1868,
      longitude: 124.912317,
    });
    expect(result.menu).toMatch(/\/menu$/);
    expect(result.sameAs).toContain(seedBusinessSettings.facebook_url);
    expect(result["@id"]).not.toContain("//#restaurant");
  });

  it("escapes markup-capable characters in JSON-LD", () => {
    expect(serializeJsonLd({ name: "</script>" })).not.toContain("<");
    expect(serializeJsonLd({ name: "</script>" })).toContain("\\u003c");
  });
});
