import {
  Clock3,
  RotateCcw,
  ShieldAlert,
  UserCog,
  UserRoundCheck,
  UserRoundX,
} from "lucide-react";
import {
  removeAdminUserAction,
  revokeAdminInvitationAction,
  restoreAdminUserAction,
  updateAdminUserAction,
} from "@/actions/admin";
import { AdminInviteForm } from "@/components/admin/admin-invite-form";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { Button } from "@/components/ui/button";
import { requireAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { AdminInvitation, AdminRole } from "@/types/domain";

type ProfileRow = {
  id: string;
  email: string | null;
  display_name: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
};

export default async function AdminUsersPage() {
  const current = await requireAdmin(["owner"]);
  const supabase = await createSupabaseServerClient();
  const [profileResult, invitationResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id,email,display_name,role,is_active,created_at")
      .order("created_at"),
    supabase
      .from("admin_invitations")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false }),
  ]);
  const profiles = (profileResult.data ?? []) as ProfileRow[];
  const invitations = (invitationResult.data ?? []) as AdminInvitation[];
  const activeProfiles = profiles.filter((profile) => profile.is_active);
  const removedProfiles = profiles.filter((profile) => !profile.is_active);

  return (
    <div className="mx-auto max-w-6xl">
      <AdminPageHeader
        eyebrow="Owner-only"
        title="Team access"
        description="Invite administrators, assign least-privilege roles, and remove or restore dashboard access safely."
      />

      <div className="border-gold/30 bg-gold/10 text-cocoa mb-6 flex gap-3 rounded-xl border p-4 text-xs leading-5">
        <ShieldAlert className="text-ube mt-0.5 size-5 shrink-0" />
        <span>
          <strong>Access rule:</strong> only Owners can invite people or change
          roles. Your own Owner role and active status are protected so you
          cannot accidentally lock yourself out. Every new recipient now
          verifies the invitation and creates a private password before signing
          in. Removed accounts lose access immediately but remain in the audit
          history and can be restored.
        </span>
      </div>

      <AdminInviteForm />

      {invitations.length > 0 && (
        <section className="mt-8">
          <div className="mb-4">
            <p className="eyebrow">Awaiting acceptance</p>
            <h2 className="font-display text-cocoa mt-1 text-2xl font-bold">
              Pending invitations
            </h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {invitations.map((invitation) => (
              <article
                key={invitation.id}
                className="paper-card flex items-start justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <p className="text-cocoa truncate text-sm font-extrabold">
                    {invitation.display_name || invitation.email}
                  </p>
                  <p className="text-muted mt-1 truncate text-xs">
                    {invitation.email}
                  </p>
                  <p className="text-ube mt-3 flex items-center gap-1.5 text-[.65rem] font-extrabold uppercase">
                    <Clock3 className="size-3.5" /> {invitation.role} invite
                  </p>
                </div>
                <form action={revokeAdminInvitationAction}>
                  <input type="hidden" name="id" value={invitation.id} />
                  <ConfirmButton
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="text-danger"
                    message={`Revoke the invitation for ${invitation.email}?`}
                  >
                    <UserRoundX className="size-4" />
                    Revoke
                  </ConfirmButton>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="mt-8">
        <div className="mb-4">
          <p className="eyebrow">Authorized accounts</p>
          <h2 className="font-display text-cocoa mt-1 text-2xl font-bold">
            Administrators
          </h2>
        </div>
        <div className="space-y-4">
          {activeProfiles.map((profile) => (
            <form
              key={profile.id}
              action={updateAdminUserAction}
              className="paper-card grid gap-4 p-5 sm:grid-cols-[1.1fr_1.2fr_160px_auto] sm:items-end"
            >
              <input type="hidden" name="id" value={profile.id} />
              <input type="hidden" name="is_active" value="true" />
              <label>
                <span className="text-cocoa mb-1.5 block text-xs font-bold">
                  Display name
                </span>
                <input
                  name="display_name"
                  className="admin-field"
                  defaultValue={profile.display_name}
                  maxLength={100}
                />
              </label>
              <div className="min-w-0">
                <p className="text-cocoa mb-1.5 text-xs font-bold">Email</p>
                <p className="admin-field flex min-h-11 items-center truncate bg-white/55 text-sm">
                  {profile.email || "Email unavailable"}
                </p>
              </div>
              <label>
                <span className="text-cocoa mb-1.5 block text-xs font-bold">
                  Role
                </span>
                <select
                  name="role"
                  className="admin-field"
                  defaultValue={profile.role}
                  disabled={profile.id === current.id}
                >
                  <option value="staff">Staff</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
                {profile.id === current.id && (
                  <input type="hidden" name="role" value={profile.role} />
                )}
              </label>
              <div className="flex flex-wrap gap-2">
                <Button type="submit" size="sm">
                  <UserCog className="size-4" />
                  Save
                </Button>
                {profile.id !== current.id && (
                  <ConfirmButton
                    type="submit"
                    formAction={removeAdminUserAction}
                    variant="outline"
                    size="sm"
                    className="border-danger/25 text-danger hover:bg-danger/10"
                    message={`Remove dashboard access for ${profile.email || profile.display_name}? They will be signed out of protected areas and can be restored later.`}
                  >
                    <UserRoundX className="size-4" />
                    Remove access
                  </ConfirmButton>
                )}
              </div>
            </form>
          ))}
        </div>
      </section>

      {removedProfiles.length > 0 && (
        <section className="mt-8">
          <div className="mb-4">
            <p className="eyebrow">Access removed</p>
            <h2 className="font-display text-cocoa mt-1 text-2xl font-bold">
              Removed accounts
            </h2>
            <p className="text-muted mt-2 max-w-2xl text-xs leading-5">
              These accounts cannot enter the dashboard or use protected data.
              Restore only when access is required again.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {removedProfiles.map((profile) => (
              <article
                key={profile.id}
                className="paper-card flex items-center justify-between gap-4 p-5"
              >
                <div className="min-w-0">
                  <p className="text-cocoa flex items-center gap-2 truncate text-sm font-extrabold">
                    <UserRoundCheck className="text-muted size-4" />
                    {profile.display_name || profile.email}
                  </p>
                  <p className="text-muted mt-1 truncate text-xs">
                    {profile.email || "Email unavailable"} · {profile.role}
                  </p>
                </div>
                <form action={restoreAdminUserAction}>
                  <input type="hidden" name="id" value={profile.id} />
                  <Button type="submit" variant="outline" size="sm">
                    <RotateCcw className="size-4" />
                    Restore
                  </Button>
                </form>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
