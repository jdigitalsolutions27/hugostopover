import { expect, test } from "@playwright/test";

const publicRoutes = [
  "/",
  "/menu",
  "/menu/authentic-iloilo-la-paz-batchoy",
  "/about",
  "/visit",
];

test("public pages stay healthy and accessible across browsers", async ({
  page,
}) => {
  const browserErrors: string[] = [];
  page.on("pageerror", (error) => browserErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") browserErrors.push(message.text());
  });

  for (const route of publicRoutes) {
    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status(), `${route} should respond successfully`).toBe(
      200,
    );
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("main#main-content")).toHaveCount(1);

    const metrics = await page.evaluate(() => ({
      hasHorizontalOverflow:
        document.documentElement.scrollWidth > window.innerWidth + 1,
      brokenImages: Array.from(document.images)
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
    }));

    expect(metrics.hasHorizontalOverflow, `${route} should not overflow`).toBe(
      false,
    );
    expect(
      metrics.brokenImages,
      `${route} should not show broken images`,
    ).toEqual([]);
  }

  expect(browserErrors).toEqual([]);
});

test("catalog filters and global conversion links remain functional", async ({
  page,
}) => {
  await page.goto("/menu");
  await page.getByRole("button", { name: "Best sellers", exact: true }).click();
  await expect(page.getByText(/Showing \d+ of \d+ products/)).toBeVisible();

  await page.getByRole("button", { name: "Clear filters" }).click();
  await page.getByRole("textbox", { name: "Search products" }).fill("Buko Pie");
  await expect(
    page.getByRole("heading", { name: "Classic Buko Pie" }),
  ).toBeVisible();

  await page.goto("/");
  const openMenu = page.getByRole("button", { name: "Open menu" });
  if (await openMenu.isVisible()) await openMenu.click();
  await expect(
    page.locator("header").getByRole("link", { name: "Facebook" }),
  ).toHaveAttribute("href", /^https:\/\/www\.facebook\.com\//);
  await expect(
    page.locator("footer").getByRole("link", { name: "Follow on Facebook" }),
  ).toHaveAttribute("href", /^https:\/\/www\.facebook\.com\//);
});
