import { describe, expect, it } from "vitest";
import { adminNavigationForRole } from "@/components/admin/admin-shell";

describe("role-aware admin navigation", () => {
  it("limits Staff to operational catalog, media, and inquiry areas", () => {
    const paths = adminNavigationForRole("staff").map((item) => item.href);
    expect(paths).toEqual([
      "/admin",
      "/admin/products",
      "/admin/inquiries",
      "/admin/media",
    ]);
    expect(paths).not.toContain("/admin/users");
    expect(paths).not.toContain("/admin/settings");
    expect(paths).not.toContain("/admin/content");
  });

  it("shows team and business controls only to Owners", () => {
    const owner = adminNavigationForRole("owner").map((item) => item.href);
    const editor = adminNavigationForRole("editor").map((item) => item.href);
    expect(owner).toContain("/admin/users");
    expect(owner).toContain("/admin/settings");
    expect(editor).not.toContain("/admin/users");
    expect(editor).not.toContain("/admin/settings");
  });
});
