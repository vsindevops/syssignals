import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { TIERS, type PlanId } from '@/lib/pricing'
import { razorpayConfigured, razorpayKeyId, createOrder, createSubscription } from '@/lib/razorpay'

/**
 * Start a checkout. Requires sign-in (we attach the order/subscription to the
 * user). Lifetime → Razorpay Order (one-time); monthly/annual → Subscription.
 * Returns what the client needs to open Razorpay Checkout.
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Please sign in first.' }, { status: 401 })
  }
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: 'Payments are not live yet — check back soon.' }, { status: 503 })
  }

  let body: { plan?: PlanId }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }
  const plan = body.plan
  if (!plan || !(plan in TIERS)) {
    return NextResponse.json({ error: 'Unknown plan.' }, { status: 400 })
  }

  const userId = Number(session.user.id)
  const tier = TIERS[plan]
  const notes = { user_id: String(userId), plan }

  try {
    if (!tier.recurring) {
      // lifetime → one-time order
      const order = await createOrder(tier.amount, notes)
      await db().query(
        `INSERT INTO subscriptions (user_id, plan, status, razorpay_order_id)
         VALUES ($1, $2, 'created', $3)`,
        [userId, plan, order.id],
      )
      return NextResponse.json({
        type: 'order',
        keyId: razorpayKeyId(),
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      })
    }

    // monthly / annual → subscription
    const planId = tier.razorpayPlanEnv ? process.env[tier.razorpayPlanEnv] : undefined
    if (!planId) {
      return NextResponse.json({ error: 'This plan is not configured yet.' }, { status: 503 })
    }
    const sub = await createSubscription(planId, notes)
    await db().query(
      `INSERT INTO subscriptions (user_id, plan, status, razorpay_subscription_id)
       VALUES ($1, $2, 'created', $3)`,
      [userId, plan, sub.id],
    )
    return NextResponse.json({
      type: 'subscription',
      keyId: razorpayKeyId(),
      subscriptionId: sub.id,
    })
  } catch (e) {
    console.error('checkout error', e)
    return NextResponse.json({ error: 'Could not start checkout — please try again.' }, { status: 502 })
  }
}
