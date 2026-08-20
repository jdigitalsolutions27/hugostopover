import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandLogo } from "@/components/brand-logo";

describe("BrandLogo", () => {
  it("uses the official owner-provided logo by default", () => {
    const { container } = render(<BrandLogo />);
    expect(container.querySelector("img")).toHaveAttribute(
      "src",
      expect.stringContaining("hugo-official-logo.jpg"),
    );
  });
});
