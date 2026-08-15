import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPeso(value: number | null, label = "Ask for price") {
  if (value === null) return label;
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value);
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function safeText(value: unknown, maxLength = 2000) {
  return String(value ?? "")
    .replace(/[<>]/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim()
    .slice(0, maxLength);
}

export function safeRedirectPath(value: unknown, fallback = "/admin") {
  const path = String(value ?? "");
  if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) {
    return fallback;
  }
  return path;
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function absoluteUrl(path = "") {
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function safeMediaUrl(value: unknown) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  if (url.startsWith("/images/") && !url.includes("..")) return url;
  try {
    const parsed = new URL(url);
    if (
      parsed.protocol === "https:" &&
      parsed.hostname.endsWith(".supabase.co") &&
      parsed.pathname.startsWith("/storage/v1/object/public/media/")
    )
      return parsed.toString();
  } catch {
    return "";
  }
  return "";
}

export function safeLinkUrl(value: unknown, fallback = "") {
  const url = String(value ?? "").trim();
  if (url.startsWith("/") && !url.startsWith("//") && !url.includes("\\"))
    return url;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" ? parsed.toString() : fallback;
  } catch {
    return fallback;
  }
}

export function safeMapEmbedUrl(value: unknown) {
  const url = safeLinkUrl(value);
  const fallback =
    "https://www.google.com/maps?q=Alangalang%2C%20Leyte&output=embed";
  if (!url || url.startsWith("/")) return fallback;
  const parsed = new URL(url);
  return (parsed.hostname === "www.google.com" ||
    parsed.hostname === "maps.google.com") &&
    parsed.pathname.startsWith("/maps")
    ? parsed.toString()
    : fallback;
}
