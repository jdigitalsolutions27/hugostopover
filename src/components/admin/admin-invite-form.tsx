"use client";

import { LoaderCircle, MailPlus } from "lucide-react";
import { useActionState } from "react";
import { inviteAdminUserAction } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { initialActionState } from "@/lib/validation";

export function AdminInviteForm() {
  const [state, action, pending] = useActionState(
    inviteAdminUserAction,
    initialActionState,
  );

  return (
    <form action={action} className="paper-card p-5 sm:p-7" noValidate>
      <div className="flex items-start gap-4">
        <span className="bg-gold/15 text-ube grid size-11 shrink-0 place-items-center rounded-xl">
          <MailPlus className="size-5" />
        </span>
        <div>
          <p className="eyebrow">Add a team member</p>
          <h2 className="font-display text-cocoa mt-1 text-2xl font-bold">
            Send a secure invitation
          </h2>
          <p className="text-muted mt-2 max-w-2xl text-xs leading-5">
            The recipient verifies their email through Supabase, then creates a
            password. Access only becomes active for owner-approved addresses.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-[1fr_1.2fr_180px]">
        <label>
          <span className="text-cocoa mb-1.5 block text-xs font-bold">
            Display name
          </span>
          <input
            name="display_name"
            className="admin-field"
            autoComplete="off"
            maxLength={100}
            placeholder="e.g. Maria Santos"
          />
          {state.errors?.display_name?.[0] && (
            <span className="text-danger mt-1 block text-xs font-bold">
              {state.errors.display_name[0]}
            </span>
          )}
        </label>
        <label>
          <span className="text-cocoa mb-1.5 block text-xs font-bold">
            Email address
          </span>
          <input
            name="email"
            type="email"
            className="admin-field"
            autoComplete="off"
            required
            placeholder="team@example.com"
          />
          {state.errors?.email?.[0] && (
            <span className="text-danger mt-1 block text-xs font-bold">
              {state.errors.email[0]}
            </span>
          )}
        </label>
        <label>
          <span className="text-cocoa mb-1.5 block text-xs font-bold">
            Role
          </span>
          <select name="role" className="admin-field" defaultValue="staff">
            <option value="staff">Staff</option>
            <option value="editor">Editor</option>
            <option value="owner">Owner</option>
          </select>
        </label>
      </div>

      <div className="border-cocoa/10 bg-beige/20 text-muted mt-5 grid gap-2 rounded-xl border p-4 text-xs leading-5 md:grid-cols-3">
        <p>
          <strong className="text-cocoa">Staff:</strong> products, media, and
          customer inquiries.
        </p>
        <p>
          <strong className="text-cocoa">Editor:</strong> Staff access plus
          categories, page content, promotions, and testimonials.
        </p>
        <p>
          <strong className="text-cocoa">Owner:</strong> full access, business
          settings, destructive actions, and team management.
        </p>
      </div>

      {state.message && (
        <p
          role="status"
          className={`mt-5 rounded-xl px-4 py-3 text-sm font-bold ${state.status === "success" ? "bg-leaf/10 text-leaf" : "bg-danger/10 text-danger"}`}
        >
          {state.message}
        </p>
      )}

      <div className="mt-5 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <MailPlus className="size-4" />
          )}
          {pending ? "Sending invitation…" : "Send invitation"}
        </Button>
      </div>
    </form>
  );
}
