import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID;
  const siteUrl = process.env.NEXTAUTH_URL;

  if (!stripeKey || !priceId || !siteUrl) {
    return NextResponse.json({ error: "Variables Stripe manquantes" }, { status: 500 });
  }

  const stripe = new Stripe(stripeKey);
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${siteUrl}/dashboard?payment=success`,
    cancel_url: `${siteUrl}/pricing?payment=cancelled`,
  });

  return NextResponse.json({ url: session.url });
}
