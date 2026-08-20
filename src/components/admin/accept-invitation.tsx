"use client";

import Link from "next/link";
import { CircleAlert, LoaderCircle, MailCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { parseInvitationFragment } from "@/lib/invitation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type AcceptanceState = "working" | "error";

export function AcceptInvitation() {
  const [state, setState] = useState<AcceptanceState>("working");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    let active = true;

    async function accept() {
      const fragment = parseInvitationFragment(window.location.hash);
      const cleanUrl = `${window.location.pathname}${window.location.search}`;
      if (window.location.hash) window.history.replaceState(null, "", cleanUrl);
      if (fragment.status === "error") {
        if (active) setState("error");
        return;
      }

      const supabase = createSupabaseBrowserClient();
      if (fragment.status !== "tokens") {
        if (active) setState("error");
        return;
      }
      const { data, error } = await supabase.auth.setSession({
        access_token: fragment.accessToken,
        refresh_token: fragment.refreshToken,
      });
      if (error || !data.user) {
        if (active) setState("error");
        return;
      }
      const userId = data.user.id;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("is_active,role")
        .eq("id", userId)
        .maybeSingle();
      if (
        profileError ||
        !profile?.is_active ||
        !["owner", "editor", "staff"].includes(String(profile.role))
      ) {
        await supabase.auth.signOut();
        if (active) setState("error");
        return;
      }

      const { error: invitationError } = await supabase.rpc(
        "accept_admin_invitation",
      );
      if (invitationError) {
        await supabase.auth.signOut();
        if (active) setState("error");
        return;
      }

      window.location.replace("/admin/reset-password?invite=1");
    }

    void accept();
    return () => {
      active = false;
    };
  }, []);

  if (state === "error") {
    return (
      <div className="text-center">
        <span className="bg-danger/10 text-danger mx-auto grid size-12 place-items-center rounded-2xl">
          <CircleAlert className="size-6" />
        </span>
        <h1 className="display-title text-cocoa mt-5 text-3xl">
          This invitation cannot be used.
        </h1>
        <p className="text-muted mt-3 text-sm leading-6">
          The link may have expired or already been replaced. Ask the Owner to
          resend the invitation from Team access.
        </p>
        <Button asChild variant="outline" className="mt-6">
          <Link href="/admin/login">Return to admin login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center" role="status" aria-live="polite">
      <span className="bg-leaf/10 text-leaf mx-auto grid size-12 place-items-center rounded-2xl">
        <MailCheck className="size-6" />
      </span>
      <h1 className="display-title text-cocoa mt-5 text-3xl">
        Securing your invitation
      </h1>
      <p className="text-muted mt-3 text-sm leading-6">
        We are verifying your approved team access. You will choose your own
        password next.
      </p>
      <LoaderCircle className="text-ube mx-auto mt-6 size-6 animate-spin" />
    </div>
  );
}
