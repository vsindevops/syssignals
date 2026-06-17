import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Welcome aboard',
  robots: { index: false, follow: false },
}

export default function CheckoutSuccessPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-green/10 text-green">
        <CheckCircle2 size={26} />
      </span>
      <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-ink">You&apos;re in. 🎉</h1>
      <p className="mt-3 max-w-md text-[15px] text-ink-dim">
        Your membership is active and every series is now unlocked on this account. It syncs
        across all your devices automatically.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/series/30-days-devops"
          className="glow inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:scale-[1.03]"
        >
          Jump back into the curriculum <ArrowRight size={16} />
        </Link>
        <Link
          href="/articles"
          className="inline-flex items-center rounded-xl border border-line bg-surface-2 px-6 py-3 text-[15px] font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
        >
          Browse all articles
        </Link>
      </div>
    </div>
  )
}
