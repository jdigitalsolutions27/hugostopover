import type { Metadata } from "next";
import { ResetPasswordForm } from "@/components/admin/auth-form";
export const metadata: Metadata = {
  title: "Choose a new admin password",
  robots: { index: false },
};
export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ invite?: string }>;
}) {
  const invited = (await searchParams).invite === "1";
  return (
    <main className="bg-cream grid min-h-screen place-items-center p-5">
      <div className="paper-card w-full max-w-md p-7 sm:p-9">
        <h1 className="display-title text-cocoa text-4xl">
          {invited
            ? "Create your admin password."
            : "Choose a strong password."}
        </h1>
        <p className="text-muted mt-3 text-sm leading-6">
          {invited
            ? "Your invitation is verified. Choose a private password that only you know."
            : "Use at least 12 characters with upper/lowercase letters, a number, and a symbol."}
        </p>
        <ResetPasswordForm />
      </div>
    </main>
  );
}
