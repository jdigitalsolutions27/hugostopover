import { expect, test } from "@playwright/test";

test("homepage presents the business and primary conversion actions", async ({
  page,
}) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", {
      name: /Your Favorite Filipino Comfort Food Stopover/i,
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Explore Our Menu/i }).first(),
  ).toBeVisible();
  await expect(page).toHaveTitle(/Hugo['’]s Stop Over/);
  await expect(
    page
      .getByRole("link", { name: /Hugo['’]s Stop Over home/i })
      .locator("img"),
  ).toBeVisible();
  const favicon = await page.request.get("/favicon.ico");
  expect(favicon.status()).toBe(200);
  expect(favicon.headers()["content-type"]).toContain("image/x-icon");
});

test("menu search reveals a seeded product and its detail page", async ({
  page,
}) => {
  await page.goto("/menu");
  await page.getByRole("textbox", { name: "Search products" }).fill("Batchoy");
  await expect(
    page.getByRole("heading", { name: "Authentic Iloilo La Paz Batchoy" }),
  ).toBeVisible();
  await page
    .getByRole("link", {
      name: "Authentic Iloilo La Paz Batchoy",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/la-paz-batchoy/);
  await expect(page.getByText(/₱\d+/, { exact: true }).first()).toBeVisible();
});

test("contact form provides accessible validation feedback", async ({
  page,
}) => {
  await page.goto("/visit");
  await page.getByRole("button", { name: "Send inquiry" }).click();
  await expect(page.getByText("Please enter your name.")).toBeVisible();
});

test("admin dashboard is protected on the server", async ({ page }) => {
  await page.goto("/admin/products");
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole("heading", { name: "Welcome back." }),
  ).toBeVisible();
});

test("an invalid or expired admin invitation fails safely", async ({
  page,
}) => {
  await page.goto("/admin/accept-invite");
  await expect(
    page.getByRole("heading", { name: "This invitation cannot be used." }),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/admin\/accept-invite$/);
});

test("mobile navigation opens and reaches the menu", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "Mobile project only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page
    .getByRole("navigation", { name: "Mobile navigation" })
    .getByRole("link", { name: "Menu" })
    .click();
  await expect(page).toHaveURL(/\/menu$/);
});

test("secondary pages use photo heroes and Gallery is retired", async ({
  page,
}) => {
  await page.goto("/menu");
  await expect(
    page.getByRole("img", {
      name: /La Paz Batchoy, buko pie, halo-halo/i,
    }),
  ).toBeVisible();
  await expect(page.locator("header")).not.toContainText("Gallery");

  const response = await page.goto("/gallery");
  expect(response?.status()).toBe(404);
  await expect(
    page.getByRole("heading", { name: /This stop isn['’]t on the menu/i }),
  ).toBeVisible();
});
