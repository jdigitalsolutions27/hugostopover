import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

/**
 * Anonymous server-side client for published website content. It deliberately
 * has no cookie/session access, so public rendering can be cached or
 * prerendered without coupling it to an administrator session.
 */
export function createSupabasePublicClient() {
  const { url, key } = getSupabaseConfig();

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
