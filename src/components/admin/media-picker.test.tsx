import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MediaPicker } from "@/components/admin/media-picker";
import type { MediaItem } from "@/types/domain";

const media: MediaItem[] = [
  {
    id: "10000000-0000-4000-8000-000000000001",
    storage_path: "food/batchoy.webp",
    public_url: "/images/filipino-food-hero.png",
    filename: "batchoy.webp",
    mime_type: "image/webp",
    size_bytes: 1024,
    width: 1200,
    height: 900,
    alt_text: "Batchoy and Filipino favorites",
    caption: "Homepage food spread",
    created_at: "2026-08-13T00:00:00.000Z",
  },
  {
    id: "10000000-0000-4000-8000-000000000002",
    storage_path: "food/placeholder.webp",
    public_url: "/images/food-placeholder.png",
    filename: "placeholder.webp",
    mime_type: "image/webp",
    size_bytes: 2048,
    width: 1200,
    height: 900,
    alt_text: "Buko pie product photo",
    caption: "Product gallery",
    created_at: "2026-08-13T00:00:00.000Z",
  },
];

describe("MediaPicker", () => {
  it("stores selections in display order and lets admins reorder them", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MediaPicker
        name="gallery_urls"
        media={media}
        value={media.map((item) => item.public_url)}
        multiple
      />,
    );
    const input = container.querySelector<HTMLInputElement>(
      'input[name="gallery_urls"]',
    );

    expect(input).toHaveValue(
      "/images/filipino-food-hero.png\n/images/food-placeholder.png",
    );
    await user.click(
      screen.getByRole("button", { name: "Move image 2 earlier" }),
    );
    expect(input).toHaveValue(
      "/images/food-placeholder.png\n/images/filipino-food-hero.png",
    );
  });

  it("opens the searchable library and records a chosen image", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <MediaPicker name="image_url" media={media} label="Section image" />,
    );

    await user.click(screen.getByRole("button", { name: "Choose image" }));
    await user.type(screen.getByPlaceholderText(/Search filename/), "buko");
    await user.click(
      screen.getByRole("button", { name: /Buko pie product photo/ }),
    );
    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(
      container.querySelector<HTMLInputElement>('input[name="image_url"]'),
    ).toHaveValue("/images/food-placeholder.png");
  });
});
