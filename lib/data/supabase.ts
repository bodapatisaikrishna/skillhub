import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase clients.
 *
 *  - `getReadClient()` uses the anon key (RLS-restricted to public SELECT) for
 *    all catalog reads.
 *  - `getWriteClient()` uses the service-role key for the seed script and the
 *    daily sync. The service-role key bypasses RLS and must never reach the
 *    client bundle — it is read only from server-side env (no NEXT_PUBLIC_).
 *
 * Both talk to PostgREST over `fetch`, so there is no connection pool to exhaust
 * on serverless — safe to create per request.
 */

const URL = process.env.SUPABASE_URL;
const ANON = process.env.SUPABASE_ANON_KEY;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when the read credentials are configured. */
export function hasSupabase(): boolean {
  return Boolean(URL && ANON);
}

let read: SupabaseClient | null = null;
let write: SupabaseClient | null = null;

export function getReadClient(): SupabaseClient {
  if (!URL || !ANON) {
    throw new Error(
      "Supabase read client unavailable: set SUPABASE_URL and SUPABASE_ANON_KEY.",
    );
  }
  read ??= createClient(URL, ANON, { auth: { persistSession: false } });
  return read;
}

export function getWriteClient(): SupabaseClient {
  if (!URL || !SERVICE) {
    throw new Error(
      "Supabase write client unavailable: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  write ??= createClient(URL, SERVICE, { auth: { persistSession: false } });
  return write;
}
