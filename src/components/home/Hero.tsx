'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { ArrowRight, BookOpen } from 'lucide-react'
import Terminal from './Terminal'

interface Stats {
  articles: number
  hours: number
  series: number
}

interface LatestBadge {
  text: string
  href: string
}

function SignalWave() {
  return (
    <svg
      className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 w-full opacity-[0.16]"
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path
        d="M0,100 L80,100 L110,40 L150,160 L190,70 L220,100 L340,100 L370,55 L410,150 L450,80 L480,100 L620,100 L650,30 L690,170 L730,60 L760,100 L900,100 L930,50 L970,150 L1010,75 L1040,100 L1200,100"
        fill="none"
        stroke="url(#wave-grad)"
        strokeWidth="2"
        strokeDasharray="6 8"
        style={{ animation: 'signal-dash 40s linear infinite' }}
      />
      <defs>
        <linearGradient id="wave-grad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22d3ee" />
          <stop offset="0.5" stopColor="#a78bfa" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Hero({ stats, latest }: { stats: Stats; latest?: LatestBadge }) {
  const reduce = useReducedMotion()
  const fadeUp = (delay: number) => ({
    initial: reduce ? false : ({ opacity: 0, y: 24 } as const),
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] as const },
  })

  return (
    <section className="relative overflow-hidden">
      {/* backdrop */}
      <div className="bg-grid bg-grid-fade absolute inset-0 -z-20" />
      <div
        className="absolute left-1/2 top-[-180px] -z-10 h-[420px] w-[720px] -translate-x-1/2 rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.16), rgba(167,139,250,0.08), transparent)' }}
      />
      <SignalWave />

      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 pb-20 pt-16 md:pt-24 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {latest && (
            <motion.div {...fadeUp(0)}>
              <Link
                href={latest.href}
                className="chip !border-accent/25 !text-accent transition-colors hover:!border-accent/50"
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-green animate-pulse-dot" />
                {latest.text}
                <ArrowRight size={12} />
              </Link>
            </motion.div>
          )}

          <motion.h1
            {...fadeUp(0.08)}
            className="mt-6 font-display text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink sm:text-6xl"
          >
            Learn by building
            <br />
            <span className="gradient-text">real systems.</span>
          </motion.h1>

          <motion.p {...fadeUp(0.16)} className="mt-6 max-w-xl text-[17px] leading-relaxed text-ink-dim">
            Project-based deep dives into DevOps, MLOps and AI engineering.
            Every article is a working build — verified commands, expected
            output, and diagrams that are actually explained.
          </motion.p>

          <motion.div {...fadeUp(0.24)} className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              href="/series"
              className="glow inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              <BookOpen size={17} />
              Explore the series
            </Link>
            <Link
              href="/articles"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-6 py-3 text-[15px] font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
            >
              Browse articles
              <ArrowRight size={16} />
            </Link>
          </motion.div>

          <motion.dl {...fadeUp(0.34)} className="mt-12 flex gap-10 border-t border-line pt-6">
            {[
              { v: `${stats.articles}`, k: 'hands-on articles' },
              { v: `${stats.hours}h+`, k: 'of building' },
              { v: `${stats.series}`, k: stats.series === 1 ? 'learning path' : 'learning paths' },
            ].map(s => (
              <div key={s.k}>
                <dt className="sr-only">{s.k}</dt>
                <dd className="font-display text-2xl font-bold text-ink">{s.v}</dd>
                <dd className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-ink-mute">{s.k}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 30, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="hidden lg:block"
        >
          <div style={{ animation: 'float-y 7s ease-in-out infinite' }}>
            <Terminal />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
