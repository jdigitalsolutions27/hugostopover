import { expect, test } from "@playwright/test";

const viewports = [
  { name: "phone-320", width: 320, height: 760 },
  { name: "tablet-768", width: 768, height: 1024 },
  { name: "laptop-1366", width: 1366, height: 768 },
  { name: "desktop-1920", width: 1920, height: 1080 },
];

for (const viewport of viewports) {
  test(`homepage has no horizontal overflow at ${viewport.name}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Your Favorite Filipino Comfort Food Stopover/i,
      }),
    ).toBeVisible();
    const hasOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(hasOverflow).toBe(false);
    await page.screenshot({
      path: `test-results/responsive-${viewport.name}.png`,
      fullPage: false,
    });
  });
}
