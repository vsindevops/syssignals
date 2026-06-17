'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import { Check, Loader2 } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'
import { TIERS, formatINR, type PlanId } from '@/lib/pricing'

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

const ORDER: PlanId[] = ['monthly', 'annual', 'lifetime']

export default function PricingTiers() {
  const router = useRouter()
  const { user } = useProgress()
  const [busy, setBusy] = useState<PlanId | null>(null)
  const [error, setError] = useState<string | null>(null)

  const buy = useCallback(async (plan: PlanId) => {
    setError(null)
    setBusy(plan)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })
      // not signed in → send to sign-in/sign-up, then auto-resume this plan's
      // checkout on return (standard SaaS flow). Server is the auth source of truth.
      if (res.status === 401) {
        router.push(`/login?callbackUrl=${encodeURIComponent(`/pricing?checkout=${plan}`)}`)
        return
      }
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not start checkout.')
        setBusy(null)
        return
      }
      if (!window.Razorpay) {
        setError('Checkout is still loading — try again in a moment.')
        setBusy(null)
        return
      }

      const onPaid = async (resp: Record<string, string>) => {
        const v = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(resp),
        })
        if (v.ok) router.push('/pricing/success')
        else setError('We could not confirm your payment. If charged, contact support.')
        setBusy(null)
      }

      const common = {
        key: data.keyId,
        name: 'Systems & Signals',
        description: `${TIERS[plan].name} membership`,
        prefill: typeof user === 'string' ? { email: user } : undefined,
        theme: { color: '#22d3ee' },
        modal: { ondismiss: () => setBusy(null) },
        handler: onPaid,
      }

      const options =
        data.type === 'subscription'
          ? { ...common, subscription_id: data.subscriptionId }
          : { ...common, order_id: data.orderId, amount: data.amount, currency: data.currency }

      new window.Razorpay(options).open()
    } catch {
      setError('Network error — please try again.')
      setBusy(null)
    }
  }, [router, user])

  // Resume checkout after returning from sign-in (/pricing?checkout=<plan>).
  const resumed = useRef(false)
  useEffect(() => {
    if (resumed.current) return
    if (typeof user !== 'string') return // wait until the user is known-signed-in
    const plan = new URLSearchParams(window.location.search).get('checkout')
    if (plan && plan in TIERS) {
      resumed.current = true
      router.replace('/pricing') // clear the param so a refresh won't re-trigger
      queueMicrotask(() => buy(plan as PlanId)) // defer setState out of the effect body
    }
  }, [user, buy, router])

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="afterInteractive" />

      {error && (
        <p className="mb-6 rounded-xl border border-amber/30 bg-amber/10 px-4 py-3 text-center text-[13.5px] text-amber">
          {error}
        </p>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        {ORDER.map(id => {
          const t = TIERS[id]
          return (
            <div
              key={id}
              className={`card relative flex flex-col p-7 ${t.highlight ? 'glow !border-accent/40' : ''}`}
            >
              {t.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-3 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-wider text-bg">
                  Best value
                </span>
              )}
              <h3 className="font-display text-lg font-semibold text-ink">{t.name}</h3>
              <div className="mt-3 flex items-end gap-1.5">
                <span className="font-display text-4xl font-bold text-ink">{formatINR(t.amount)}</span>
                <span className="mb-1 font-mono text-[11px] text-ink-mute">{t.cadence}</span>
              </div>
              <p className="mt-2 text-[13.5px] text-ink-mute">{t.blurb}</p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5 text-[13.5px] text-ink-dim">
                {t.perks.map(p => (
                  <li key={p} className="flex items-start gap-2.5">
                    <Check size={16} className="mt-0.5 shrink-0 text-green" />
                    {p}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => buy(id)}
                disabled={busy !== null}
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-[14.5px] font-semibold transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 ${
                  t.highlight
                    ? 'bg-accent text-bg'
                    : 'border border-line bg-surface-2 text-ink hover:border-line-2'
                }`}
              >
                {busy === id && <Loader2 size={15} className="animate-spin" />}
                {t.recurring ? `Choose ${t.name}` : 'Get Lifetime'}
              </button>
            </div>
          )
        })}
      </div>

      <p className="mt-6 text-center font-mono text-[11px] text-ink-mute">
        Secure payments via Razorpay · UPI, cards &amp; netbanking · cancel recurring plans anytime
      </p>
    </>
  )
}
