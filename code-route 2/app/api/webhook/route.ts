import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

// Disable body parsing — needed for Stripe signature verification
export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.error("Webhook signature error:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("No userId in Stripe metadata");
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const stripeCustomerId = session.customer as string;
    const stripeSubscriptionId = session.subscription as string | undefined;

    // Fetch subscription to get period end
    let currentPeriodEnd: Date | undefined;
    if (stripeSubscriptionId) {
      const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
      currentPeriodEnd = new Date((sub as Stripe.Subscription & { current_period_end: number }).current_period_end * 1000);
    }

    // Upsert subscription in DB
    const existing = await prisma.subscription.findFirst({
      where: { userId },
    });

    if (existing) {
      await prisma.subscription.update({
        where: { id: existing.id },
        data: {
          stripeCustomerId,
          stripeSubscriptionId: stripeSubscriptionId ?? null,
          status: "active",
          currentPeriodEnd: currentPeriodEnd ?? null,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId,
          stripeCustomerId,
          stripeSubscriptionId: stripeSubscriptionId ?? null,
          status: "active",
          currentPeriodEnd: currentPeriodEnd ?? null,
        },
      });
    }
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    await prisma.subscription.updateMany({
      where: { stripeSubscriptionId: sub.id },
      data: { status: "cancelled" },
    });
  }

  return NextResponse.json({ received: true });
}
