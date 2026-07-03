import { createClient } from "@supabase/supabase-js";

// ── Client admin (service role) ────────────────────────────────
// À utiliser UNIQUEMENT côté serveur (routes API). Bypass la RLS.
// Ne jamais exposer SUPABASE_SERVICE_ROLE_KEY côté client.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}