import type { Metadata } from "next";
import { AcceptInvitation } from "@/components/admin/accept-invitation";
import { BrandLogo } from "@/components/brand-logo";

export const metadata: Metadata = {
  title: "Accept admin invitation",
  robots: { index: false, follow: false },
};

export default function AcceptInvitePage() {
  return (
    <main className="bg-cream grid min-h-screen place-items-center p-5">
      <div className="paper-card w-full max-w-md p-7 sm:p-9">
        <div className="mb-8 flex justify-center">
          <BrandLogo />
        </div>
        <AcceptInvitation />
      </div>
    </main>
  );
}
