import type {
  BusinessSettings,
  Category,
  PageSection,
  Product,
} from "@/types/domain";
import { FACEBOOK_URL, MESSENGER_URL } from "@/lib/constants";
import { slugify } from "@/lib/utils";

const now = "2026-08-12T00:00:00.000+08:00";

const categorySeed = [
  [
    "best-sellers-main-dishes",
    "Best Sellers & Main Dishes",
    "Hearty Filipino favorites made for a satisfying stopover.",
  ],
  [
    "pies",
    "Freshly Baked Pies",
    "Golden, generous pies for sharing or taking home.",
  ],
  [
    "cold-desserts",
    "Cold Desserts",
    "Creamy, refreshing Filipino merienda classics.",
  ],
  [
    "kakanin-filipino-snacks",
    "Kakanin & Filipino Snacks",
    "Traditional rice cakes and nostalgic local treats.",
  ],
  [
    "shakes-refreshments",
    "Shakes & Refreshments",
    "Cool drinks, fresh juices, and brewed coffee.",
  ],
  [
    "pasalubong",
    "Pasalubong",
    "Thoughtful Leyte take-home treats for family and friends.",
  ],
  [
    "bundles-offers",
    "Bundles & Offers",
    "Curated boxes that make sharing easier.",
  ],
] as const;

export const seedCategories: Category[] = categorySeed.map(
  ([slug, name, description], index) => ({
    id: `category-${slug}`,
    slug,
    name,
    description,
    image_url: null,
    display_order: index + 1,
    is_visible: true,
    created_at: now,
    updated_at: now,
  }),
);

const productsByCategory: Record<string, string[]> = {
  "best-sellers-main-dishes": [
    "Authentic Iloilo La Paz Batchoy",
    "Pansit Palabok",
  ],
  pies: [
    "Classic Buko Pie",
    "Ube Buko Pie",
    "Classic Apple Pie",
    "Heart-Shaped Buko Pie",
  ],
  "cold-desserts": [
    "Buko Halo-Halo",
    "Special Halo-Halo",
    "Mais con Yelo",
    "Leche Flan",
  ],
  "kakanin-filipino-snacks": [
    "Traditional Puto Bumbong",
    "Special Puto Bumbong with Leche Flan",
    "Pichi-Pichi",
    "Cheesy Pichi-Pichi",
    "Ube Cheese Buchi",
    "Sweet Potato Buchi",
    "Special Binagol",
    "Pastillas",
  ],
  "shakes-refreshments": [
    "Buko Shake",
    "Ube Buko Shake",
    "Pure Buko Juice",
    "Fresh-Squeezed Lemonade",
    "LemonTito Calamansi Juice",
    "Brewed Coffee",
  ],
  pasalubong: [
    "Pure Cacao Tablea",
    "Kobe’s Calamansi Concentrate",
    "Banana Chips",
    "Kamote Chips",
    "Karlang Chips",
  ],
  "bundles-offers": ["Assorted Kakanin Box"],
};

const descriptions: Record<string, string> = {
  "Authentic Iloilo La Paz Batchoy":
    "A warming bowl of noodles, savory broth, tender pork, crisp chicharon, and fresh spring onions.",
  "Pansit Palabok":
    "Rice noodles dressed in rich savory sauce and finished with classic Filipino toppings.",
  "Classic Buko Pie":
    "A golden, home-style pie filled with young coconut and a delicately creamy custard.",
  "Ube Buko Pie":
    "Our buko pie with a distinctly Filipino ube twist—creamy, fragrant, and made for sharing.",
  "Special Halo-Halo":
    "A colorful mix of Filipino sweets, shaved ice, milk, and rich toppings for a refreshing treat.",
  "Traditional Puto Bumbong":
    "Purple rice delicately steamed, then served with coconut, sugar, and a comforting buttery finish.",
  "Assorted Kakanin Box":
    "A shareable selection of Filipino merienda favorites, thoughtfully packed for gatherings and pasalubong.",
};

// Provisional launch prices only. Every seeded product remains marked for
// owner review, and the admin can replace or clear these amounts at any time.
const draftPricesBySlug: Record<string, number> = {
  "authentic-iloilo-la-paz-batchoy": 120,
  "pansit-palabok": 100,
  "classic-buko-pie": 300,
  "ube-buko-pie": 350,
  "classic-apple-pie": 350,
  "heart-shaped-buko-pie": 380,
  "buko-halo-halo": 120,
  "special-halo-halo": 150,
  "mais-con-yelo": 90,
  "leche-flan": 100,
  "traditional-puto-bumbong": 80,
  "special-puto-bumbong-with-leche-flan": 130,
  "pichi-pichi": 100,
  "cheesy-pichi-pichi": 120,
  "ube-cheese-buchi": 120,
  "sweet-potato-buchi": 100,
  "special-binagol": 90,
  pastillas: 100,
  "buko-shake": 90,
  "ube-buko-shake": 110,
  "pure-buko-juice": 70,
  "fresh-squeezed-lemonade": 70,
  "lemontito-calamansi-juice": 80,
  "brewed-coffee": 60,
  "pure-cacao-tablea": 150,
  "kobe-s-calamansi-concentrate": 180,
  "banana-chips": 100,
  "kamote-chips": 100,
  "karlang-chips": 120,
  "assorted-kakanin-box": 350,
};

export const seedProducts: Product[] = Object.entries(
  productsByCategory,
).flatMap(([categorySlug, names], categoryIndex) =>
  names.map((name, productIndex) => {
    const category = seedCategories.find((item) => item.slug === categorySlug)!;
    const isBestSeller = [
      "Authentic Iloilo La Paz Batchoy",
      "Classic Buko Pie",
      "Special Halo-Halo",
      "Traditional Puto Bumbong",
    ].includes(name);
    const isFeatured = [
      "Authentic Iloilo La Paz Batchoy",
      "Ube Buko Pie",
      "Special Puto Bumbong with Leche Flan",
      "Assorted Kakanin Box",
    ].includes(name);
    const shortDescription =
      descriptions[name] ??
      `A carefully prepared Hugo’s Stop Over favorite with familiar Filipino flavors—ideal for merienda, sharing, or pasalubong.`;

    return {
      id: `product-${slugify(name)}`,
      name,
      slug: slugify(name),
      short_description: shortDescription,
      full_description: `${shortDescription} This is helpful draft copy and should be reviewed by the owner for exact ingredients, portions, and preparation details.`,
      category_id: category.id,
      category,
      main_image_url:
        name === "Authentic Iloilo La Paz Batchoy"
          ? "/images/filipino-food-story.webp"
          : null,
      images: [],
      price: draftPricesBySlug[slugify(name)] ?? null,
      discounted_price: null,
      price_label: "Ask for price",
      serving_size: "Serving or package size to be confirmed",
      availability: "available",
      is_best_seller: isBestSeller,
      is_featured: isFeatured,
      is_new: name === "Heart-Shaped Buko Pie",
      is_seasonal: false,
      is_preorder:
        name === "Heart-Shaped Buko Pie" || name === "Assorted Kakanin Box",
      display_order: categoryIndex * 20 + productIndex + 1,
      tags: [category.name, ...(isBestSeller ? ["Best Seller"] : [])],
      seo_title: `${name} | Hugo’s Stop Over Leyte`,
      seo_description: `${shortDescription} Ask about availability at Hugo’s Stop Over near Sta. Fe and Alangalang, Leyte.`,
      status: "published",
      needs_review: true,
      published_at: now,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    } satisfies Product;
  }),
);

export const seedBusinessSettings: BusinessSettings = {
  business_name: "Hugo’s Stop Over",
  tagline: "Your Favorite Filipino Comfort Food Stopover",
  logo_url: null,
  favicon_url: null,
  phone: "(0954) 980 9670",
  email: "",
  address: "Boundary of Sta. Fe and Alangalang, Leyte, Philippines",
  map_embed_url:
    "https://www.google.com/maps?q=Boundary%20of%20Sta.%20Fe%20and%20Alangalang%2C%20Leyte&output=embed",
  latitude: null,
  longitude: null,
  opening_hours: [
    { days: "Tuesday–Sunday", hours: "7:00 AM–8:30 PM" },
    { days: "Monday", hours: "Closed" },
  ],
  holiday_schedule:
    "Please message the Facebook page to confirm holiday hours.",
  facebook_url: FACEBOOK_URL,
  messenger_url: MESSENGER_URL,
  social_links: { facebook: FACEBOOK_URL },
  announcement: "Freshly made Filipino favorites and pasalubong—stop by today.",
  show_announcement: true,
  currency: "PHP",
  default_seo_image: "/images/filipino-food-hero.png",
  maintenance_notice: "",
  brand_colors: {
    cocoa: "#3A2418",
    cream: "#FFF8E9",
    gold: "#D99B3D",
    ube: "#72457A",
    leaf: "#496B45",
    beige: "#EEDFC5",
    charcoal: "#231F1B",
  },
  needs_confirmation: [
    "phone",
    "address",
    "opening_hours",
    "map_location",
    "business_story",
    "product_copy",
    "prices",
    "images",
  ],
};

export const seedPageSections: PageSection[] = [
  {
    id: "section-global-footer-verse",
    page_slug: "global",
    section_key: "footer_verse",
    eyebrow: "Our guiding verse",
    heading: "Proverbs 3:5–6",
    body: "Trust in the LORD with all thine heart; and lean not unto thine own understanding. In all thy ways acknowledge him, and he shall direct thy paths.",
    image_url: null,
    primary_cta_label: "",
    primary_cta_url: "",
    secondary_cta_label: "",
    secondary_cta_url: "",
    settings: { translation_label: "King James Version (KJV)" },
    is_visible: true,
    display_order: 21,
    status: "published",
  },
  {
    id: "section-home-hero",
    page_slug: "home",
    section_key: "hero",
    eyebrow: "Merienda • Meals • Pasalubong",
    heading: "Your Favorite Filipino Comfort Food Stopover",
    body: "Take a break and enjoy authentic La Paz Batchoy, freshly baked pies, traditional kakanin, refreshing desserts, and local pasalubong favorites.",
    image_url: "/images/filipino-food-hero.png",
    primary_cta_label: "Explore Our Menu",
    primary_cta_url: "/menu",
    secondary_cta_label: "Message Us on Facebook",
    secondary_cta_url: MESSENGER_URL,
    settings: {
      image_alt:
        "La Paz Batchoy, buko pie, halo-halo, and Filipino kakanin on a warm table",
      location_label: "Find us",
      hours_label: "Opening hours",
      phone_label: "Call us",
    },
    is_visible: true,
    display_order: 1,
    status: "published",
  },
  {
    id: "section-home-about",
    page_slug: "home",
    section_key: "about_preview",
    eyebrow: "A warm Leyte welcome",
    heading: "Good food makes every journey better",
    body: "Hugo’s Stop Over brings comforting Filipino flavors together in one friendly roadside destination. This is draft story copy awaiting the owner’s official history.",
    image_url: "/images/filipino-food-story.webp",
    primary_cta_label: "Discover Our Story",
    primary_cta_url: "/about",
    secondary_cta_label: "",
    secondary_cta_url: "",
    settings: {
      image_alt: "Filipino food served at Hugo’s Stop Over",
    },
    is_visible: true,
    display_order: 5,
    status: "published",
  },
  {
    id: "section-about-story",
    page_slug: "about",
    section_key: "story",
    eyebrow: "Our story",
    heading: "A place to pause, eat well, and bring something home",
    body: "Draft for owner review: Hugo’s Stop Over is a welcoming food stop near the Sta. Fe–Alangalang boundary, serving comforting meals, merienda, desserts, and pasalubong. Replace this text with the business’s official founding story and the people behind it.",
    image_url: "/images/filipino-food-story.webp",
    primary_cta_label: "Plan Your Visit",
    primary_cta_url: "/visit",
    secondary_cta_label: "",
    secondary_cta_url: "",
    settings: {
      image_alt: "A Filipino food spread representing Hugo’s Stop Over",
    },
    is_visible: true,
    display_order: 1,
    status: "published",
  },
];
