import "server-only";

import { cache } from "react";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  seedBusinessSettings,
  seedCategories,
  seedPageSections,
  seedProducts,
} from "@/data/seed";
import type {
  BusinessSettings,
  Category,
  GalleryItem,
  GalleryAlbum,
  Inquiry,
  MediaItem,
  PageSection,
  Product,
  Promotion,
  Testimonial,
} from "@/types/domain";

function productFromRow(row: Record<string, unknown>): Product {
  const category = row.category as Category | undefined;
  return {
    ...(row as unknown as Product),
    category,
    images: Array.isArray(row.product_images)
      ? (row.product_images as Product["images"])
      : [],
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
  };
}

export const getCategories = cache(
  async (includeHidden = false): Promise<Category[]> => {
    if (!hasSupabaseConfig())
      return seedCategories.filter((c) => includeHidden || c.is_visible);
    try {
      const supabase = includeHidden
        ? await createSupabaseServerClient()
        : createSupabasePublicClient();
      let query = supabase
        .from("categories")
        .select("*")
        .is("deleted_at", null)
        .order("display_order");
      if (!includeHidden) query = query.eq("is_visible", true);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Category[];
    } catch (error) {
      console.error("Category query failed", error);
      return seedCategories;
    }
  },
);

export const getProducts = cache(
  async (includeDrafts = false): Promise<Product[]> => {
    if (!hasSupabaseConfig()) return seedProducts;
    try {
      const supabase = includeDrafts
        ? await createSupabaseServerClient()
        : createSupabasePublicClient();
      let query = supabase
        .from("products")
        .select("*, category:categories(*), product_images(*)")
        .order("display_order");
      if (!includeDrafts)
        query = query.eq("status", "published").is("deleted_at", null);
      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []).map((row) =>
        productFromRow(row as Record<string, unknown>),
      );
    } catch (error) {
      console.error("Product query failed", error);
      return seedProducts;
    }
  },
);

export const getProductBySlug = cache(async (slug: string) => {
  const products = await getProducts();
  return products.find((product) => product.slug === slug) ?? null;
});

export const getProductById = cache(async (id: string) => {
  const products = await getProducts(true);
  return products.find((product) => product.id === id) ?? null;
});

export const getBusinessSettings = cache(
  async (): Promise<BusinessSettings> => {
    if (!hasSupabaseConfig()) return seedBusinessSettings;
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("business_settings")
        .select("*")
        .eq("id", 1)
        .single();
      if (error) throw error;
      const {
        id: _id,
        updated_at: _updated,
        ...settings
      } = data as Record<string, unknown>;
      void _id;
      void _updated;
      return settings as unknown as BusinessSettings;
    } catch (error) {
      console.error("Settings query failed", error);
      return seedBusinessSettings;
    }
  },
);

export const getPageSections = cache(
  async (pageSlug: string): Promise<PageSection[]> => {
    if (!hasSupabaseConfig())
      return seedPageSections.filter(
        (section) => section.page_slug === pageSlug,
      );
    try {
      const supabase = createSupabasePublicClient();
      const { data, error } = await supabase
        .from("page_sections")
        .select("*")
        .eq("page_slug", pageSlug)
        .eq("is_visible", true)
        .eq("status", "published")
        .order("display_order");
      if (error) throw error;
      return (data ?? []) as PageSection[];
    } catch (error) {
      console.error("Page section query failed", error);
      return seedPageSections.filter(
        (section) => section.page_slug === pageSlug,
      );
    }
  },
);

export const getPageMeta = cache(async (slug: string) => {
  const defaults: Record<string, { title: string; description: string }> = {
    home: {
      title: "Hugo’s Stop Over | Filipino Food & Pasalubong in Leyte",
      description:
        "Filipino comfort food and pasalubong near Sta. Fe and Alangalang, Leyte.",
    },
    menu: {
      title: "Menu & Pasalubong",
      description:
        "Explore Filipino meals, pies, kakanin, desserts, drinks, and pasalubong from Hugo’s Stop Over.",
    },
    about: {
      title: "Our Story",
      description: "Meet Hugo’s Stop Over near Sta. Fe and Alangalang, Leyte.",
    },
    visit: {
      title: "Visit & Contact",
      description:
        "Find hours, directions, contact information, and the inquiry form for Hugo’s Stop Over.",
    },
  };
  const fallback = defaults[slug] ?? {
    title: "Hugo’s Stop Over",
    description: "Filipino comfort food and pasalubong in Leyte.",
  };
  if (!hasSupabaseConfig()) return fallback;
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("pages")
    .select("seo_title,seo_description,title,status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  return data
    ? {
        title: String(data.seo_title || data.title),
        description: String(data.seo_description || fallback.description),
      }
    : fallback;
});

export const getTestimonials = cache(
  async (includeDrafts = false): Promise<Testimonial[]> => {
    if (!hasSupabaseConfig()) return [];
    const supabase = includeDrafts
      ? await createSupabaseServerClient()
      : createSupabasePublicClient();
    let query = supabase
      .from("testimonials")
      .select("*")
      .is("deleted_at", null)
      .order("display_order");
    if (!includeDrafts) query = query.eq("status", "published");
    const { data } = await query;
    return (data ?? []) as Testimonial[];
  },
);

export const getPromotions = cache(async (): Promise<Promotion[]> => {
  if (!hasSupabaseConfig()) return [];
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("promotions")
    .select("*")
    .eq("is_active", true)
    .is("deleted_at", null);
  return (data ?? []) as Promotion[];
});

export const getGalleryItems = cache(
  async (includeHidden = false): Promise<GalleryItem[]> => {
    if (!hasSupabaseConfig()) return [];
    const supabase = includeHidden
      ? await createSupabaseServerClient()
      : createSupabasePublicClient();
    let query = supabase
      .from("gallery_items")
      .select("*")
      .is("deleted_at", null)
      .order("display_order");
    if (!includeHidden) query = query.eq("is_visible", true);
    const { data } = await query;
    return (data ?? []) as GalleryItem[];
  },
);

export const getGalleryAlbums = cache(async (): Promise<GalleryAlbum[]> => {
  if (!hasSupabaseConfig()) return [];
  const supabase = createSupabasePublicClient();
  const { data } = await supabase
    .from("gallery_albums")
    .select("*")
    .is("deleted_at", null)
    .order("display_order");
  return (data ?? []) as GalleryAlbum[];
});

export async function getInquiries(): Promise<Inquiry[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("inquiries")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as Inquiry[];
}

export async function getMedia(): Promise<MediaItem[]> {
  if (!hasSupabaseConfig()) return [];
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .is("deleted_at", null)
    .order("created_at", { ascending: false });
  return (data ?? []) as MediaItem[];
}
