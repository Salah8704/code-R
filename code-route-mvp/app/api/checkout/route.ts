import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-01-27.acacia" });

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Non authentifie" }, { status: 401 });
  const origin = req.headers.get("origin") ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  try {
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!, quantity: 1 }],
      customer_email: session.user.email,
      metadata: { userId: session.user.id },
      success_url: `${origin}/dashboard?success=1`,
      cancel_url: `${origin}/pricing?cancelled=1`,
    });
    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Erreur Stripe" }, { status: 500 });
  }
}