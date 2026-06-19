import { db } from '@/lib/db'

/**
 * Does this user currently have paid access to gated content?
 * True when they hold a lifetime purchase OR an active recurring subscription
 * whose period hasn't ended. The webhook keeps `status`/`current_end` current.
 */
export async function userHasAccess(userId: number | string | undefined | null): Promise<boolean> {
  if (userId === undefined || userId === null) return false
  const id = Number(userId)
  if (!Number.isFinite(id)) return false

  const { rows } = await db().query(
    `SELECT 1 FROM subscriptions
      WHERE user_id = $1
        AND (
          (plan = 'lifetime' AND status = 'active')
          OR (status = 'active' AND (current_end IS NULL OR current_end > now()))
        )
      LIMIT 1`,
    [id],
  )
  return rows.length > 0
}

export interface EntitlementSummary {
  active: boolean
  plan: string | null
  status: string | null
  currentEnd: string | null
  recurring: boolean
  cancelScheduled: boolean
  subscriptionId: string | null
}

/** Best current entitlement for display + management (account menu, settings). */
export async function getEntitlement(userId: number | string | undefined | null): Promise<EntitlementSummary> {
  const none: EntitlementSummary = {
    active: false, plan: null, status: null, currentEnd: null,
    recurring: false, cancelScheduled: false, subscriptionId: null,
  }
  if (userId === undefined || userId === null) return none
  const id = Number(userId)
  if (!Number.isFinite(id)) return none

  const { rows } = await db().query(
    `SELECT plan, status, current_end, cancel_scheduled, razorpay_subscription_id
       FROM subscriptions
      WHERE user_id = $1
      ORDER BY (plan = 'lifetime') DESC, current_end DESC NULLS LAST, created_at DESC
      LIMIT 1`,
    [id],
  )
  if (rows.length === 0) return none
  const r = rows[0]
  const active =
    (r.plan === 'lifetime' && r.status === 'active') ||
    (r.status === 'active' && (r.current_end === null || new Date(r.current_end) > new Date()))
  return {
    active,
    plan: r.plan,
    status: r.status,
    currentEnd: r.current_end ? new Date(r.current_end).toISOString() : null,
    recurring: r.plan === 'monthly' || r.plan === 'annual',
    cancelScheduled: !!r.cancel_scheduled,
    subscriptionId: r.razorpay_subscription_id ?? null,
  }
}
