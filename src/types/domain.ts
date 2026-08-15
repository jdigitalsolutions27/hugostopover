export type AdminRole = "owner" | "editor" | "staff";
export type PublishStatus = "draft" | "published" | "archived";
export type Availability =
  "available" | "unavailable" | "seasonal" | "preorder";
export type InquiryStatus = "new" | "in_progress" | "resolved" | "archived";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string | null;
  display_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  media_id: string | null;
  image_url: string;
  alt_text: string;
  display_order: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  category_id: string;
  category?: Category;
  main_image_url: string | null;
  images: ProductImage[];
  price: number | null;
  discounted_price: number | null;
  price_label: string;
  serving_size: string;
  availability: Availability;
  is_best_seller: boolean;
  is_featured: boolean;
  is_new: boolean;
  is_seasonal: boolean;
  is_preorder: boolean;
  display_order: number;
  tags: string[];
  seo_title: string;
  seo_description: string;
  status: PublishStatus;
  needs_review: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface BusinessSettings {
  business_name: string;
  tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string;
  email: string;
  address: string;
  map_embed_url: string;
  latitude: number | null;
  longitude: number | null;
  opening_hours: Array<{ days: string; hours: string }>;
  holiday_schedule: string;
  facebook_url: string;
  messenger_url: string;
  social_links: Record<string, string>;
  announcement: string;
  show_announcement: boolean;
  currency: string;
  default_seo_image: string | null;
  maintenance_notice: string;
  brand_colors: Record<string, string>;
  needs_confirmation: string[];
}

export interface PageSection {
  id: string;
  page_slug: string;
  section_key: string;
  heading: string;
  eyebrow: string;
  body: string;
  image_url: string | null;
  primary_cta_label: string;
  primary_cta_url: string;
  secondary_cta_label: string;
  secondary_cta_url: string;
  settings: Record<string, unknown>;
  is_visible: boolean;
  display_order: number;
  status: PublishStatus;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  quote: string;
  photo_url: string | null;
  rating: number | null;
  source: string;
  status: PublishStatus;
  display_order: number;
  created_at: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  cta_label: string;
  cta_url: string;
  image_url: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Inquiry {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  product_id: string | null;
  subject: string;
  message: string;
  status: InquiryStatus;
  is_read: boolean;
  private_notes: string;
  created_at: string;
  archived_at: string | null;
}

export interface MediaItem {
  id: string;
  storage_path: string;
  public_url: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  alt_text: string;
  caption: string;
  uploaded_by?: string | null;
  created_at: string;
}

export interface AdminInvitation {
  id: string;
  email: string;
  display_name: string;
  role: AdminRole;
  status: "pending" | "accepted" | "revoked";
  auth_user_id: string | null;
  invited_by: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  album_id: string | null;
  title: string;
  image_url: string;
  alt_text: string;
  caption: string;
  category: "food" | "store" | "customers" | "events" | "behind_the_scenes";
  is_visible: boolean;
  display_order: number;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  slug: string;
  description: string;
  display_order: number;
  is_visible: boolean;
}
