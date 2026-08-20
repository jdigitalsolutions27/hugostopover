import { expect, test } from "@playwright/test";

const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

test("authorized owner can navigate every admin workspace", async ({
  page,
}, testInfo) => {
  test.skip(
    !adminEmail || !adminPassword,
    "Set temporary E2E admin credentials to run authenticated checks.",
  );

  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(adminEmail!);
  await page.getByLabel("Password").fill(adminPassword!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);

  const routes = [
    "/admin",
    "/admin/products",
    "/admin/products/new",
    "/admin/products/reorder",
    "/admin/categories",
    "/admin/content",
    "/admin/settings",
    "/admin/inquiries",
    "/admin/testimonials",
    "/admin/media",
    "/admin/users",
  ];

  for (const route of routes) {
    const response = await page.goto(route, { waitUntil: "load" });
    expect(response?.status(), `${route} should load for the owner`).toBe(200);
    await expect(page).toHaveURL(
      new RegExp(`${route.replaceAll("/", "\\/")}$`),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > window.innerWidth + 1,
      ),
      `${route} should not overflow horizontally`,
    ).toBe(false);
  }

  await page.goto("/admin/products/new");
  await expect(
    page
      .getByRole("navigation", { name: "Admin dashboard" })
      .getByRole("link", { name: "Products" }),
  ).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("Current page").first()).toBeVisible();
  await expect(
    page.getByText("Products", { exact: true }).first(),
  ).toBeVisible();

  // Supabase sign-out can revoke other concurrent sessions for the same
  // temporary account, so exercise it once in the primary desktop project.
  if (testInfo.project.name === "chromium") {
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/admin\/login$/);
  }
});
