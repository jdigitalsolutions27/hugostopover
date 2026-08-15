import type { CSSProperties, ReactNode } from "react";
import { getBusinessSettings, getPageSections } from "@/data/repository";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export async function PublicShell({ children }: { children: ReactNode }) {
  const [settings, globalSections] = await Promise.all([
    getBusinessSettings(),
    getPageSections("global"),
  ]);
  const valid = (value: unknown, fallback: string) => {
    const color = String(value ?? "");
    return /^#[0-9a-f]{6}$/i.test(color) ? color : fallback;
  };
  const style = {
    "--cocoa": valid(settings.brand_colors.cocoa, "#3A2418"),
    "--cream": valid(settings.brand_colors.cream, "#FFF8E9"),
    "--gold": valid(settings.brand_colors.gold, "#D99B3D"),
    "--ube": valid(settings.brand_colors.ube, "#72457A"),
    "--leaf": valid(settings.brand_colors.leaf, "#496B45"),
    "--beige": valid(settings.brand_colors.beige, "#EEDFC5"),
    "--charcoal": valid(settings.brand_colors.charcoal, "#231F1B"),
  } as CSSProperties;
  return (
    <div className="min-h-screen overflow-x-clip" style={style}>
      <SiteHeader settings={settings} sections={globalSections} />
      {settings.maintenance_notice && (
        <div
          className="bg-ube px-4 py-3 text-center text-xs font-bold text-white"
          role="status"
        >
          {settings.maintenance_notice}
        </div>
      )}
      <main id="main-content">{children}</main>
      <SiteFooter settings={settings} sections={globalSections} />
    </div>
  );
}
