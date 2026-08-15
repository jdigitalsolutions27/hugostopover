import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { LoginForm } from "@/components/admin/auth-form";
import { getAdminSession } from "@/lib/auth";
import { safeRedirectPath } from "@/lib/utils";
export const metadata: Metadata = {
  title: "Admin sign in",
  robots: { index: false, follow: false },
};
export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  if (await getAdminSession()) redirect("/admin");
  const query = await searchParams;
  const nextPath = safeRedirectPath(query.next, "/admin");
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_.95fr]">
      <section className="bg-cocoa text-cream relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="native-pattern absolute inset-0 opacity-40" />
        <BrandLogo className="[&_span]:text-cream relative" />
        <div className="relative max-w-xl">
          <p className="eyebrow !text-gold">Owner content studio</p>
          <h1 className="display-title mt-4 text-6xl leading-[.98]">
            Keep every stop fresh and inviting.
          </h1>
          <p className="text-cream/65 mt-6 text-base leading-8">
            Products, pages, photos, inquiries, and business information—all
            managed securely in one place.
          </p>
        </div>
        <p className="text-cream/50 relative flex items-center gap-2 text-xs">
          <ShieldCheck className="text-gold size-4" />
          Protected by Supabase authentication and database roles.
        </p>
      </section>
      <section className="bg-cream flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="text-muted inline-flex items-center gap-2 text-sm font-bold"
          >
            <ArrowLeft className="size-4" />
            Back to website
          </Link>
          <div className="paper-card mt-8 p-7 sm:p-9">
            <BrandLogo />
            <h2 className="display-title text-cocoa mt-8 text-4xl">
              Welcome back.
            </h2>
            <p className="text-muted mt-3 text-sm leading-6">
              Sign in with an authorized admin account. Public sign-up is
              disabled.
            </p>
            <LoginForm nextPath={nextPath} />
          </div>
        </div>
      </section>
    </main>
  );
}
