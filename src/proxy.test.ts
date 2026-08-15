import { NextRequest } from "next/server";
import { afterEach, describe, expect, it } from "vitest";
import { proxy } from "@/proxy";
describe("admin route protection", () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  afterEach(() => {
    if (previousUrl) process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    else delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (previousKey)
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = previousKey;
    else delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  });
  it("redirects an unauthenticated admin request to sign in", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    const response = await proxy(
      new NextRequest("http://localhost:3000/admin/products"),
    );
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain(
      "/admin/login?next=%2Fadmin%2Fproducts",
    );
  });
});
