import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const sig = req.headers.get("stripe-signature")
    if (!sig) return NextResponse.json({ error: "No signature" }, { status: 400 })

    const event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!
    )

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session
      const customerId = session.customer as string
      if (!customerId) return NextResponse.json({ ok: true })

      const user = await prisma.user.findUnique({
        where: { stripeCustomerId: customerId },
      })
      if (!user) return NextResponse.json({ ok: true })

      await prisma.user.update({
        where: { id: user.id },
        data: { isPremium: true },
      })
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error("Webhook error:", err)
    return NextResponse.json({ error: "Webhook error" }, { status: 400 })
  }
}
