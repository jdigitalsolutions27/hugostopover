import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { AdminRole } from "@/types/domain";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AdminSession {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
}

export const getAdminSession = cache(async (): Promise<AdminSession | null> => {
  if (!hasSupabaseConfig()) return null;
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, role, is_active")
    .eq("id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  if (!profile || !["owner", "editor", "staff"].includes(String(profile.role)))
    return null;

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: String(profile.display_name || user.email || "Administrator"),
    role: profile.role as AdminRole,
  };
});

export async function requireAdmin(
  roles: AdminRole[] = ["owner", "editor", "staff"],
) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  if (!roles.includes(session.role)) redirect("/admin?error=permission");
  return session;
}

export async function assertAdmin(roles: AdminRole[] = ["owner", "editor"]) {
  const session = await getAdminSession();
  if (!session) throw new Error("Unauthorized");
  if (!roles.includes(session.role)) throw new Error("Forbidden");
  return session;
}
