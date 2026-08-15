"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { absoluteUrl, safeRedirectPath } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, type ActionState } from "@/lib/validation";

export async function loginAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseConfig())
    return {
      status: "error",
      message: "Admin access is not configured yet. Connect Supabase first.",
    };
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    next: formData.get("next"),
  });
  if (!parsed.success)
    return {
      status: "error",
      message: "Please check your details and try again.",
      errors: parsed.error.flatten().fieldErrors,
    };
  const requestHeaders = await headers();
  const forwarded =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimit(`login:${forwarded}`, 8, 900)))
    return {
      status: "error",
      message: "Too many login attempts. Please wait before trying again.",
    };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });
  if (error || !data.user)
    return {
      status: "error",
      message: "Unable to sign in with those details.",
    };
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active, role")
    .eq("id", data.user.id)
    .maybeSingle();
  if (
    !profile?.is_active ||
    !["owner", "editor", "staff"].includes(String(profile.role))
  ) {
    await supabase.auth.signOut();
    return {
      status: "error",
      message: "Unable to sign in with those details.",
    };
  }
  redirect(safeRedirectPath(parsed.data.next, "/admin"));
}

export async function logoutAction() {
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}

export async function forgotPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const generic =
    "If an authorized account matches that address, password reset instructions will be sent.";
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254)
    return { status: "success", message: generic };
  const requestHeaders = await headers();
  const ip =
    requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!(await checkRateLimit(`forgot:${ip}`, 4, 3600)))
    return { status: "success", message: generic };
  if (hasSupabaseConfig()) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: absoluteUrl("/auth/callback?next=/admin/reset-password"),
    });
  }
  return { status: "success", message: generic };
}

export async function resetPasswordAction(
  _state: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!hasSupabaseConfig())
    return { status: "error", message: "Password reset is not configured." };
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");
  if (
    password.length < 12 ||
    !/[A-Z]/.test(password) ||
    !/[a-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !/[^A-Za-z0-9]/.test(password)
  )
    return {
      status: "error",
      message:
        "Use at least 12 characters with upper/lowercase letters, a number, and a symbol.",
    };
  if (password !== confirm)
    return { status: "error", message: "The passwords do not match." };
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error)
    return {
      status: "error",
      message:
        "The reset link may have expired. Request a new one and try again.",
    };
  return {
    status: "success",
    message: "Password updated. You can now open the dashboard.",
  };
}
