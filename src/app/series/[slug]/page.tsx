import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { BarChart3, CalendarDays, GaugeCircle } from 'lucide-react'
import JsonLd, { courseJsonLd } from '@/components/JsonLd'
import Curriculum from '@/components/series/Curriculum'
import Reveal from '@/components/motion/Reveal'
import { getSeriesArticles } from '@/lib/articles'
import { SERIES } from '@/lib/series'

export function generateStaticParams() {
  return Object.keys(SERIES).map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const info = SERIES[slug]
  if (!info) return {}
  return { title: info.name, description: info.tagline }
}

export default async function SeriesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const info = SERIES[slug]
  if (!info) notFound()

  const articles = getSeriesArticles(slug)
  const bySlugDay = new Map(articles.map(a => [a.day, a]))
  const totalMin = articles.reduce((s, a) => s + a.readMinutes, 0)

  const toLesson = (a: NonNullable<ReturnType<typeof bySlugDay.get>>) => ({
    day: a.day ?? 0,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt,
    readTime: a.readTime,
  })

  const modules = info.modules.map(m => ({
    title: m.title,
    blurb: m.blurb,
    lessons: m.days
      .map(d => bySlugDay.get(d))
      .filter(a => a !== undefined)
      .map(toLesson),
  }))

  // Self-healing: a freshly synced day that hasn't been placed into a module
  // in series.ts yet still shows up, in its own block at the end.
  const assigned = new Set(info.modules.flatMap(m => m.days))
  const unassigned = articles.filter(a => a.day !== undefined && !assigned.has(a.day))
  if (unassigned.length > 0) {
    modules.push({
      title: 'Just shipped',
      blurb: 'The newest days — fresh off the cluster.',
      lessons: unassigned.map(toLesson),
    })
  }

  // Never show a published day as locked/upcoming.
  const publishedDays = new Set(articles.map(a => a.day))
  const upcoming = info.upcoming.filter(u => !publishedDays.has(u.day))

  return (
    <div className="relative">
      <JsonLd data={courseJsonLd({ slug, name: info.name, description: info.description })} />
      <div className="bg-grid bg-grid-fade absolute inset-x-0 top-0 -z-10 h-[420px]" />
      <div className="mx-auto max-w-4xl px-5 pt-14">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">series</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">{info.name}</h1>
          <p className="mt-4 max-w-2xl text-[15.5px] leading-relaxed text-ink-dim">{info.description}</p>

          <div className="mt-6 flex flex-wrap gap-2">
            <span className="chip"><CalendarDays size={11} /> {articles.length}/{info.total} days published</span>
            <span className="chip"><BarChart3 size={11} /> ~{Math.round(totalMin / 60)}h total</span>
            <span className="chip"><GaugeCircle size={11} /> {info.level}</span>
          </div>
        </Reveal>

        <div className="mt-12 pb-10">
          <Curriculum modules={modules} upcoming={upcoming} total={info.total} />
        </div>
      </div>
    </div>
  )
}
