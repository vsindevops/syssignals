'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Crown, ArrowRight, Loader2, CalendarClock } from 'lucide-react'
import type { EntitlementSummary } from '@/lib/entitlement'

const PLAN_LABEL: Record<string, string> = { monthly: 'Monthly', annual: 'Annual', lifetime: 'Lifetime' }

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })

export default function MembershipPanel({ ent }: { ent: EntitlementSummary }) {
  const router = useRouter()
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)

  const cancel = async () => {
    setBusy(true)
    setErr(null)
    try {
      const res = await fetch('/api/membership/cancel', { method: 'POST' })
      const data = await res.json()
      if (res.ok) router.refresh()
      else { setErr(data.error ?? 'Could not cancel.'); setBusy(false) }
    } catch {
      setErr('Network error — please try again.')
      setBusy(false)
    }
  }

  // No active membership
  if (!ent.active) {
    return (
      <div className="card p-6 md:p-8">
        <h2 className="font-display text-lg font-semibold text-ink">Membership</h2>
        <p className="mt-2 text-[14px] text-ink-mute">
          You&apos;re on the free plan — the first 7 days of every series. Unlock everything with a membership.
        </p>
        <Link
          href="/pricing"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[14px] font-semibold text-bg transition-transform hover:scale-[1.02]"
        >
          See plans <ArrowRight size={15} />
        </Link>
      </div>
    )
  }

  const planName = PLAN_LABEL[ent.plan ?? ''] ?? ent.plan

  return (
    <div className="card p-6 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Membership</h2>
          <p className="mt-2 flex items-center gap-2 text-[14px] text-ink-dim">
            <Crown size={16} className="text-accent" />
            <span className="font-semibold text-ink">{planName}</span>
            {ent.plan === 'lifetime' ? '· lifetime access' : ent.cancelScheduled ? '· ending' : '· active'}
          </p>
        </div>
        <span
          className={`chip ${ent.cancelScheduled ? '!border-amber/40 !text-amber' : '!border-green/40 !text-green'}`}
        >
          {ent.cancelScheduled ? 'cancels at period end' : 'active'}
        </span>
      </div>

      {ent.plan !== 'lifetime' && ent.currentEnd && (
        <p className="mt-4 flex items-center gap-2 font-mono text-[12.5px] text-ink-mute">
          <CalendarClock size={14} />
          {ent.cancelScheduled
            ? `Access continues until ${fmtDate(ent.currentEnd)}, then stops. No further charges.`
            : `Renews on ${fmtDate(ent.currentEnd)}.`}
        </p>
      )}
      {ent.plan === 'lifetime' && (
        <p className="mt-4 font-mono text-[12.5px] text-ink-mute">
          One-time purchase — you have full access forever, including every future series.
        </p>
      )}

      {err && <p className="mt-4 text-[13px] text-amber">{err}</p>}

      {/* actions */}
      {ent.recurring && !ent.cancelScheduled && (
        <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-line pt-5">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface-2 px-4 py-2 text-[13.5px] font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
          >
            Change plan
          </Link>
          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="text-[13px] text-ink-mute transition-colors hover:text-amber"
            >
              Cancel membership
            </button>
          ) : (
            <span className="flex flex-wrap items-center gap-3">
              <span className="text-[13px] text-ink-dim">Cancel at period end?</span>
              <button
                onClick={cancel}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-amber/40 bg-amber/10 px-3 py-1.5 text-[13px] font-medium text-amber disabled:opacity-60"
              >
                {busy && <Loader2 size={13} className="animate-spin" />}
                Yes, cancel
              </button>
              <button onClick={() => setConfirming(false)} className="text-[13px] text-ink-mute hover:text-ink">
                Keep it
              </button>
            </span>
          )}
        </div>
      )}

      {ent.recurring && ent.cancelScheduled && (
        <div className="mt-6 border-t border-line pt-5">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-bg transition-transform hover:scale-[1.02]"
          >
            Resubscribe <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </div>
  )
}
