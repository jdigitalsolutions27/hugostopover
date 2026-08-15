import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MenuExplorer } from "@/components/menu-explorer";
import { seedCategories, seedProducts } from "@/data/seed";
describe("MenuExplorer", () => {
  it("filters products by search and can clear the filters", async () => {
    const user = userEvent.setup();
    render(
      <MenuExplorer products={seedProducts} categories={seedCategories} />,
    );
    await user.type(
      screen.getByRole("textbox", { name: "Search products" }),
      "Batchoy",
    );
    expect(
      screen.getByText("Authentic Iloilo La Paz Batchoy"),
    ).toBeInTheDocument();
    expect(screen.queryByText("Classic Buko Pie")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("Classic Buko Pie")).toBeInTheDocument();
  });
  it("supports the best-seller toggle", async () => {
    const user = userEvent.setup();
    render(
      <MenuExplorer products={seedProducts} categories={seedCategories} />,
    );
    await user.click(screen.getByRole("button", { name: "Best sellers" }));
    expect(screen.getAllByText("Best seller").length).toBeGreaterThan(0);
    expect(screen.queryByText("Pansit Palabok")).not.toBeInTheDocument();
  });
});
