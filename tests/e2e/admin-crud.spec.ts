import { expect, test } from "@playwright/test";

const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;

async function signIn(page: import("@playwright/test").Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email address").fill(email!);
  await page.getByLabel("Password").fill(password!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}

test("owner can manage a product through its complete lifecycle", async ({
  page,
}) => {
  test.skip(
    !email || !password,
    "Set temporary E2E admin credentials to run catalog mutation checks.",
  );

  const token =
    process.env.E2E_PRODUCT_TOKEN ?? `${Date.now()}-${test.info().workerIndex}`;
  const slug = `qa-product-${token}`;
  const initialName = `QA Product ${token}`;
  const updatedName = `QA Product Updated ${token}`;

  await signIn(page);

  try {
    await page.goto("/admin/products/new");
    await page.getByLabel("Product name").fill(initialName);
    await page.getByLabel("URL slug").fill(slug);
    await page
      .getByLabel("Short description")
      .fill("Temporary product used to verify the admin catalog workflow.");
    await page
      .getByLabel("Full description")
      .fill(
        "This temporary record verifies product creation, publication, editing, archival, restoration, and deletion.",
      );
    await page.getByLabel("Category").selectOption({ index: 1 });
    await page.getByLabel("Regular price (PHP)").fill("99");
    await page.getByLabel("Publish status").selectOption("published");
    await page.getByRole("button", { name: "Create product" }).click();
    await expect(page.getByRole("status")).toContainText("was saved");

    await page.goto(`/menu/${slug}`);
    await expect(
      page.getByRole("heading", { name: initialName }),
    ).toBeVisible();
    await expect(page.getByText("₱99", { exact: false }).first()).toBeVisible();

    await page.goto(`/admin/products?q=${encodeURIComponent(token)}`);
    let row = page.getByRole("row").filter({ hasText: initialName });
    await expect(row).toBeVisible();
    await row.getByTitle("Edit").click();
    await page.getByLabel("Product name").fill(updatedName);
    await page.getByLabel("Regular price (PHP)").fill("109");
    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page.getByRole("status")).toContainText("was saved");

    await page.goto(`/menu/${slug}`);
    await expect(
      page.getByRole("heading", { name: updatedName }),
    ).toBeVisible();
    await expect(
      page.getByText("₱109", { exact: false }).first(),
    ).toBeVisible();

    await page.goto(`/admin/products?q=${encodeURIComponent(token)}`);
    row = page.getByRole("row").filter({ hasText: updatedName });
    page.once("dialog", (dialog) => dialog.accept());
    await row.getByTitle("Archive").click();
    await expect(row).toContainText("archived");

    await page.goto(`/menu/${slug}`);
    await expect(page.getByRole("heading", { name: updatedName })).toHaveCount(
      0,
    );
    await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute(
      "content",
      /noindex/,
    );

    await page.goto(
      `/admin/products?q=${encodeURIComponent(token)}&status=archived`,
    );
    row = page.getByRole("row").filter({ hasText: updatedName });
    await row.getByTitle("Restore").click();
    await expect(row).toHaveCount(0);
    await page.goto(`/admin/products?q=${encodeURIComponent(token)}`);
    row = page.getByRole("row").filter({ hasText: updatedName });
    await expect(row).toContainText("draft");
  } finally {
    await page.goto(`/admin/products?q=${encodeURIComponent(token)}`);
    const row = page
      .getByRole("row")
      .filter({ hasText: updatedName })
      .or(page.getByRole("row").filter({ hasText: initialName }));
    if (await row.isVisible().catch(() => false)) {
      page.once("dialog", (dialog) => dialog.accept());
      await row.getByTitle("Delete permanently").click();
      await expect(row).toHaveCount(0);
    }
  }
});

test("owner can create, edit, publish, and delete a category", async ({
  page,
}) => {
  test.skip(
    !email || !password,
    "Set temporary E2E admin credentials to run category mutation checks.",
  );

  const token =
    process.env.E2E_PRODUCT_TOKEN ?? `${Date.now()}-${test.info().workerIndex}`;
  const slug = `qa-category-${token}`;
  const name = `QA Category ${token}`;

  await signIn(page);
  try {
    await page.goto("/admin/categories");
    const addSection = page.locator("section").filter({
      has: page.getByRole("heading", { name: "Add category" }),
    });
    await addSection.getByLabel("Name").fill(name);
    await addSection.getByLabel("Slug").fill(slug);
    await addSection
      .getByLabel("Description")
      .fill("Temporary category used for an automated admin workflow check.");
    await addSection.getByRole("button", { name: "Add category" }).click();
    await expect(addSection).toContainText("Category saved.");

    await page.goto("/menu");
    await expect(page.getByRole("button", { name, exact: true })).toBeVisible();

    await page.goto("/admin/categories");
    const card = page
      .getByRole("heading", { name, exact: true })
      .locator("..")
      .locator("..")
      .locator("..");
    await card
      .getByLabel("Description")
      .fill("Updated category description verified by Playwright.");
    await card.getByRole("button", { name: "Save category" }).click();
    await expect(card).toContainText("Category saved.");
  } finally {
    await page.goto("/admin/categories");
    const heading = page.getByRole("heading", { name, exact: true });
    if (await heading.isVisible().catch(() => false)) {
      const card = heading.locator("..").locator("..").locator("..");
      page.once("dialog", (dialog) => dialog.accept());
      await card.getByRole("button", { name: "Delete" }).click();
      await expect(heading).toHaveCount(0);
    }
  }
});
