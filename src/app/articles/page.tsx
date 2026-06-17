import type { Metadata } from 'next'
import Reveal from '@/components/motion/Reveal'
import ArticlesExplorer from '@/components/ArticlesExplorer'
import { getAllArticles, getAllTags } from '@/lib/articles'
import { SERIES } from '@/lib/series'

export const metadata: Metadata = {
  title: 'Articles',
  description: 'Every published article — project-based DevOps, MLOps and AI engineering deep dives.',
  alternates: { canonical: '/articles' },
}

export default function ArticlesPage() {
  const articles = getAllArticles()
  const tags = getAllTags()
  const totalMin = articles.reduce((s, a) => s + a.readMinutes, 0)
  // series in flagship-first order, limited to ones that actually have articles
  const present = new Set(articles.map(a => a.seriesSlug))
  const series = Object.values(SERIES)
    .filter(s => present.has(s.slug))
    .map(s => ({ slug: s.slug, name: s.name }))

  return (
    <div className="mx-auto max-w-6xl px-5 pt-14">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">the archive</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">Articles</h1>
        <p className="mt-3 max-w-xl text-[15.5px] leading-relaxed text-ink-dim">
          {articles.length} deep dives, ~{Math.round(totalMin / 60)} hours of hands-on builds.
          Filter by topic, or press <kbd>⌘K</kbd> to search everything.
        </p>
      </Reveal>

      <div className="mt-10">
        <ArticlesExplorer articles={articles} tags={tags} series={series} />
      </div>
    </div>
  )
}
