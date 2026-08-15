import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SettingsForm } from "@/components/admin/settings-form";
import { getBusinessSettings, getMedia } from "@/data/repository";
import { requireAdmin } from "@/lib/auth";
export default async function SettingsPage() {
  await requireAdmin(["owner"]);
  const [settings, media] = await Promise.all([
    getBusinessSettings(),
    getMedia(),
  ]);
  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow="Owner controls"
        title="Business settings"
        description="Manage brand identity, contact details, location, hours, announcements, social links, and owner-confirmation flags."
      />
      <SettingsForm settings={settings} media={media} />
    </div>
  );
}
