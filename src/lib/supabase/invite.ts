import "server-only";

import { createClient } from "@supabase/supabase-js";
import { absoluteUrl } from "@/lib/utils";
import { getSupabaseConfig } from "@/lib/supabase/config";

export async function sendAdminInvitationEmail({
  email,
  displayName,
}: {
  email: string;
  displayName: string;
}) {
  const { url, key } = getSupabaseConfig();
  // Invitations are opened by a different person/browser than the Owner who
  // sends them. An isolated implicit client avoids binding the email link to
  // the Owner's PKCE verifier cookie. The fragment tokens remain browser-only
  // and are exchanged for secure SSR cookies on the acceptance page.
  const inviteClient = createClient(url, key, {
    auth: {
      flowType: "implicit",
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });

  return inviteClient.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo: absoluteUrl("/admin/accept-invite"),
      data: { display_name: displayName },
    },
  });
}
