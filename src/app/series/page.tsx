import type { Metadata } from 'next'
import { Sparkles } from 'lucide-react'
import SeriesShowcase from '@/components/home/SeriesShowcase'
import Reveal from '@/components/motion/Reveal'
import { getSeriesArticles } from '@/lib/articles'
import { SERIES, PLANNED_SERIES } from '@/lib/series'

export const metadata: Metadata = {
  title: 'Series',
  description: 'Project-based learning tracks — 30 Days of DevOps, with MLOps and AI engineering on the way.',
}

export default function SeriesIndexPage() {
  const series = SERIES['30-days-devops']
  const articles = getSeriesArticles(series.slug)

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">learning tracks</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">Series</h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          Each series is a complete curriculum: ordered days, one working project
          per day, progress tracked as you go.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <SeriesShowcase
          name={series.name}
          tagline={series.tagline}
          level={series.level}
          topics={series.topics}
          total={series.total}
          href={`/series/${series.slug}`}
          days={articles.map(a => ({ day: a.day ?? 0, slug: a.slug, title: a.title }))}
        />
      </Reveal>

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {PLANNED_SERIES.map((p, i) => (
          <Reveal key={p.name} delay={i * 0.08}>
            <div className="card h-full border-dashed p-8 opacity-90">
              <span className="chip !border-accent-2/30 !text-accent-2">
                <Sparkles size={11} /> {p.status}
              </span>
              <h3 className="mt-4 font-display text-xl font-semibold text-ink">{p.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-mute">{p.blurb}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  )
}
