import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// ── POST /api/stripe ──────────────────────────────────────────
// Crée une session Stripe Checkout pour l'utilisateur Supabase connecté
// et retourne son URL. Appelé depuis l'écran "choix d'abonnement" de /home.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: user.email,
      client_reference_id: user.id,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],

      // On passe l'id utilisateur Supabase pour le retrouver dans le webhook.
      metadata: { user_id: user.id, email: user.email },
      subscription_data: {
        metadata: { user_id: user.id, email: user.email },
      },

      success_url: `${baseUrl}/home?payment=success`,
      cancel_url: `${baseUrl}/home?payment=cancelled`,

      allow_promotion_codes: true,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/stripe]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Erreur Stripe." },
      { status: 500 }
    );
  }
}