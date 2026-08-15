"use client";
import { AlertTriangle, LoaderCircle, Save } from "lucide-react";
import { useActionState } from "react";
import { updateSettingsAction } from "@/actions/admin";
import { MediaPicker } from "@/components/admin/media-picker";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/validation";
import type { BusinessSettings, MediaItem } from "@/types/domain";
export function SettingsForm({
  settings,
  media = [],
}: {
  settings: BusinessSettings;
  media?: MediaItem[];
}) {
  const [state, action, pending] = useActionState(
    updateSettingsAction,
    initialActionState,
  );
  const hours = settings.opening_hours;
  return (
    <form action={action} className="space-y-6">
      <Panel title="Business identity">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business name">
            <input
              name="business_name"
              className="admin-field"
              defaultValue={settings.business_name}
              required
            />
          </Field>
          <Field label="Tagline">
            <input
              name="tagline"
              className="admin-field"
              defaultValue={settings.tagline}
            />
          </Field>
          <Field label="Maintenance notice">
            <input
              name="maintenance_notice"
              className="admin-field"
              defaultValue={settings.maintenance_notice}
            />
          </Field>
        </div>
        <div className="border-cocoa/10 mt-6 grid gap-6 border-t pt-6 lg:grid-cols-3">
          <MediaPicker
            name="logo_url"
            media={media}
            value={settings.logo_url}
            label="Business logo"
          />
          <MediaPicker
            name="favicon_url"
            media={media}
            value={settings.favicon_url}
            label="Browser icon"
            hint="Use a square image for the best result."
          />
          <MediaPicker
            name="default_seo_image"
            media={media}
            value={settings.default_seo_image}
            label="Default social image"
            hint="Used when a page or product has no specific image."
          />
        </div>
      </Panel>
      <Panel title="Contact & location">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Phone number">
            <input
              name="phone"
              className="admin-field"
              defaultValue={settings.phone}
              required
            />
          </Field>
          <Field label="Email">
            <input
              name="email"
              type="email"
              className="admin-field"
              defaultValue={settings.email}
            />
          </Field>
          <Field
            label="Currency code"
            hint="Use PHP for Philippine peso pricing."
          >
            <input
              name="currency"
              className="admin-field uppercase"
              defaultValue={settings.currency}
              minLength={3}
              maxLength={3}
              required
            />
          </Field>
          <Field label="Facebook URL">
            <input
              name="facebook_url"
              type="url"
              className="admin-field"
              defaultValue={settings.facebook_url}
            />
          </Field>
          <Field label="Messenger URL">
            <input
              name="messenger_url"
              type="url"
              className="admin-field"
              defaultValue={settings.messenger_url}
            />
          </Field>
          <Field label="Instagram URL">
            <input
              name="instagram_url"
              type="url"
              className="admin-field"
              defaultValue={settings.social_links.instagram ?? ""}
            />
          </Field>
          <Field label="TikTok URL">
            <input
              name="tiktok_url"
              type="url"
              className="admin-field"
              defaultValue={settings.social_links.tiktok ?? ""}
            />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Address">
            <textarea
              name="address"
              className="admin-field min-h-24"
              defaultValue={settings.address}
              required
            />
          </Field>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Latitude">
            <input
              name="latitude"
              type="number"
              step="0.000001"
              className="admin-field"
              defaultValue={settings.latitude ?? ""}
            />
          </Field>
          <Field label="Longitude">
            <input
              name="longitude"
              type="number"
              step="0.000001"
              className="admin-field"
              defaultValue={settings.longitude ?? ""}
            />
          </Field>
        </div>
        <div className="mt-5">
          <Field
            label="Google Maps embed URL"
            hint="Paste only a trusted google.com/maps embed URL."
          >
            <input
              name="map_embed_url"
              className="admin-field"
              defaultValue={settings.map_embed_url}
            />
          </Field>
        </div>
      </Panel>
      <Panel title="Hours & announcements">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Open days">
            <input
              name="open_days"
              className="admin-field"
              defaultValue={hours[0]?.days ?? "Tuesday–Sunday"}
            />
          </Field>
          <Field label="Open hours">
            <input
              name="open_hours"
              className="admin-field"
              defaultValue={hours[0]?.hours ?? "7:00 AM–8:30 PM"}
            />
          </Field>
          <Field label="Closed days">
            <input
              name="closed_days"
              className="admin-field"
              defaultValue={hours[1]?.days ?? "Monday"}
            />
          </Field>
          <Field label="Holiday schedule note">
            <input
              name="holiday_schedule"
              className="admin-field"
              defaultValue={settings.holiday_schedule}
            />
          </Field>
        </div>
        <div className="mt-5">
          <Field label="Announcement bar">
            <input
              name="announcement"
              className="admin-field"
              defaultValue={settings.announcement}
            />
          </Field>
        </div>
        <label className="text-cocoa mt-4 flex items-center gap-3 text-sm font-bold">
          <input
            type="checkbox"
            name="show_announcement"
            defaultChecked={settings.show_announcement}
            className="size-4 accent-[#72457A]"
          />
          Show announcement bar
        </label>
      </Panel>
      <Panel title="Brand colors">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries({
            cocoa: "Deep cocoa",
            cream: "Warm cream",
            gold: "Toasted gold",
            ube: "Ube accent",
            leaf: "Leaf green",
            beige: "Soft beige",
            charcoal: "Charcoal",
          }).map(([key, label]) => (
            <label
              key={key}
              className="border-cocoa/10 rounded-xl border bg-white p-3"
            >
              <span className="text-cocoa text-xs font-extrabold">{label}</span>
              <span className="mt-2 flex items-center gap-2">
                <input
                  type="color"
                  name={`color_${key}`}
                  defaultValue={settings.brand_colors[key]}
                  className="size-10 rounded border-0"
                />
                <span className="text-muted font-mono text-xs">
                  {settings.brand_colors[key]}
                </span>
              </span>
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="Owner confirmation checklist">
        <div className="bg-gold/10 text-cocoa mb-4 flex gap-3 rounded-xl p-4 text-xs leading-5">
          <AlertTriangle className="text-ube mt-0.5 size-4 shrink-0" />
          Keep a box checked while that item still needs official confirmation.
          Uncheck it only after reviewing the public content.
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            "phone",
            "address",
            "opening_hours",
            "map_location",
            "business_story",
            "product_copy",
            "prices",
            "images",
          ].map((item) => (
            <label
              key={item}
              className="border-cocoa/10 text-cocoa flex items-center gap-3 rounded-xl border bg-white px-4 py-3 text-xs font-bold capitalize"
            >
              <input
                type="checkbox"
                name="needs_confirmation"
                value={item}
                defaultChecked={settings.needs_confirmation.includes(item)}
                className="accent-[#72457A]"
              />
              {item.replaceAll("_", " ")}
            </label>
          ))}
        </div>
      </Panel>
      {state.message && (
        <p
          className={`rounded-xl p-4 text-sm font-bold ${state.status === "success" ? "bg-leaf/10 text-leaf" : "bg-danger/10 text-danger"}`}
        >
          {state.message}
        </p>
      )}
      <div className="border-cocoa/10 sticky bottom-4 z-20 flex justify-end rounded-2xl border bg-white/92 p-4 shadow-xl backdrop-blur">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <Save className="size-4" />
          )}
          {pending ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </form>
  );
}
function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="paper-card p-5 sm:p-7">
      <h2 className="font-display text-cocoa mb-5 text-2xl font-bold">
        {title}
      </h2>
      {children}
    </section>
  );
}
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-cocoa mb-1.5 block text-xs font-extrabold">
        {label}
      </span>
      {children}
      {hint && <span className="text-muted mt-1 block text-xs">{hint}</span>}
    </label>
  );
}
