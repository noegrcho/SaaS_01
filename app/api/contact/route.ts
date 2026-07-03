import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";

// ── POST /api/contact ────────────────────────────────────────
// Enregistre un message de contact dans Supabase (table contact_messages).

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    if (!email || !message) {
      return NextResponse.json({ error: "Email et message requis." }, { status: 400 });
    }

    const supabase = createAdminClient();
    const { error } = await supabase.from("contact_messages").insert({
      name: name || null,
      email: email.trim().toLowerCase(),
      subject: subject || null,
      message,
    });

    if (error) {
      console.error("[/api/contact] Supabase error:", error);
      return NextResponse.json({ error: "Erreur d'envoi." }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[/api/contact]", err);
    return NextResponse.json({ error: "Erreur inattendue." }, { status: 500 });
  }
}