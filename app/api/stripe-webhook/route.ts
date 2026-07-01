import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ── POST /api/stripe-webhook ──────────────────────────────────
// Reçoit les événements Stripe (paiement confirmé, annulation…)
// Utilise le SERVICE ROLE KEY pour écrire en base sans auth.

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

// Client Supabase avec droits admin (côté serveur uniquement)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Signature manquante." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("[webhook] Signature invalide:", err);
    return NextResponse.json({ error: "Webhook invalide." }, { status: 400 });
  }

  // ── Paiement confirmé ────────────────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.CheckoutSession;
    const email = session.metadata?.email ?? session.customer_email;
    const customerId = session.customer as string;

    if (email) {
      // Enregistre le statut abonné dans la table `profiles`
      // (à créer dans Supabase : id uuid, email text, stripe_customer_id text, subscribed bool)
      const { error } = await supabaseAdmin
        .from("profiles")
        .upsert(
          {
            email,
            stripe_customer_id: customerId,
            subscribed: true,
            subscribed_at: new Date().toISOString(),
          },
          { onConflict: "email" }
        );

      if (error) console.error("[webhook] Supabase upsert error:", error);
      else console.log(`[webhook] ✓ Abonnement enregistré pour ${email}`);
    }
  }

  // ── Abonnement annulé / expiré ───────────────────────────────
  if (
    event.type === "customer.subscription.deleted" ||
    event.type === "customer.subscription.updated"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    if (sub.status !== "active" && sub.status !== "trialing") {
      const customer = await stripe.customers.retrieve(sub.customer as string);
      const email = (customer as Stripe.Customer).email;
      if (email) {
        await supabaseAdmin
          .from("profiles")
          .update({ subscribed: false })
          .eq("email", email);
        console.log(`[webhook] Abonnement désactivé pour ${email}`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
