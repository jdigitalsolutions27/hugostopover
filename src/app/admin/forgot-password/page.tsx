import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotPasswordForm } from "@/components/admin/auth-form";
export const metadata: Metadata = {
  title: "Reset admin password",
  robots: { index: false },
};
export default function ForgotPasswordPage() {
  return (
    <main className="bg-cream grid min-h-screen place-items-center p-5">
      <div className="paper-card w-full max-w-md p-7 sm:p-9">
        <Link
          href="/admin/login"
          className="text-muted inline-flex items-center gap-2 text-sm font-bold"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
        <h1 className="display-title text-cocoa mt-7 text-4xl">
          Reset your password.
        </h1>
        <p className="text-muted mt-3 text-sm leading-6">
          For privacy, the response is the same whether or not an authorized
          account exists.
        </p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
