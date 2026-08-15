import { describe, expect, it } from "vitest";
import {
  adminInvitationSchema,
  categorySchema,
  contactSchema,
  imageUploadSchema,
  productSchema,
} from "@/lib/validation";

describe("server validation", () => {
  it("requires a reply channel and meaningful inquiry", () => {
    const result = contactSchema.safeParse({
      name: "Ana",
      email: "",
      phone: "",
      subject: "Pie",
      message: "Can I pre-order two pies?",
      website: "",
    });
    expect(result.success).toBe(false);
  });
  it("accepts a valid phone inquiry", () => {
    const result = contactSchema.safeParse({
      name: "Ana",
      email: "",
      phone: "09540000000",
      subject: "Pie availability",
      message: "Can I pre-order two pies?",
      website: "",
    });
    expect(result.success).toBe(true);
  });
  it("rejects malformed product slugs and negative prices", () => {
    const base = {
      name: "Buko Pie",
      slug: "Bad Slug",
      short_description: "A helpful product description.",
      full_description: "A longer helpful product description.",
      category_id: "category",
      main_image_url: "",
      price: -1,
      discounted_price: "",
      price_label: "Ask for price",
      serving_size: "One pie",
      availability: "available",
      status: "draft",
      display_order: 1,
      tags: "pie",
      seo_title: "",
      seo_description: "",
      is_best_seller: false,
      is_featured: false,
      is_new: false,
      is_seasonal: false,
      is_preorder: false,
      needs_review: true,
    };
    expect(productSchema.safeParse(base).success).toBe(false);
  });
  it("accepts complete product create/edit data", () => {
    expect(
      productSchema.safeParse({
        name: "Classic Buko Pie",
        slug: "classic-buko-pie",
        short_description: "A freshly baked Filipino coconut pie.",
        full_description:
          "A freshly baked Filipino coconut pie for sharing and pasalubong.",
        category_id: "category-id",
        main_image_url: "/images/filipino-food-hero.png",
        price: "",
        discounted_price: "",
        price_label: "Ask for price",
        serving_size: "One whole pie",
        availability: "available",
        status: "draft",
        display_order: 4,
        tags: "pie, pasalubong",
        seo_title: "Classic Buko Pie",
        seo_description: "Fresh buko pie from Hugo’s Stop Over in Leyte.",
        is_best_seller: true,
        is_featured: false,
        is_new: false,
        is_seasonal: false,
        is_preorder: true,
        needs_review: true,
      }).success,
    ).toBe(true);
  });
  it("validates category management fields", () => {
    expect(
      categorySchema.safeParse({
        name: "Fresh Pies",
        slug: "fresh-pies",
        description: "Baked pies for sharing.",
        image_url: "",
        display_order: 2,
        is_visible: true,
      }).success,
    ).toBe(true);
    expect(
      categorySchema.safeParse({
        name: "P",
        slug: "Broken Slug",
        description: "",
        image_url: "",
        display_order: -1,
        is_visible: true,
      }).success,
    ).toBe(false);
  });
  it("limits upload type and size", () => {
    expect(
      imageUploadSchema.safeParse({
        filename: "photo.exe",
        mimeType: "application/x-msdownload",
        size: 100,
      }).success,
    ).toBe(false);
    expect(
      imageUploadSchema.safeParse({
        filename: "photo.jpg",
        mimeType: "image/jpeg",
        size: 6 * 1024 * 1024,
      }).success,
    ).toBe(false);
  });
  it("accepts Staff invitations and normalizes the invited email", () => {
    const result = adminInvitationSchema.safeParse({
      email: "  Staff.Member@Example.com ",
      display_name: "Staff Member",
      role: "staff",
    });
    expect(result.success).toBe(true);
    if (result.success)
      expect(result.data.email).toBe("staff.member@example.com");
  });
  it("rejects arbitrary administrator privilege names", () => {
    expect(
      adminInvitationSchema.safeParse({
        email: "user@example.com",
        display_name: "User",
        role: "superuser",
      }).success,
    ).toBe(false);
  });
});
