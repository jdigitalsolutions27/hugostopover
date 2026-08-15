export const allowedImageExtensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export function detectImageMime(bytes: Uint8Array) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    return "image/jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  )
    return "image/png";
  const decoder = new TextDecoder();
  if (
    decoder.decode(bytes.slice(0, 4)) === "RIFF" &&
    decoder.decode(bytes.slice(8, 12)) === "WEBP"
  )
    return "image/webp";
  const brand = decoder.decode(bytes.slice(4, 12));
  if (
    brand.startsWith("ftyp") &&
    (brand.includes("avif") || brand.includes("avis"))
  )
    return "image/avif";
  return null;
}
