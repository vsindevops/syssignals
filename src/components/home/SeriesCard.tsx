'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'

export interface SeriesCardData {
  slug: string
  name: string
  tagline: string
  level: string
  topics: string[]
  total: number
  publishedSlugs: string[]
}

/** Compact series card for the homepage grid (progress-aware). */
export function SeriesCard({ data, flagship = false }: { data: SeriesCardData; flagship?: boolean }) {
  const { completed, hydrated } = useProgress()
  // The bar always reflects *your* completion of the series, never how much is
  // published — so it's empty until you finish lessons, and consistent across cards.
  const done = hydrated ? data.publishedSlugs.filter(s => completed.includes(s)).length : 0
  const pct = data.total > 0 ? Math.round((done / data.total) * 100) : 0
  const started = hydrated && done > 0

  return (
    <Link href={`/series/${data.slug}`} className="card card-hover group flex h-full flex-col p-7">
      <div className="flex flex-wrap items-center gap-2">
        {flagship && <span className="chip !border-accent/25 !text-accent">flagship</span>}
        <span className="chip">{data.level}</span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold text-ink transition-colors group-hover:text-accent">
        {data.name}
      </h3>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-mute">{data.tagline}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {data.topics.slice(0, 5).map(t => (
          <span key={t} className="chip">{t}</span>
        ))}
        {data.topics.length > 5 && <span className="chip">+{data.topics.length - 5}</span>}
      </div>

      {/* your completion of the series */}
      <div className="mt-5">
        <div className="flex items-center justify-between font-mono text-[11px] text-ink-mute">
          <span>{done}/{data.total} completed</span>
          <span className="inline-flex items-center gap-1 text-ink-dim transition-colors group-hover:text-accent">
            {started ? 'Continue' : 'Start'} <ArrowRight size={12} />
          </span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-3">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </Link>
  )
}

/** Muted placeholder for an upcoming/announced series. */
export function PlannedSeriesCard({ name, status, blurb }: { name: string; status: string; blurb: string }) {
  return (
    <div className="card flex h-full flex-col border-dashed p-7 opacity-90">
      <span className="chip !border-accent-2/30 !text-accent-2">
        <Sparkles size={11} /> {status}
      </span>
      <h3 className="mt-4 font-display text-xl font-semibold text-ink">{name}</h3>
      <p className="mt-2 flex-1 text-[14px] leading-relaxed text-ink-mute">{blurb}</p>
      <span className="mt-5 font-mono text-[11px] text-ink-mute">In the works</span>
    </div>
  )
}
