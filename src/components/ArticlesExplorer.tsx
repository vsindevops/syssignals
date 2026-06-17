'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { motion } from 'motion/react'
import { ArrowRight, LayoutGrid, Clock3 } from 'lucide-react'
import ArticleCard from '@/components/ArticleCard'
import type { ArticleMeta } from '@/lib/articles'

interface SeriesRef {
  slug: string
  name: string
}

interface Props {
  articles: ArticleMeta[]
  tags: { tag: string; count: number }[]
  /** Series in display order (flagship first). */
  series: SeriesRef[]
}

type View = 'series' | 'latest'

export default function ArticlesExplorer({ articles, tags, series }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [view, setView] = useState<View>('series')

  const filtered = useMemo(
    () => (activeTag ? articles.filter(a => a.tags.includes(activeTag)) : articles),
    [articles, activeTag],
  )

  // grouped by series, each in curriculum (day asc) order
  const groups = useMemo(() => {
    return series
      .map(s => ({
        ...s,
        items: filtered
          .filter(a => a.seriesSlug === s.slug)
          .sort((a, b) => (a.day ?? 0) - (b.day ?? 0)),
      }))
      .filter(g => g.items.length > 0)
  }, [filtered, series])

  // flat, true newest-first
  const latest = useMemo(
    () =>
      [...filtered].sort((a, b) =>
        a.date < b.date ? 1 : a.date > b.date ? -1 : (b.day ?? 0) - (a.day ?? 0),
      ),
    [filtered],
  )

  return (
    <div>
      {/* controls */}
      <div className="flex flex-col gap-4 border-b border-line pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex rounded-xl border border-line bg-surface-2 p-1 text-[13px] font-medium">
          <button
            onClick={() => setView('series')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-colors ${
              view === 'series' ? 'bg-surface-3 text-ink' : 'text-ink-mute hover:text-ink-dim'
            }`}
          >
            <LayoutGrid size={14} /> By series
          </button>
          <button
            onClick={() => setView('latest')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 transition-colors ${
              view === 'latest' ? 'bg-surface-3 text-ink' : 'text-ink-mute hover:text-ink-dim'
            }`}
          >
            <Clock3 size={14} /> Latest
          </button>
        </div>

        <p className="font-mono text-[11px] text-ink-mute">
          {filtered.length} article{filtered.length === 1 ? '' : 's'}
          {activeTag && <> tagged <span className="text-accent">{activeTag}</span></>}
        </p>
      </div>

      {/* topic filter */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="mr-1 font-mono text-[11px] uppercase tracking-wider text-ink-mute">Topics</span>
        <button
          onClick={() => setActiveTag(null)}
          className={`chip transition-colors ${activeTag === null ? '!border-accent/50 !bg-accent/10 !text-accent' : 'hover:!border-line-2 hover:!text-ink-dim'}`}
        >
          all
        </button>
        {tags.slice(0, 12).map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => setActiveTag(t => (t === tag ? null : tag))}
            className={`chip transition-colors ${activeTag === tag ? '!border-accent/50 !bg-accent/10 !text-accent' : 'hover:!border-line-2 hover:!text-ink-dim'}`}
          >
            {tag} · {count}
          </button>
        ))}
      </div>

      {/* content */}
      {filtered.length === 0 ? (
        <p className="mt-20 text-center font-mono text-sm text-ink-mute">No articles match that topic yet.</p>
      ) : view === 'series' ? (
        <div className="mt-10 space-y-14">
          {groups.map(g => (
            <section key={g.slug}>
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">{g.name}</h2>
                  <p className="mt-1 font-mono text-[11px] text-ink-mute">
                    {g.items.length} article{g.items.length === 1 ? '' : 's'}
                  </p>
                </div>
                <Link
                  href={`/series/${g.slug}`}
                  className="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-ink-dim transition-colors hover:text-accent"
                >
                  View curriculum <ArrowRight size={14} />
                </Link>
              </div>
              <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map(a => (
                  <ArticleCard key={a.slug} article={a} />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <motion.div layout className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map(a => (
            <motion.div
              key={a.slug}
              layout
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <ArticleCard article={a} showSeries />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
