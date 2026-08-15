import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProductCard } from "@/components/product-card";
import { seedProducts } from "@/data/seed";
describe("ProductCard", () => {
  it("shows core product content, draft peso pricing, and inquiry action", () => {
    const product = seedProducts.find(
      (item) => item.slug === "classic-buko-pie",
    )!;
    render(<ProductCard product={product} />);
    expect(
      screen.getByRole("heading", { name: product.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(/₱300/)).toBeInTheDocument();
    expect(screen.getByText("Ask about this product")).toHaveAttribute(
      "href",
      expect.stringContaining("m.me"),
    );
  });
});
