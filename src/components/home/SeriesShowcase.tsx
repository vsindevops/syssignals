'use client'

import Link from 'next/link'
import { ArrowRight, Layers } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'

export interface ShowcaseDay {
  day: number
  slug: string
  title: string
}

interface Props {
  name: string
  tagline: string
  level: string
  topics: string[]
  total: number
  href: string
  days: ShowcaseDay[]
}

export default function SeriesShowcase({ name, tagline, level, topics, total, href, days }: Props) {
  const { completed, hydrated } = useProgress()
  const doneCount = hydrated ? days.filter(d => completed.includes(d.slug)).length : 0
  const pct = Math.round((doneCount / total) * 100)
  const published = new Map(days.map(d => [d.day, d]))

  return (
    <div className="card relative overflow-hidden p-8 md:p-10">
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full blur-[110px]"
        style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.18), transparent)' }}
      />
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_auto]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip !border-accent/25 !text-accent"><Layers size={11} /> flagship series</span>
            <span className="chip">{level}</span>
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold tracking-tight text-ink">{name}</h3>
          <p className="mt-2 max-w-lg text-[15px] leading-relaxed text-ink-dim">{tagline}</p>

          <div className="mt-5 flex flex-wrap gap-1.5">
            {topics.map(t => <span key={t} className="chip">{t}</span>)}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <Link
              href={href}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-[0.98]"
            >
              {doneCount > 0 ? 'Continue series' : 'Start Day 1'}
              <ArrowRight size={15} />
            </Link>
            {hydrated && doneCount > 0 && (
              <span className="font-mono text-xs text-ink-mute">
                {doneCount}/{total} complete · {pct}%
              </span>
            )}
          </div>
        </div>

        {/* day grid — 30 cells */}
        <div className="mx-auto w-full max-w-[300px] lg:mx-0">
          <div className="grid grid-cols-6 gap-2">
            {Array.from({ length: total }, (_, i) => i + 1).map(day => {
              const pub = published.get(day)
              const isDone = pub && completed.includes(pub.slug)
              const cls = isDone
                ? 'border-green/50 bg-green/15 text-green'
                : pub
                  ? 'border-accent/30 bg-accent/8 text-accent hover:border-accent/70 hover:bg-accent/15'
                  : 'border-line bg-surface-2 text-ink-mute/50'
              const cell = (
                <span
                  className={`flex aspect-square items-center justify-center rounded-lg border font-mono text-[11px] transition-colors ${cls}`}
                >
                  {String(day).padStart(2, '0')}
                </span>
              )
              return pub ? (
                <Link key={day} href={`/articles/${pub.slug}`} title={`Day ${day}: ${pub.title}`}>
                  {cell}
                </Link>
              ) : (
                <span key={day} title={`Day ${day} — coming soon`}>{cell}</span>
              )
            })}
          </div>
          <p className="mt-3 text-center font-mono text-[11px] text-ink-mute">
            {days.length} published · {total - days.length} on the way
          </p>
        </div>
      </div>
    </div>
  )
}
