export const FACEBOOK_URL =
  "https://www.facebook.com/profile.php?id=61557086043030";
export const MESSENGER_URL = "https://m.me/61557086043030";
export const DEFAULT_HERO_IMAGE = "/images/filipino-food-hero.png";
export const DEFAULT_STORY_IMAGE = "/images/filipino-food-story.webp";
export const PHONE_DISPLAY = "(0954) 980 9670";
export const PHONE_HREF = "+639549809670";
export const SITE_NAME = "Hugo’s Stop Over";
export const SITE_DESCRIPTION =
  "Filipino comfort food, freshly baked pies, kakanin, cold desserts, and Leyte pasalubong near the Sta. Fe–Alangalang boundary.";

export const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/about", label: "Our Story" },
  { href: "/visit", label: "Visit Us" },
] as const;

export const CATEGORY_ART: Record<string, { emoji: string; tone: string }> = {
  "best-sellers-main-dishes": {
    emoji: "🍜",
    tone: "from-[#5c2f1b] to-[#a65f27]",
  },
  pies: { emoji: "🥧", tone: "from-[#b46c2f] to-[#e8b45c]" },
  "cold-desserts": { emoji: "🍧", tone: "from-[#72457a] to-[#c58ebc]" },
  "kakanin-filipino-snacks": {
    emoji: "🍠",
    tone: "from-[#6d3a70] to-[#a86b8e]",
  },
  "shakes-refreshments": { emoji: "🥤", tone: "from-[#496b45] to-[#8dad73]" },
  pasalubong: { emoji: "🛍️", tone: "from-[#8b5a2b] to-[#d99b3d]" },
  "bundles-offers": { emoji: "🎁", tone: "from-[#7a3d34] to-[#d78b63]" },
};
