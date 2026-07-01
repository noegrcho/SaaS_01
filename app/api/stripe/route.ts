import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerSupabaseClient } from "@/lib/supabase-server";

// ── POST /api/stripe ──────────────────────────────────────────
// Crée une session Stripe Checkout et retourne son URL.
// Appelé depuis la page /home quand un invité veut payer.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

export async function POST(req: NextRequest) {
  try {
    const { inviteToken, email } = await req.json();

    if (!inviteToken || !email) {
      return NextResponse.json(
        { error: "Token et email requis." },
        { status: 400 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,

      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!, // ID du prix créé dans ton dashboard Stripe
          quantity: 1,
        },
      ],

      // On passe le token dans les metadata pour le retrouver après paiement
      metadata: {
        invite_token: inviteToken,
        email,
      },
      subscription_data: {
        metadata: {
          invite_token: inviteToken,
          email,
        },
      },

      // Après paiement réussi → /home avec marqueur + token
      success_url: `${baseUrl}/home?payment=success&token=${encodeURIComponent(inviteToken)}&email=${encodeURIComponent(email)}`,
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
