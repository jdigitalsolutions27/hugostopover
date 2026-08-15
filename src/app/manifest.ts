import type { MetadataRoute } from "next";
import { getBusinessSettings, getPageMeta } from "@/data/repository";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [settings, meta] = await Promise.all([
    getBusinessSettings(),
    getPageMeta("home"),
  ]);
  const name = settings.business_name || "Hugo’s Stop Over";
  const icon = settings.favicon_url;
  return {
    name,
    short_name: name.slice(0, 30),
    description: meta.description,
    start_url: "/",
    display: "standalone",
    background_color: settings.brand_colors.cream || "#FFF8E9",
    theme_color: settings.brand_colors.cocoa || "#3A2418",
    icons: icon
      ? [{ src: icon, sizes: "any", type: "image/png" }]
      : [{ src: "/favicon.ico", sizes: "any", type: "image/x-icon" }],
  };
}
