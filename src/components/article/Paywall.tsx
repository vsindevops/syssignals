import Link from 'next/link'
import { Lock, Check, ArrowRight } from 'lucide-react'
import { TIERS, formatINR } from '@/lib/pricing'

/**
 * Shown in place of the article body for a gated (Day 8+) lesson the visitor
 * can't read. The body HTML is never rendered/sent here.
 *
 * Two modes:
 *  - `paymentsLive=false` (pre-launch): just prompt sign-in (today's behaviour).
 *  - `paymentsLive=true`: full membership paywall with pricing.
 */
export default function Paywall({
  signedIn,
  seriesName,
  slug,
  paymentsLive,
}: {
  signedIn: boolean
  seriesName?: string
  slug: string
  paymentsLive: boolean
}) {
  if (!paymentsLive) {
    return (
      <div className="mt-10">
        <div className="pointer-events-none h-24 bg-gradient-to-b from-transparent to-bg" />
        <div className="card p-8 text-center md:p-12">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Lock size={20} />
          </span>
          <h2 className="mt-5 font-display text-2xl font-bold tracking-tight text-ink">
            Sign in to keep reading
          </h2>
          <p className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-dim">
            The first 4 days{seriesName ? ` of ${seriesName}` : ''} are open to everyone. Create a
            free account to continue — it&apos;s a one-tap email link, no password.
          </p>
          <Link
            href={`/login?callbackUrl=${encodeURIComponent(`/articles/${slug}`)}`}
            className="glow mt-7 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            Sign in to continue <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-10">
      {/* faded teaser of "more below" */}
      <div className="pointer-events-none h-24 bg-gradient-to-b from-transparent to-bg" />

      <div className="card relative overflow-hidden p-8 text-center md:p-12">
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-[480px] -translate-x-1/2 rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }}
        />
        <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Lock size={20} />
        </span>
        <h2 className="relative mt-5 font-display text-2xl font-bold tracking-tight text-ink">
          This lesson is for members
        </h2>
        <p className="relative mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-ink-dim">
          The first 4 days{seriesName ? ` of ${seriesName}` : ''} are free. Unlock the full
          curriculum — every day of every series, current and future — with one membership.
        </p>

        {/* tiers */}
        <div className="relative mx-auto mt-8 grid max-w-xl gap-3 sm:grid-cols-3">
          {(['monthly', 'annual', 'lifetime'] as const).map(id => {
            const t = TIERS[id]
            return (
              <div
                key={id}
                className={`rounded-xl border p-4 text-left ${
                  t.highlight ? 'border-accent/50 bg-accent/5' : 'border-line bg-surface-2'
                }`}
              >
                <p className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">{t.name}</p>
                <p className="mt-1 font-display text-lg font-bold text-ink">{formatINR(t.amount)}</p>
                <p className="font-mono text-[10.5px] text-ink-mute">{t.cadence}</p>
              </div>
            )
          })}
        </div>

        <div className="relative mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/pricing"
            className="glow inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:scale-[1.03]"
          >
            See membership plans <ArrowRight size={16} />
          </Link>
          {!signedIn && (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(`/articles/${slug}`)}`}
              className="inline-flex items-center rounded-xl border border-line bg-surface-2 px-6 py-3 text-[15px] font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
            >
              Already a member? Sign in
            </Link>
          )}
        </div>

        <ul className="relative mx-auto mt-7 flex max-w-md flex-col gap-2 text-left text-[13.5px] text-ink-dim">
          {['Every series, all days — including future series', 'Verified, project-based, no fluff', 'Progress synced across all your devices'].map(p => (
            <li key={p} className="flex items-start gap-2.5">
              <Check size={16} className="mt-0.5 shrink-0 text-green" />
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
