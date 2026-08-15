import { describe, expect, it } from "vitest";
import { detectImageMime } from "@/lib/upload";
describe("image signature validation", () => {
  it("detects JPEG and PNG signatures", () => {
    expect(detectImageMime(Uint8Array.from([0xff, 0xd8, 0xff, 0x00]))).toBe(
      "image/jpeg",
    );
    expect(detectImageMime(Uint8Array.from([0x89, 0x50, 0x4e, 0x47]))).toBe(
      "image/png",
    );
  });
  it("does not trust unknown file content", () =>
    expect(detectImageMime(Uint8Array.from([1, 2, 3, 4]))).toBeNull());
});
