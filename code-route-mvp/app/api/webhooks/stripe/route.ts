import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripeKey || !webhookSecret) {
    return NextResponse.json({ error: "Config Stripe manquante" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const body = await req.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Signature absente" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    if (event.type === "checkout.session.completed") {
      console.log("Paiement confirmé", event.id);
    }
    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "Webhook invalide" }, { status: 400 });
  }
}
