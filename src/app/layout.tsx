import type { Metadata, Viewport } from "next";
import { Fraunces, Manrope } from "next/font/google";
import { Toaster } from "sonner";
import { absoluteUrl, safeMediaUrl } from "@/lib/utils";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/constants";
import { getBusinessSettings, getPageMeta } from "@/data/repository";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const [settings, homeMeta] = await Promise.all([
    getBusinessSettings(),
    getPageMeta("home"),
  ]);
  const name = settings.business_name || SITE_NAME;
  const image =
    safeMediaUrl(settings.default_seo_image) ||
    "/images/filipino-food-hero.png";
  const favicon = safeMediaUrl(settings.favicon_url);
  return {
    metadataBase: new URL(absoluteUrl()),
    title: {
      default: `${name} | Filipino Food & Pasalubong in Leyte`,
      template: `%s | ${name}`,
    },
    description: homeMeta.description || SITE_DESCRIPTION,
    applicationName: name,
    icons: favicon ? { icon: favicon } : undefined,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_PH",
      siteName: name,
      title: name,
      description: homeMeta.description || SITE_DESCRIPTION,
      images: [
        {
          url: image,
          width: 1536,
          height: 1024,
          alt: `${name} social sharing image`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description: homeMeta.description || SITE_DESCRIPTION,
      images: [image],
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const settings = await getBusinessSettings();
  const theme = String(settings.brand_colors.cocoa ?? "");
  return {
    themeColor: /^#[0-9a-f]{6}$/i.test(theme) ? theme : "#3A2418",
    colorScheme: "light",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-PH"
      data-scroll-behavior="smooth"
      className={`${manrope.variable} ${fraunces.variable}`}
    >
      <body>
        <a
          href="#main-content"
          className="bg-cocoa text-cream fixed top-3 left-4 z-[100] -translate-y-20 rounded-full px-5 py-3 font-bold transition-transform focus:translate-y-0"
        >
          Skip to content
        </a>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
