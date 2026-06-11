'use client'

import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import ArticleCard from '@/components/ArticleCard'
import type { ArticleMeta } from '@/lib/articles'

interface Props {
  articles: ArticleMeta[]
  tags: { tag: string; count: number }[]
}

export default function ArticlesExplorer({ articles, tags }: Props) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [order, setOrder] = useState<'new' | 'curriculum'>('new')

  const shown = useMemo(() => {
    const list = activeTag ? articles.filter(a => a.tags.includes(activeTag)) : [...articles]
    if (order === 'curriculum') list.sort((a, b) => (a.day ?? 99) - (b.day ?? 99))
    else list.sort((a, b) => (b.day ?? 0) - (a.day ?? 0))
    return list
  }, [articles, activeTag, order])

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveTag(null)}
          className={`chip transition-colors ${activeTag === null ? '!border-accent/50 !bg-accent/10 !text-accent' : 'hover:!text-ink-dim hover:!border-line-2'}`}
        >
          all · {articles.length}
        </button>
        {tags.slice(0, 14).map(({ tag, count }) => (
          <button
            key={tag}
            onClick={() => setActiveTag(t => (t === tag ? null : tag))}
            className={`chip transition-colors ${activeTag === tag ? '!border-accent/50 !bg-accent/10 !text-accent' : 'hover:!text-ink-dim hover:!border-line-2'}`}
          >
            {tag} · {count}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1 font-mono text-[11px] text-ink-mute">
          sort:
          {(['new', 'curriculum'] as const).map(o => (
            <button
              key={o}
              onClick={() => setOrder(o)}
              className={`rounded-md px-2 py-1 transition-colors ${order === o ? 'bg-surface-3 text-ink' : 'hover:text-ink-dim'}`}
            >
              {o === 'new' ? 'newest' : 'day order'}
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {shown.map(a => (
          <motion.div
            key={a.slug}
            layout
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ArticleCard article={a} />
          </motion.div>
        ))}
      </motion.div>

      {shown.length === 0 && (
        <p className="mt-16 text-center font-mono text-sm text-ink-mute">nothing here yet.</p>
      )}
    </div>
  )
}
