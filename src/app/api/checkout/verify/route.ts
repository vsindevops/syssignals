import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { verifyOrderSignature, verifySubscriptionSignature } from '@/lib/razorpay'

/**
 * Razorpay Checkout success callback. Verifies the signature and activates the
 * entitlement optimistically; the webhook remains the durable source of truth
 * (especially for recurring renewals).
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  const userId = Number(session.user.id)

  let b: Record<string, string>
  try {
    b = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // one-time (lifetime)
  if (b.razorpay_order_id && b.razorpay_payment_id && b.razorpay_signature) {
    if (!verifyOrderSignature(b.razorpay_order_id, b.razorpay_payment_id, b.razorpay_signature)) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
    }
    await db().query(
      `UPDATE subscriptions
          SET status = 'active', razorpay_payment_id = $1, updated_at = now()
        WHERE razorpay_order_id = $2 AND user_id = $3`,
      [b.razorpay_payment_id, b.razorpay_order_id, userId],
    )
    return NextResponse.json({ ok: true })
  }

  // recurring (monthly/annual)
  if (b.razorpay_payment_id && b.razorpay_subscription_id && b.razorpay_signature) {
    if (!verifySubscriptionSignature(b.razorpay_payment_id, b.razorpay_subscription_id, b.razorpay_signature)) {
      return NextResponse.json({ error: 'Payment verification failed.' }, { status: 400 })
    }
    await db().query(
      `UPDATE subscriptions
          SET status = 'active', razorpay_payment_id = $1, updated_at = now()
        WHERE razorpay_subscription_id = $2 AND user_id = $3`,
      [b.razorpay_payment_id, b.razorpay_subscription_id, userId],
    )
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
}
