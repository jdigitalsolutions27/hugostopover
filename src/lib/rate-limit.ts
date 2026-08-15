import "server-only";

import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const memory = new Map<string, { count: number; resetAt: number }>();

export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
) {
  if (hasSupabaseConfig()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data, error } = await supabase.rpc("check_rate_limit", {
        p_key: key,
        p_limit: limit,
        p_window_seconds: windowSeconds,
      });
      if (!error && typeof data === "boolean") return data;
    } catch {
      // Continue with a best-effort local guard if the database is unavailable.
    }
  }

  const now = Date.now();
  const current = memory.get(key);
  if (!current || current.resetAt <= now) {
    memory.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
