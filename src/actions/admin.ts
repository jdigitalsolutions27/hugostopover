"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { sendAdminInvitationEmail } from "@/lib/supabase/invite";
import {
  adminInvitationSchema,
  categorySchema,
  productSchema,
  type ActionState,
} from "@/lib/validation";
import {
  safeLinkUrl,
  safeMapEmbedUrl,
  safeMediaUrl,
  safeText,
} from "@/lib/utils";

function checked(formData: FormData, name: string) {
  return formData.get(name) === "on" || formData.get(name) === "true";
}

function revalidateProductDetails(...slugs: Array<string | null | undefined>) {
  for (const slug of new Set(slugs.filter(Boolean))) {
    revalidatePath(`/menu/${slug}`);
  }
}

export async function saveProductAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await assertAdmin(["owner", "editor", "staff"]);
  const parsed = productSchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    short_description: formData.get("short_description"),
    full_description: formData.get("full_description"),
    category_id: formData.get("category_id"),
    main_image_url: formData.get("main_image_url") ?? "",
    price: formData.get("price") ?? "",
    discounted_price: formData.get("discounted_price") ?? "",
    price_label: formData.get("price_label") ?? "",
    serving_size: formData.get("serving_size") ?? "",
    availability: formData.get("availability"),
    status: formData.get("status"),
    display_order: formData.get("display_order"),
    tags: formData.get("tags") ?? "",
    seo_title: formData.get("seo_title") ?? "",
    seo_description: formData.get("seo_description") ?? "",
    is_best_seller: checked(formData, "is_best_seller"),
    is_featured: checked(formData, "is_featured"),
    is_new: checked(formData, "is_new"),
    is_seasonal: checked(formData, "is_seasonal"),
    is_preorder: checked(formData, "is_preorder"),
    needs_review: checked(formData, "needs_review"),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: "Please correct the highlighted product details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  const data = parsed.data;
  const supabase = await createSupabaseServerClient();
  const { data: previousProduct } = data.id
    ? await supabase
        .from("products")
        .select("slug")
        .eq("id", data.id)
        .maybeSingle()
    : { data: null };
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("id", data.category_id)
    .is("deleted_at", null)
    .maybeSingle();
  if (!category)
    return {
      status: "error",
      message: "The selected category is no longer available.",
    };
  const payload = {
    name: safeText(data.name, 140),
    slug: data.slug,
    short_description: safeText(data.short_description, 300),
    full_description: safeText(data.full_description, 5000),
    category_id: data.category_id,
    main_image_url: safeMediaUrl(data.main_image_url) || null,
    price: data.price === "" ? null : data.price,
    discounted_price:
      data.discounted_price === "" ? null : data.discounted_price,
    price_label: safeText(data.price_label, 80) || "Ask for price",
    serving_size: safeText(data.serving_size, 120),
    availability: data.availability,
    status: data.status,
    display_order: data.display_order,
    tags: data.tags
      .split(",")
      .map((tag) => safeText(tag, 50))
      .filter(Boolean)
      .slice(0, 20),
    seo_title: safeText(data.seo_title, 70),
    seo_description: safeText(data.seo_description, 170),
    is_best_seller: data.is_best_seller,
    is_featured: data.is_featured,
    is_new: data.is_new,
    is_seasonal: data.is_seasonal,
    is_preorder: data.is_preorder,
    needs_review: data.needs_review,
    published_at: data.status === "published" ? new Date().toISOString() : null,
  };
  const result = data.id
    ? await supabase
        .from("products")
        .update(payload)
        .eq("id", data.id)
        .select("id")
        .single()
    : await supabase.from("products").insert(payload).select("id").single();
  if (result.error)
    return {
      status: "error",
      message:
        result.error.code === "23505"
          ? "That product name or slug is already in use."
          : "The product could not be saved.",
    };
  const productId = String(result.data?.id ?? data.id ?? "");
  const galleryUrls = String(formData.get("gallery_image_urls") ?? "")
    .split(/\r?\n/)
    .map(safeMediaUrl)
    .filter(Boolean)
    .slice(0, 12);
  if (productId) {
    await supabase.from("product_images").delete().eq("product_id", productId);
    if (galleryUrls.length) {
      const { data: galleryMedia } = await supabase
        .from("media")
        .select("id,public_url,alt_text")
        .in("public_url", galleryUrls)
        .is("deleted_at", null);
      const mediaByUrl = new Map(
        (galleryMedia ?? []).map((item) => [String(item.public_url), item]),
      );
      await supabase.from("product_images").insert(
        galleryUrls.map((image_url, index) => {
          const mediaItem = mediaByUrl.get(image_url);
          return {
            product_id: productId,
            media_id: mediaItem?.id ?? null,
            image_url,
            alt_text:
              safeText(mediaItem?.alt_text, 200) ||
              `${data.name} gallery image ${index + 1}`,
            display_order: index + 1,
          };
        }),
      );
    }
  }
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin/products");
  revalidateProductDetails(previousProduct?.slug, data.slug);
  return {
    status: "success",
    message: `${data.name} was saved by ${admin.displayName}.`,
  };
}

export async function duplicateProductAction(formData: FormData) {
  await assertAdmin(["owner", "editor", "staff"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();
  if (!data) return;
  const {
    id: _id,
    created_at: _created,
    updated_at: _updated,
    ...copy
  } = data as Record<string, unknown>;
  void _id;
  void _created;
  void _updated;
  const suffix = Date.now().toString().slice(-6);
  await supabase.from("products").insert({
    ...copy,
    name: `${String(data.name)} (Copy)`,
    slug: `${String(data.slug)}-copy-${suffix}`,
    status: "draft",
    published_at: null,
    display_order: Number(data.display_order) + 1,
  });
  revalidatePath("/admin/products");
}
export async function archiveProductAction(formData: FormData) {
  await assertAdmin(["owner", "editor", "staff"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .update({ status: "archived", deleted_at: new Date().toISOString() })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  revalidatePath("/menu");
  revalidatePath("/admin/products");
  revalidateProductDetails(product?.slug);
}
export async function restoreProductAction(formData: FormData) {
  await assertAdmin(["owner", "editor", "staff"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .update({ status: "draft", deleted_at: null })
    .eq("id", id)
    .select("slug")
    .maybeSingle();
  revalidatePath("/admin/products");
  revalidateProductDetails(product?.slug);
}
export async function deleteProductAction(formData: FormData) {
  await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data: product } = await supabase
    .from("products")
    .select("slug")
    .eq("id", id)
    .maybeSingle();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/menu");
  revalidatePath("/admin/products");
  revalidateProductDetails(product?.slug);
}
export async function bulkAvailabilityAction(formData: FormData) {
  await assertAdmin(["owner", "editor", "staff"]);
  const ids = formData.getAll("selected").map(String).slice(0, 100);
  const availability = String(formData.get("availability") ?? "");
  if (
    !ids.length ||
    !["available", "unavailable", "seasonal", "preorder"].includes(availability)
  )
    return;
  const supabase = await createSupabaseServerClient();
  const { data: products } = await supabase
    .from("products")
    .select("slug")
    .in("id", ids);
  await supabase.from("products").update({ availability }).in("id", ids);
  revalidatePath("/menu");
  revalidatePath("/admin/products");
  revalidateProductDetails(...(products ?? []).map((product) => product.slug));
}
export async function updateProductOrderAction(ids: string[]) {
  await assertAdmin(["owner", "editor", "staff"]);
  if (
    !Array.isArray(ids) ||
    ids.length > 250 ||
    ids.some((id) => !/^[0-9a-f-]{36}$/i.test(id))
  )
    throw new Error("Invalid product order.");
  const supabase = await createSupabaseServerClient();
  const results = await Promise.all(
    ids.map((id, index) =>
      supabase
        .from("products")
        .update({ display_order: index + 1 })
        .eq("id", id),
    ),
  );
  if (results.some((result) => result.error))
    throw new Error("Product order could not be saved.");
  revalidatePath("/");
  revalidatePath("/menu");
  revalidatePath("/admin/products");
}

export async function saveCategoryAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const parsed = categorySchema.safeParse({
    id: formData.get("id") || undefined,
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? "",
    image_url: formData.get("image_url") ?? "",
    display_order: formData.get("display_order") ?? 0,
    is_visible: checked(formData, "is_visible"),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: "Please review the category details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  const { id, ...data } = parsed.data;
  const payload = {
    ...data,
    image_url: safeMediaUrl(data.image_url) || null,
    name: safeText(data.name, 100),
    description: safeText(data.description, 500),
  };
  const supabase = await createSupabaseServerClient();
  const result = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);
  if (result.error)
    return {
      status: "error",
      message:
        result.error.code === "23505"
          ? "That category slug is already used."
          : "The category could not be saved.",
    };
  revalidatePath("/menu");
  revalidatePath("/menu/[slug]", "page");
  revalidatePath("/admin/categories");
  return { status: "success", message: "Category saved." };
}
export async function deleteCategoryAction(formData: FormData) {
  await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("products")
    .select("id", { count: "exact", head: true })
    .eq("category_id", id)
    .is("deleted_at", null);
  if ((count ?? 0) > 0) redirect("/admin/categories?error=category-in-use");
  await supabase
    .from("categories")
    .update({ deleted_at: new Date().toISOString(), is_visible: false })
    .eq("id", id);
  revalidatePath("/menu");
  revalidatePath("/menu/[slug]", "page");
  revalidatePath("/admin/categories");
}

export async function updateSettingsAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await assertAdmin(["owner"]);
  const supabase = await createSupabaseServerClient();
  const color = (name: string, fallback: string) => {
    const value = String(formData.get(name) ?? fallback);
    return /^#[0-9a-fA-F]{6}$/.test(value) ? value : fallback;
  };
  const coordinate = (name: string, min: number, max: number) => {
    const raw = String(formData.get(name) ?? "").trim();
    if (!raw) return null;
    const value = Number(raw);
    return Number.isFinite(value) && value >= min && value <= max
      ? value
      : null;
  };
  const needs = formData.getAll("needs_confirmation").map(String);
  const currencyInput = safeText(formData.get("currency"), 3).toUpperCase();
  const payload = {
    business_name: safeText(formData.get("business_name"), 100),
    tagline: safeText(formData.get("tagline"), 180),
    phone: safeText(formData.get("phone"), 30),
    email: safeText(formData.get("email"), 254),
    address: safeText(formData.get("address"), 300),
    map_embed_url: safeMapEmbedUrl(formData.get("map_embed_url")),
    latitude: coordinate("latitude", -90, 90),
    longitude: coordinate("longitude", -180, 180),
    facebook_url: safeLinkUrl(formData.get("facebook_url")),
    messenger_url: safeLinkUrl(formData.get("messenger_url")),
    social_links: {
      facebook: safeLinkUrl(formData.get("facebook_url")),
      instagram: safeLinkUrl(formData.get("instagram_url")),
      tiktok: safeLinkUrl(formData.get("tiktok_url")),
    },
    currency: /^[A-Z]{3}$/.test(currencyInput) ? currencyInput : "PHP",
    announcement: safeText(formData.get("announcement"), 220),
    show_announcement: checked(formData, "show_announcement"),
    holiday_schedule: safeText(formData.get("holiday_schedule"), 500),
    opening_hours: [
      {
        days: safeText(formData.get("open_days"), 80),
        hours: safeText(formData.get("open_hours"), 80),
      },
      { days: safeText(formData.get("closed_days"), 80), hours: "Closed" },
    ],
    brand_colors: {
      cocoa: color("color_cocoa", "#3A2418"),
      cream: color("color_cream", "#FFF8E9"),
      gold: color("color_gold", "#D99B3D"),
      ube: color("color_ube", "#72457A"),
      leaf: color("color_leaf", "#496B45"),
      beige: color("color_beige", "#EEDFC5"),
      charcoal: color("color_charcoal", "#231F1B"),
    },
    needs_confirmation: needs,
    updated_by: admin.id,
  };
  const assetFields = {
    logo_url: safeMediaUrl(formData.get("logo_url")) || null,
    favicon_url: safeMediaUrl(formData.get("favicon_url")) || null,
    default_seo_image: safeMediaUrl(formData.get("default_seo_image")) || null,
    maintenance_notice: safeText(formData.get("maintenance_notice"), 500),
  };
  if (!payload.business_name || !payload.phone || !payload.address)
    return {
      status: "error",
      message: "Business name, phone, and address are required.",
    };
  const { error } = await supabase
    .from("business_settings")
    .update({ ...payload, ...assetFields })
    .eq("id", 1);
  if (error)
    return {
      status: "error",
      message: "Business settings could not be updated.",
    };
  revalidatePath("/", "layout");
  return { status: "success", message: "Business settings updated." };
}

export async function updateSectionAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id))
    return { status: "error", message: "Invalid section." };
  const supabase = await createSupabaseServerClient();
  const { data: existing } = await supabase
    .from("page_sections")
    .select("page_slug,settings")
    .eq("id", id)
    .maybeSingle();
  if (!existing)
    return { status: "error", message: "Section could not be found." };
  const payload = {
    eyebrow: safeText(formData.get("eyebrow"), 120),
    heading: safeText(formData.get("heading"), 220),
    body: safeText(formData.get("body"), 2000),
    image_url: safeMediaUrl(formData.get("image_url")) || null,
    primary_cta_label: safeText(formData.get("primary_cta_label"), 80),
    primary_cta_url: safeLinkUrl(formData.get("primary_cta_url")),
    secondary_cta_label: safeText(formData.get("secondary_cta_label"), 80),
    secondary_cta_url: safeLinkUrl(formData.get("secondary_cta_url")),
    is_visible: checked(formData, "is_visible"),
    display_order: Math.max(0, Number(formData.get("display_order") ?? 0)),
    status:
      String(formData.get("status")) === "published" ? "published" : "draft",
    settings: [
      "image_alt",
      "translation_label",
      "search_placeholder",
      "all_label",
      "best_label",
      "featured_label",
      "available_label",
      "category_label",
      "results_label",
      "clear_label",
      "empty_heading",
      "empty_body",
      "show_all_label",
      "back_label",
      "availability_label",
      "package_label",
      "price_label",
      "tags_label",
      "inquiry_label",
      "related_heading",
      "available_value",
      "fallback_tags",
      "name_label",
      "phone_label",
      "phone_placeholder",
      "email_label",
      "email_hint",
      "subject_label",
      "message_label",
      "privacy_note",
      "submit_label",
      "sending_label",
      "location_label",
      "hours_label",
      "phone_label",
    ].reduce<Record<string, unknown>>(
      (settings, key) => {
        if (formData.has(key)) settings[key] = safeText(formData.get(key), 220);
        return settings;
      },
      { ...((existing.settings as Record<string, unknown> | null) ?? {}) },
    ),
  };
  if (!id || !payload.heading)
    return { status: "error", message: "A heading is required." };
  const { error } = await supabase
    .from("page_sections")
    .update(payload)
    .eq("id", id);
  if (error) return { status: "error", message: "Section could not be saved." };
  const publicPath =
    existing.page_slug === "home"
      ? "/"
      : existing.page_slug === "product"
        ? "/menu"
        : existing.page_slug === "global"
          ? "/"
          : `/${existing.page_slug}`;
  revalidatePath(
    publicPath,
    existing.page_slug === "global" ? "layout" : "page",
  );
  if (existing.page_slug === "product") {
    revalidatePath("/menu/[slug]", "page");
  }
  revalidatePath("/admin/content");
  return { status: "success", message: "Section saved." };
}

export async function updateInquiryAction(formData: FormData) {
  await assertAdmin(["owner", "editor", "staff"]);
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "new");
  if (!id || !["new", "in_progress", "resolved", "archived"].includes(status))
    return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("inquiries")
    .update({
      status,
      is_read: checked(formData, "is_read"),
      private_notes: safeText(formData.get("private_notes"), 2000),
      archived_at: status === "archived" ? new Date().toISOString() : null,
    })
    .eq("id", id);
  revalidatePath("/admin/inquiries");
  revalidatePath("/admin");
}
export async function deleteInquiryAction(formData: FormData) {
  await assertAdmin(["owner"]);
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("inquiries")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/admin/inquiries");
}

export async function saveTestimonialAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const ratingValue = Number(formData.get("rating") ?? 0);
  const payload = {
    customer_name: safeText(formData.get("customer_name"), 100),
    quote: safeText(formData.get("quote"), 1000),
    photo_url: safeMediaUrl(formData.get("photo_url")) || null,
    rating: ratingValue >= 1 && ratingValue <= 5 ? ratingValue : null,
    source: safeText(formData.get("source"), 120),
    status:
      String(formData.get("status")) === "published" ? "published" : "draft",
    display_order: Math.max(0, Number(formData.get("display_order") ?? 0)),
  };
  if (!payload.customer_name || !payload.quote) return;
  const supabase = await createSupabaseServerClient();
  if (id) await supabase.from("testimonials").update(payload).eq("id", id);
  else await supabase.from("testimonials").insert(payload);
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}
export async function deleteTestimonialAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("testimonials")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/");
  revalidatePath("/admin/testimonials");
}

export async function saveGalleryItemAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const category = String(formData.get("category") ?? "food");
  const payload = {
    album_id: String(formData.get("album_id") ?? "") || null,
    title: safeText(formData.get("title"), 120),
    image_url: safeMediaUrl(formData.get("image_url")),
    alt_text: safeText(formData.get("alt_text"), 200),
    caption: safeText(formData.get("caption"), 500),
    category: [
      "food",
      "store",
      "customers",
      "events",
      "behind_the_scenes",
    ].includes(category)
      ? category
      : "food",
    is_visible: checked(formData, "is_visible"),
    display_order: Math.max(0, Number(formData.get("display_order") ?? 0)),
  };
  if (!payload.image_url || !payload.alt_text) return;
  const supabase = await createSupabaseServerClient();
  if (id) await supabase.from("gallery_items").update(payload).eq("id", id);
  else await supabase.from("gallery_items").insert(payload);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}
export async function deleteGalleryItemAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("gallery_items")
    .update({ deleted_at: new Date().toISOString(), is_visible: false })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function saveGalleryAlbumAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const payload = {
    name: safeText(formData.get("name"), 100),
    slug: String(formData.get("slug") ?? "")
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 100),
    description: safeText(formData.get("description"), 500),
    display_order: Math.max(0, Number(formData.get("display_order") ?? 0)),
    is_visible: checked(formData, "is_visible"),
  };
  if (!payload.name || !payload.slug) return;
  const supabase = await createSupabaseServerClient();
  if (id) await supabase.from("gallery_albums").update(payload).eq("id", id);
  else await supabase.from("gallery_albums").insert(payload);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteGalleryAlbumAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { count } = await supabase
    .from("gallery_items")
    .select("id", { count: "exact", head: true })
    .eq("album_id", id)
    .is("deleted_at", null);
  if ((count ?? 0) > 0) redirect("/admin/gallery?error=album-in-use");
  await supabase
    .from("gallery_albums")
    .update({ deleted_at: new Date().toISOString(), is_visible: false })
    .eq("id", id);
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
}

export async function deleteMediaAction(formData: FormData) {
  await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("media")
    .select("storage_path")
    .eq("id", id)
    .single();
  const { error } = await supabase
    .from("media")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id);
  if (!error && data?.storage_path)
    await supabase.storage.from("media").remove([String(data.storage_path)]);
  revalidatePath("/admin/media");
}
export async function updateMediaAction(formData: FormData) {
  await assertAdmin(["owner", "editor", "staff"]);
  const id = String(formData.get("id") ?? "");
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("media")
    .update({
      alt_text: safeText(formData.get("alt_text"), 200),
      caption: safeText(formData.get("caption"), 500),
    })
    .eq("id", id);
  revalidatePath("/admin/media");
}

export async function updateAdminUserAction(formData: FormData) {
  const current = await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  const requestedRole = String(formData.get("role"));
  const role = ["owner", "editor", "staff"].includes(requestedRole)
    ? requestedRole
    : "staff";
  const isActive = checked(formData, "is_active");
  if (!id || (id === current.id && (!isActive || role !== "owner"))) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("profiles")
    .update({
      role,
      is_active: isActive,
      display_name: safeText(formData.get("display_name"), 100),
    })
    .eq("id", id);
  revalidatePath("/admin/users");
}

export async function removeAdminUserAction(formData: FormData) {
  const current = await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id) || id === current.id) return;
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("remove_admin_user", { p_profile_id: id });
  revalidatePath("/admin/users");
}

export async function restoreAdminUserAction(formData: FormData) {
  await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from("profiles").update({ is_active: true }).eq("id", id);
  revalidatePath("/admin/users");
}

export async function inviteAdminUserAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const current = await assertAdmin(["owner"]);
  const parsed = adminInvitationSchema.safeParse({
    email: formData.get("email"),
    display_name: formData.get("display_name") ?? "",
    role: formData.get("role"),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: "Please review the invitation details.",
      errors: parsed.error.flatten().fieldErrors,
    };
  if (parsed.data.email === current.email.toLowerCase())
    return {
      status: "error",
      message:
        "Your own role is protected. Edit another administrator instead.",
    };
  if (!(await checkRateLimit(`admin-invite:${current.id}`, 10, 3600)))
    return {
      status: "error",
      message: "Too many invitations were requested. Please try again later.",
    };

  const supabase = await createSupabaseServerClient();
  const { data: invitationId, error: invitationError } = await supabase.rpc(
    "create_admin_invitation",
    {
      p_email: parsed.data.email,
      p_display_name: safeText(parsed.data.display_name, 100),
      p_role: parsed.data.role,
    },
  );
  if (invitationError || !invitationId)
    return {
      status: "error",
      message: "The administrator invitation could not be created.",
    };

  const { error: emailError } = await sendAdminInvitationEmail({
    email: parsed.data.email,
    displayName: safeText(parsed.data.display_name, 100),
  });
  if (emailError) {
    await supabase.rpc("revoke_admin_invitation", {
      p_invitation_id: invitationId,
    });
    return {
      status: "error",
      message:
        "The invite email could not be sent. Check Supabase email and redirect settings, then try again.",
    };
  }

  revalidatePath("/admin/users");
  return {
    status: "success",
    message: `Invitation sent to ${parsed.data.email}.`,
  };
}

export async function revokeAdminInvitationAction(formData: FormData) {
  await assertAdmin(["owner"]);
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return;
  const supabase = await createSupabaseServerClient();
  await supabase.rpc("revoke_admin_invitation", { p_invitation_id: id });
  revalidatePath("/admin/users");
}

export async function updatePageSeoAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("pages")
    .update({
      title: safeText(formData.get("title"), 120),
      seo_title: safeText(formData.get("seo_title"), 70),
      seo_description: safeText(formData.get("seo_description"), 170),
      status:
        String(formData.get("status")) === "published" ? "published" : "draft",
    })
    .eq("id", id);
  revalidatePath("/", "layout");
  revalidatePath("/admin/content");
}

export async function savePromotionAction(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get("id") ?? "");
  const payload = {
    title: safeText(formData.get("title"), 180),
    description: safeText(formData.get("description"), 700),
    cta_label: safeText(formData.get("cta_label"), 80),
    cta_url: safeLinkUrl(formData.get("cta_url")),
    image_url: safeMediaUrl(formData.get("image_url")) || null,
    is_active: checked(formData, "is_active"),
    display_order: Math.max(0, Number(formData.get("display_order") ?? 0)),
  };
  if (!payload.title) return;
  const supabase = await createSupabaseServerClient();
  if (id) await supabase.from("promotions").update(payload).eq("id", id);
  else await supabase.from("promotions").insert(payload);
  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function deletePromotionAction(formData: FormData) {
  await assertAdmin();
  const supabase = await createSupabaseServerClient();
  await supabase
    .from("promotions")
    .update({ is_active: false, deleted_at: new Date().toISOString() })
    .eq("id", String(formData.get("id") ?? ""));
  revalidatePath("/");
  revalidatePath("/admin/content");
}
