import { z } from "zod";

// The site enforces a strict Content Security Policy without unsafe-eval.
// Disable Zod's optional JIT probe so validation stays CSP-clean in Firefox
// and other browsers that report blocked dynamic function construction.
z.config({ jitless: true });

const optionalUrl = z.union([
  z.literal(""),
  z.string().url("Enter a valid URL."),
]);

export const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(254),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(128),
  next: z.string().optional(),
});

export const adminInvitationSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Enter a valid email address.")
    .max(254),
  display_name: z.string().trim().max(100),
  role: z.enum(["owner", "editor", "staff"]),
});

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your name.").max(100),
    email: z.union([
      z.literal(""),
      z.string().trim().email("Enter a valid email.").max(254),
    ]),
    phone: z.string().trim().max(30),
    subject: z.string().trim().min(3, "Please add a short subject.").max(120),
    message: z
      .string()
      .trim()
      .min(10, "Tell us a little more so we can help.")
      .max(2000),
    product_id: z.string().max(100).optional(),
    website: z.string().max(0, "Spam detected."),
  })
  .refine((data) => Boolean(data.email || data.phone), {
    message: "Add an email address or phone number so we can reply.",
    path: ["email"],
  });

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(140),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase URL slug."),
  short_description: z.string().trim().min(10).max(300),
  full_description: z.string().trim().min(10).max(5000),
  category_id: z.string().min(1, "Select a category."),
  main_image_url: optionalUrl.or(z.string().startsWith("/")),
  price: z.union([z.literal(""), z.coerce.number().min(0).max(1_000_000)]),
  discounted_price: z.union([
    z.literal(""),
    z.coerce.number().min(0).max(1_000_000),
  ]),
  price_label: z.string().trim().max(80),
  serving_size: z.string().trim().max(120),
  availability: z.enum(["available", "unavailable", "seasonal", "preorder"]),
  status: z.enum(["draft", "published", "archived"]),
  display_order: z.coerce.number().int().min(0).max(10000),
  tags: z.string().max(500),
  seo_title: z.string().trim().max(70),
  seo_description: z.string().trim().max(170),
  is_best_seller: z.boolean(),
  is_featured: z.boolean(),
  is_new: z.boolean(),
  is_seasonal: z.boolean(),
  is_preorder: z.boolean(),
  needs_review: z.boolean(),
});

export const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().trim().min(2).max(100),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  description: z.string().trim().max(500),
  image_url: optionalUrl.or(z.string().startsWith("/")),
  display_order: z.coerce.number().int().min(0).max(10000),
  is_visible: z.boolean(),
});

export const imageUploadSchema = z.object({
  filename: z
    .string()
    .min(1)
    .max(180)
    .regex(/^[a-zA-Z0-9._-]+$/),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  size: z
    .number()
    .int()
    .positive()
    .max(5 * 1024 * 1024),
});

export type ActionState = {
  status: "idle" | "success" | "error";
  message: string;
  errors?: Record<string, string[]>;
};

export const initialActionState: ActionState = { status: "idle", message: "" };
