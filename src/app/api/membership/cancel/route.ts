import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getEntitlement } from '@/lib/entitlement'
import { cancelSubscription, razorpayConfigured } from '@/lib/razorpay'

/**
 * Cancel the signed-in user's recurring membership at the end of the paid cycle
 * (they keep access until `current_end`). Lifetime has nothing to cancel.
 */
export async function POST() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  if (!razorpayConfigured()) {
    return NextResponse.json({ error: 'Billing is unavailable right now.' }, { status: 503 })
  }

  const ent = await getEntitlement(session.user.id)
  if (!ent.recurring || !ent.subscriptionId) {
    return NextResponse.json({ error: 'No active recurring membership to cancel.' }, { status: 400 })
  }
  if (ent.cancelScheduled) {
    return NextResponse.json({ ok: true, alreadyScheduled: true })
  }

  try {
    await cancelSubscription(ent.subscriptionId, true) // at cycle end
    await db().query(
      `UPDATE subscriptions SET cancel_scheduled = true, updated_at = now()
        WHERE razorpay_subscription_id = $1`,
      [ent.subscriptionId],
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Could not cancel — please try again or contact support.' }, { status: 502 })
  }
}
