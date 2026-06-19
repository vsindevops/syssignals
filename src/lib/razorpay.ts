import crypto from 'node:crypto'

/**
 * Thin Razorpay REST client (no SDK dependency — Basic-auth fetch + HMAC).
 * Recurring tiers (monthly/annual) use Subscriptions; lifetime uses a one-time
 * Order. Signature helpers verify both the checkout callback and webhooks.
 */
const KEY_ID = process.env.RAZORPAY_KEY_ID
const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET

export const razorpayConfigured = () => !!(KEY_ID && KEY_SECRET)
export const razorpayKeyId = () => KEY_ID

async function rzp<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`https://api.razorpay.com/v1${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${KEY_ID}:${KEY_SECRET}`).toString('base64')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(`Razorpay ${path} failed: ${JSON.stringify(data)}`)
  return data as T
}

export function createOrder(amount: number, notes: Record<string, string>) {
  return rzp<{ id: string; amount: number; currency: string }>('/orders', {
    amount,
    currency: 'INR',
    notes,
  })
}

export function createSubscription(planId: string, notes: Record<string, string>, totalCount = 120) {
  return rzp<{ id: string; status: string }>('/subscriptions', {
    plan_id: planId,
    total_count: totalCount, // max billing cycles (Razorpay caps yearly at 100)
    customer_notify: 1,
    notes,
  })
}

/** Cancel a subscription. Default: at the end of the paid cycle (keeps access). */
export function cancelSubscription(subscriptionId: string, atCycleEnd = true) {
  return rzp<{ id: string; status: string }>(`/subscriptions/${subscriptionId}/cancel`, {
    cancel_at_cycle_end: atCycleEnd ? 1 : 0,
  })
}

const hmac = (payload: string, secret: string) =>
  crypto.createHmac('sha256', secret).update(payload).digest('hex')

/** One-time order: HMAC(order_id|payment_id). */
export function verifyOrderSignature(orderId: string, paymentId: string, signature: string) {
  if (!KEY_SECRET) return false
  return safeEqual(hmac(`${orderId}|${paymentId}`, KEY_SECRET), signature)
}

/** Subscription checkout callback: HMAC(payment_id|subscription_id). */
export function verifySubscriptionSignature(paymentId: string, subscriptionId: string, signature: string) {
  if (!KEY_SECRET) return false
  return safeEqual(hmac(`${paymentId}|${subscriptionId}`, KEY_SECRET), signature)
}

/** Webhook: HMAC(rawBody) with the webhook secret. */
export function verifyWebhook(rawBody: string, signature: string) {
  if (!WEBHOOK_SECRET) return false
  return safeEqual(hmac(rawBody, WEBHOOK_SECRET), signature)
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb)
}
