import type { Metadata } from 'next'
import Reveal from '@/components/motion/Reveal'
import PricingTiers from '@/components/pricing/PricingTiers'

export const metadata: Metadata = {
  title: 'Membership',
  description:
    'One membership unlocks every Systems & Signals series — all days, current and future. Monthly, annual, or lifetime. The first 7 days of each series are always free.',
  alternates: { canonical: '/pricing' },
}

const FAQ = [
  {
    q: 'What do I get?',
    a: 'Full access to every day of every series — 30 Days of DevOps, Python for AI Engineering, and every series we ship in future. The first 7 days of each series stay free for everyone.',
  },
  {
    q: 'Can I cancel?',
    a: 'Yes. Monthly and annual plans can be cancelled anytime; you keep access until the period you paid for ends. Lifetime is a one-time payment with nothing to cancel.',
  },
  {
    q: 'How do I pay?',
    a: 'Securely via Razorpay — UPI, credit/debit cards, and netbanking. Your access is tied to your account and syncs across all your devices.',
  },
  {
    q: 'Is the content really hands-on?',
    a: 'Every article is a working project with verified commands, expected output, and diagrams that are actually explained. No video fluff — build real systems.',
  },
]

export default function PricingPage() {
  return (
    <div className="relative">
      <div className="bg-grid bg-grid-fade absolute inset-x-0 top-0 -z-10 h-[360px]" />
      <div className="mx-auto max-w-5xl px-5 pt-14">
        <Reveal>
          <div className="text-center">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">membership</p>
            <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
              One membership. <span className="gradient-text">Everything.</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
              Unlock every day of every series — current and future. The first 7 days of each
              series are always free, so you can try before you subscribe.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-12">
          <PricingTiers />
        </Reveal>

        <Reveal className="mt-20">
          <h2 className="text-center font-display text-2xl font-bold tracking-tight text-ink">
            Questions
          </h2>
          <div className="mx-auto mt-8 grid max-w-3xl gap-4 sm:grid-cols-2">
            {FAQ.map(f => (
              <div key={f.q} className="card p-6">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">{f.q}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-mute">{f.a}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </div>
  )
}
