import { describe, expect, it } from "vitest";
import {
  formatPeso,
  safeLinkUrl,
  safeMapEmbedUrl,
  safeMediaUrl,
  safeRedirectPath,
  safeText,
  slugify,
} from "@/lib/utils";

describe("business utilities", () => {
  it("formats confirmed Philippine peso prices and blank prices", () => {
    expect(formatPeso(150)).toContain("₱150");
    expect(formatPeso(null)).toBe("Ask for price");
  });
  it("creates clean SEO slugs", () => {
    expect(slugify("Kobe’s Calamansi Concentrate")).toBe(
      "kobe-s-calamansi-concentrate",
    );
  });
  it("rejects open redirects", () => {
    expect(safeRedirectPath("https://evil.example", "/admin")).toBe("/admin");
    expect(safeRedirectPath("//evil.example", "/admin")).toBe("/admin");
    expect(safeRedirectPath("/admin/products", "/admin")).toBe(
      "/admin/products",
    );
  });
  it("removes raw tag characters and control bytes", () => {
    expect(safeText("<script>\u0000hello</script>")).toBe("scripthello/script");
  });
  it("allow-lists public links, media, and map embeds", () => {
    expect(safeLinkUrl("javascript:alert(1)")).toBe("");
    expect(safeLinkUrl("/menu")).toBe("/menu");
    expect(safeMediaUrl("https://evil.example/image.jpg")).toBe("");
    expect(safeMediaUrl("/images/filipino-food-hero.png")).toBe(
      "/images/filipino-food-hero.png",
    );
    expect(safeMapEmbedUrl("https://evil.example/maps")).toContain(
      "google.com/maps",
    );
  });
});
