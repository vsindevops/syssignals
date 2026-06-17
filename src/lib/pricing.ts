/**
 * Pricing tiers for the all-access paywall. Amounts are in paise (Razorpay's
 * smallest unit) — ₹399 = 39900. Recurring tiers map to Razorpay Plan IDs set
 * via env (created in the Razorpay dashboard / API); lifetime is a one-time
 * Order so it needs no plan.
 */
export type PlanId = 'monthly' | 'annual' | 'lifetime'

export interface Tier {
  id: PlanId
  name: string
  amount: number // paise
  cadence: string // human label
  recurring: boolean
  /** env var holding the Razorpay plan_id (recurring tiers only) */
  razorpayPlanEnv?: string
  highlight?: boolean
  blurb: string
  perks: string[]
}

export const CURRENCY = 'INR'

export const TIERS: Record<PlanId, Tier> = {
  monthly: {
    id: 'monthly',
    name: 'Monthly',
    amount: 39900,
    cadence: 'per month',
    recurring: true,
    razorpayPlanEnv: 'RAZORPAY_PLAN_MONTHLY',
    blurb: 'Full access, cancel anytime.',
    perks: ['Every series, all days', 'New series as they ship', 'Progress synced across devices'],
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    amount: 299900,
    cadence: 'per year',
    recurring: true,
    razorpayPlanEnv: 'RAZORPAY_PLAN_ANNUAL',
    highlight: true,
    blurb: 'Best value — about ₹250/month.',
    perks: ['Everything in Monthly', 'Save ~37% vs monthly', 'One payment a year'],
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    amount: 699900,
    cadence: 'one-time',
    recurring: false,
    blurb: 'Pay once. Yours forever, including every future series.',
    perks: ['Everything, forever', 'All future series included', 'No renewals, no churn'],
  },
}

export const formatINR = (paise: number) =>
  `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
