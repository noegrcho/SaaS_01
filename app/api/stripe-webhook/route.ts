import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createAdminClient } from "@/lib/supabase-admin";

// ── POST /api/stripe-webhook ────────────────────────────────────
// Reçoit les événements Stripe et met à jour la table `profiles`
// (identifiée par user_id Supabase, pas par email) via la service role.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const supabaseAdmin = createAdminClient();

// Nombre de recherches accordées sur le (seul, pour l'instant) plan payant.
// À faire évoluer le jour où plusieurs prix Stripe existeront.
const PAID_PLAN_SEARCH_CREDITS = 1000;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("[webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Webhook invalide." }, { status: 400 });
  }

  // ── Paiement confirmé ────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.user_id ?? session.client_reference_id;
    const email = session.metadata?.email ?? session.customer_email;
    const customerId = session.customer as string;

    if (userId) {
      const { error } = await supabaseAdmin
        .from("profiles")
        .update({
          email: email ?? undefined,
          stripe_customer_id: customerId,
          plan: "paid",
          searches_remaining: PAID_PLAN_SEARCH_CREDITS,
          onboarded: true,
          subscribed_at: new Date().toISOString(),
        })
        .eq("id", userId);

      if (error) console.error("[webhook] Supabase update error:", error);
      else console.log(`[webhook] ✓ Abonnement activé pour user ${userId}`);
    } else {
      console.warn("[webhook] checkout.session.completed sans user_id/client_reference_id");
    }
  }

  // ── Abonnement annulé / expiré ───────────────────────────────
  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    if (sub.status !== "active" && sub.status !== "trialing") {
      const customerId = sub.customer as string;
      const { error } = await supabaseAdmin
        .from("profiles")
        // Repasse en gratuit, quota à 0 (l'essai gratuit a déjà été
        // consommé) : le prochain scan déclenche l'écran de réabonnement.
        .update({ plan: "free", searches_remaining: 0 })
        .eq("stripe_customer_id", customerId);

      if (error) console.error("[webhook] Supabase update error:", error);
      else console.log(`[webhook] Abonnement désactivé pour customer ${customerId}`);
    }
  }

  return NextResponse.json({ received: true });
}