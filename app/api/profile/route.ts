import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── GET /api/profile ─────────────────────────────────────────
// Retourne le profil (abonnement, essai gratuit) de l'utilisateur connecté.
// Crée le profil s'il n'existe pas encore (filet de sécurité, le trigger
// SQL le fait normalement automatiquement à l'inscription).

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();

  let { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    const { data: created } = await admin
      .from("profiles")
      .insert({ id: user.id, email: user.email })
      .select("*")
      .single();
    profile = created;
  }

  return NextResponse.json({ profile });
}

// ── POST /api/profile ────────────────────────────────────────
// Actions sur le profil de l'utilisateur connecté.
// - action "activate_free" : marque l'onboarding comme terminé quand
//   l'utilisateur choisit explicitement de rester sur le plan gratuit
//   (n'affiche plus l'écran de choix d'abonnement aux connexions
//   suivantes). Ne touche ni au plan ni au quota, déjà positionnés
//   par défaut ('free' / 1 recherche) à la création du compte.

export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const { action } = await req.json();
  const admin = createAdminClient();

  if (action === "activate_free") {
    const { data: profile, error } = await admin
      .from("profiles")
      .upsert({ id: user.id, email: user.email, onboarded: true }, { onConflict: "id" })
      .select("*")
      .single();

    if (error) {
      console.error("[/api/profile] activate_free error:", error);
      return NextResponse.json({ error: "Erreur." }, { status: 500 });
    }
    return NextResponse.json({ profile });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}