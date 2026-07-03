import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── POST /api/waitlist ──────────────────────────────────────────
// Enregistre (ou met à jour) une inscription waitlist dans Supabase.

export async function POST(req: NextRequest) {
  try {
    const { email, firstName, lastName, activity, price } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email requis." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("waitlist").upsert(
      {
        email: email.trim().toLowerCase(),
        first_name: firstName || null,
        last_name: lastName || null,
        activity: activity || null,
        price: price || null,
      },
      { onConflict: "email" }
    );

    if (error) {
      console.error("[/api/waitlist] Supabase error:", error);
      return NextResponse.json({ error: "Erreur d'enregistrement." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/waitlist]", err);
    return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
  }
}