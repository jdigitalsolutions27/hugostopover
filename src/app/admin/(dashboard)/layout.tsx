import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/admin-shell";
import { requireAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s | Hugo’s Admin" },
  robots: { index: false, follow: false },
};
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return <AdminShell session={session}>{children}</AdminShell>;
}
