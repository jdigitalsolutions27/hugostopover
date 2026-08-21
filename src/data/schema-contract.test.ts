// @vitest-environment node
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { seedCategories, seedProducts } from "@/data/seed";

const schema = readFileSync(
  resolve("supabase/migrations/202608120001_initial_schema.sql"),
  "utf8",
);
const seed = readFileSync(
  resolve("supabase/migrations/202608120002_seed_content.sql"),
  "utf8",
);
const adminRoles = readFileSync(
  resolve(
    "supabase/migrations/202608130005_staff_role_and_admin_invitations.sql",
  ),
  "utf8",
);
const presentation = readFileSync(
  resolve(
    "supabase/migrations/202608130006_uniform_photo_heroes_remove_gallery.sql",
  ),
  "utf8",
);
const adminActions = readFileSync(resolve("src/actions/admin.ts"), "utf8");
const invitationSender = readFileSync(
  resolve("src/lib/supabase/invite.ts"),
  "utf8",
);
const adminRemoval = readFileSync(
  resolve("supabase/migrations/202608210012_owner_remove_admin_access.sql"),
  "utf8",
);

describe("database and seed contract", () => {
  it("contains every requested product exactly once", () => {
    expect(seedProducts).toHaveLength(30);
    expect(new Set(seedProducts.map((item) => item.slug)).size).toBe(30);
    expect(seedCategories).toHaveLength(7);
    expect(seedProducts.every((item) => (item.price ?? 0) > 0)).toBe(true);
    expect(seedProducts.every((item) => item.needs_review)).toBe(true);
  });
  it("protects category relationships and records important audit changes", () => {
    expect(schema).toContain("on delete restrict");
    expect(schema).toContain("audit_admin_change");
    expect(schema).toContain(
      "'products','categories','business_settings','profiles'",
    );
  });
  it("defines role-aware RLS and owner-only controls", () => {
    expect(schema).toContain(
      "alter table public.products enable row level security",
    );
    expect(schema).toContain('create policy "owners manage settings"');
    expect(schema).toContain('create policy "owners manage profiles"');
    expect(schema).toContain("public.submit_inquiry");
    expect(schema).not.toContain('create policy "public can submit inquiries"');
  });
  it("adds owner-approved invitations and least-privilege Staff policies", () => {
    expect(adminRoles).toContain(
      "alter type public.admin_role add value if not exists 'staff'",
    );
    expect(adminRoles).toContain("public.create_admin_invitation");
    expect(adminRoles).toContain("public.accept_admin_invitation");
    expect(adminRoles).toContain('create policy "staff update products"');
    expect(adminRoles).toContain('create policy "staff update inquiries"');
    expect(adminRoles).not.toContain(
      'create policy "staff manage administrator invitations"',
    );
    expect(invitationSender).toContain('flowType: "implicit"');
    expect(invitationSender).toContain("/admin/accept-invite");
    expect(invitationSender).toContain("persistSession: false");
  });
  it("removes administrator access through an owner-only audited function", () => {
    expect(adminRemoval).toContain("public.remove_admin_user");
    expect(adminRemoval).toContain("if not public.is_owner()");
    expect(adminRemoval).toContain("p_profile_id = auth.uid()");
    expect(adminRemoval).toContain("set is_active = false");
    expect(adminRemoval).toContain("status = 'revoked'");
    expect(adminRemoval).toContain("grant execute");
    expect(adminActions).toMatch(
      /removeAdminUserAction[\s\S]+?assertAdmin\(\["owner"\]\)/,
    );
  });
  it("seeds uniform editable photo heroes and retires Gallery safely", () => {
    expect(presentation).toContain("page_slug in ('menu', 'about', 'visit')");
    expect(presentation).toContain(
      "image_url = '/images/filipino-food-hero.png'",
    );
    expect(presentation).toContain("section_key = 'nav_gallery'");
    expect(presentation).toContain("set status = 'archived'");
    expect(presentation.toLowerCase()).not.toContain(
      "delete from public.gallery_items",
    );
  });
  it("does not seed fabricated testimonials", () => {
    expect(seed.toLowerCase()).not.toContain("insert into public.testimonials");
  });
  it("authorizes mutation handlers, with settings and admin changes owner-only", () => {
    expect(adminActions).toMatch(
      /saveProductAction[\s\S]+?assertAdmin\(\["owner", "editor", "staff"\]\)/,
    );
    expect(adminActions).toMatch(/saveCategoryAction[\s\S]+?assertAdmin\(\)/);
    expect(adminActions).toMatch(
      /updateSettingsAction[\s\S]+?assertAdmin\(\["owner"\]\)/,
    );
    expect(adminActions).toMatch(
      /updateAdminUserAction[\s\S]+?assertAdmin\(\["owner"\]\)/,
    );
    expect(adminActions).toMatch(
      /inviteAdminUserAction[\s\S]+?assertAdmin\(\["owner"\]\)/,
    );
  });
});
