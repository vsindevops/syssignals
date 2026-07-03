import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, TerminalSquare, CheckCircle2, Workflow, LifeBuoy } from 'lucide-react'
import Hero from '@/components/home/Hero'
import ContinueCard from '@/components/home/ContinueCard'
import { SeriesCard, PlannedSeriesCard } from '@/components/home/SeriesCard'
import ArticleCard from '@/components/ArticleCard'
import NewsletterForm from '@/components/NewsletterForm'
import Reveal from '@/components/motion/Reveal'
import JsonLd, { siteJsonLd } from '@/components/JsonLd'
import { getAllArticles, getLatestArticles, getSearchIndex, getSeriesArticles } from '@/lib/articles'
import { SERIES, PLANNED_SERIES } from '@/lib/series'

const MAX_SERIES_ON_HOME = 4

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const FORMAT = [
  {
    icon: TerminalSquare,
    title: 'Every article is a build',
    body: 'No theory dumps. Each day ships a working project — a pipeline, a cluster, a chart — that you run on your own machine.',
  },
  {
    icon: CheckCircle2,
    title: 'Commands with expected output',
    body: 'Every command is verified before publishing, and you see exactly what it should print. If your output differs, you know immediately.',
  },
  {
    icon: Workflow,
    title: 'Diagrams that are explained',
    body: 'Every diagram comes with a plain-English walkthrough of each node, arrow and colour. No decoder ring required.',
  },
  {
    icon: LifeBuoy,
    title: 'Common errors, with fixes',
    body: 'Each article ends with the 4–6 real errors you are most likely to hit, and the exact fix for each one.',
  },
]

export default function HomePage() {
  const all = getAllArticles()
  const latest = getLatestArticles(6)
  const totalMinutes = all.reduce((s, a) => s + a.readMinutes, 0)

  // live series in declaration order (flagship first), with their published articles
  const liveSeries = Object.values(SERIES).map(s => ({
    info: s,
    articles: getSeriesArticles(s.slug),
  }))

  // newest published article across all series → hero badge
  const newest = latest[0]

  // up to MAX_SERIES_ON_HOME cards: live series first, then planned to fill
  const liveCards = liveSeries.map(({ info, articles }) => ({
    slug: info.slug,
    name: info.name,
    tagline: info.tagline,
    level: info.level,
    topics: info.topics,
    total: info.total,
    publishedSlugs: articles.map(a => a.slug),
  }))
  const plannedSlots = Math.max(0, MAX_SERIES_ON_HOME - liveCards.length)

  return (
    <>
      <JsonLd data={siteJsonLd()} />
      <Hero
        stats={{
          articles: all.length,
          hours: Math.round(totalMinutes / 60),
          series: liveSeries.length,
        }}
        latest={
          newest
            ? {
                text: `${newest.series ?? 'New'}${newest.day ? ` · Day ${newest.day}` : ''} just shipped`,
                href: `/articles/${newest.slug}`,
              }
            : undefined
        }
      />

      <ContinueCard docs={getSearchIndex()} />

      {/* learning paths */}
      <section className="mx-auto mt-20 max-w-6xl px-5">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">learning paths</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
                Pick a series, build every day
              </h2>
            </div>
            <Link
              href="/series"
              className="hidden items-center gap-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-accent sm:flex"
            >
              All series <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {liveCards.slice(0, MAX_SERIES_ON_HOME).map((c, i) => (
            <Reveal key={c.slug} delay={(i % 2) * 0.07}>
              <SeriesCard data={c} flagship={i === 0} />
            </Reveal>
          ))}
          {PLANNED_SERIES.slice(0, plannedSlots).map((p, i) => (
            <Reveal key={p.name} delay={((liveCards.length + i) % 2) * 0.07}>
              <PlannedSeriesCard name={p.name} status={p.status} blurb={p.blurb} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* format */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">the format</p>
          <h2 className="mt-3 max-w-xl font-display text-3xl font-bold tracking-tight text-ink">
            Built for people who learn by doing
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {FORMAT.map((f, i) => (
            <Reveal key={f.title} delay={i * 0.07}>
              <div className="card card-hover h-full p-7">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <f.icon size={19} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-ink-mute">{f.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* latest */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Reveal>
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">fresh signals</p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">Latest articles</h2>
            </div>
            <Link
              href="/articles"
              className="hidden items-center gap-1.5 text-sm font-medium text-ink-dim transition-colors hover:text-accent sm:flex"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>
        </Reveal>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a, i) => (
            <Reveal key={a.slug} delay={(i % 3) * 0.07}>
              <ArticleCard article={a} showSeries />
            </Reveal>
          ))}
        </div>
      </section>

      {/* newsletter */}
      <section className="mx-auto mt-24 max-w-6xl px-5">
        <Reveal>
          <div className="card relative overflow-hidden p-10 text-center md:p-12">
            <div
              className="pointer-events-none absolute right-[-120px] top-[-120px] h-72 w-72 rounded-full blur-[110px]"
              style={{ background: 'radial-gradient(closest-side, rgba(34,211,238,0.16), transparent)' }}
            />
            <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
              One email when a new day ships
            </h2>
            <p className="mx-auto mt-3 max-w-md text-[14.5px] text-ink-dim">
              The next build lands in your inbox — nothing else, no spam, unsubscribe anytime.
            </p>
            <div className="mt-7">
              <NewsletterForm />
            </div>
          </div>
        </Reveal>
      </section>

      {/* CTA */}
      <section className="mx-auto mt-16 max-w-6xl px-5">
        <Reveal>
          <div className="card relative overflow-hidden p-10 text-center md:p-16">
            <div className="bg-grid absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_60%_70%_at_50%_50%,black,transparent)]" />
            <div
              className="pointer-events-none absolute left-1/2 top-0 h-40 w-[480px] -translate-x-1/2 rounded-full blur-[100px]"
              style={{ background: 'radial-gradient(closest-side, rgba(167,139,250,0.22), transparent)' }}
            />
            <h2 className="relative font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Stop reading about systems.
              <br />
              <span className="gradient-text">Start building them.</span>
            </h2>
            <p className="relative mx-auto mt-4 max-w-md text-[15px] text-ink-dim">
              Day 1 takes about an hour and leaves you with a production-ready Git workflow. The rest compounds from there.
            </p>
            <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/articles/day-01-git-branching-strategies"
                className="glow inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:scale-[1.03]"
              >
                Begin Day 1 <ArrowRight size={16} />
              </Link>
              <a
                href="https://x.com/syssignals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-line bg-surface-2 px-6 py-3 text-[15px] font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
              >
                Follow @syssignals
              </a>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
