import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { verifyWebhook } from '@/lib/razorpay'

/**
 * Razorpay webhook — the durable source of truth for entitlement state.
 * Handles one-time capture (lifetime) and the subscription lifecycle.
 * Configure in the Razorpay dashboard with RAZORPAY_WEBHOOK_SECRET and these
 * events: payment.captured, subscription.activated, subscription.charged,
 * subscription.cancelled, subscription.completed, subscription.halted.
 */
export async function POST(req: Request) {
  const raw = await req.text()
  const signature = req.headers.get('x-razorpay-signature') ?? ''
  if (!verifyWebhook(raw, signature)) {
    return NextResponse.json({ error: 'bad signature' }, { status: 400 })
  }

  let event: {
    event: string
    payload: {
      subscription?: { entity: { id: string; status: string; current_end: number | null } }
      payment?: { entity: { id: string; order_id: string | null } }
    }
  }
  try {
    event = JSON.parse(raw)
  } catch {
    return NextResponse.json({ error: 'bad json' }, { status: 400 })
  }

  const sub = event.payload.subscription?.entity
  const pay = event.payload.payment?.entity

  try {
    switch (event.event) {
      case 'payment.captured': {
        // lifetime one-time: match the pending row by its order id
        if (pay?.order_id) {
          await db().query(
            `UPDATE subscriptions
                SET status = 'active', razorpay_payment_id = $1, updated_at = now()
              WHERE razorpay_order_id = $2`,
            [pay.id, pay.order_id],
          )
        }
        break
      }
      case 'subscription.activated':
      case 'subscription.charged': {
        if (sub) {
          await db().query(
            `UPDATE subscriptions
                SET status = 'active',
                    current_end = $1,
                    updated_at = now()
              WHERE razorpay_subscription_id = $2`,
            [sub.current_end ? new Date(sub.current_end * 1000) : null, sub.id],
          )
        }
        break
      }
      case 'subscription.cancelled':
      case 'subscription.completed':
      case 'subscription.halted':
      case 'subscription.paused': {
        if (sub) {
          const status = event.event.split('.')[1] // cancelled | completed | halted | paused
          await db().query(
            `UPDATE subscriptions SET status = $1, updated_at = now()
              WHERE razorpay_subscription_id = $2`,
            [status, sub.id],
          )
        }
        break
      }
    }
  } catch (e) {
    console.error('razorpay webhook error', e)
    return NextResponse.json({ error: 'processing error' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
