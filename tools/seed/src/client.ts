import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for seed tooling only. Never import this from
 * apps/mobile or any client-facing code — the service role key bypasses
 * RLS entirely, which is exactly why this tool exists as a separate,
 * operator-run package (ARCHITECTURE.md §9).
 */
export function createSeedClient() {
  const url = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set. " +
        "This tool is service-role-only by design and must never be run with an anon/publishable key.",
    );
  }

  return createClient(url, serviceRoleKey, { auth: { persistSession: false } });
}
