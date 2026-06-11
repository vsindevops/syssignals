import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { ArticleMeta } from '@/lib/articles'

export default function ArticleCard({ article }: { article: ArticleMeta }) {
  return (
    <Link href={`/articles/${article.slug}`} className="card card-hover group flex h-full flex-col p-6">
      <div className="flex items-center gap-3">
        {article.day !== undefined && (
          <span className="chip !border-accent/25 !text-accent">DAY {String(article.day).padStart(2, '0')}</span>
        )}
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-mute">
          <Clock size={11} />
          {article.readTime}
        </span>
      </div>

      <h3 className="mt-4 font-display text-[17px] font-semibold leading-snug text-ink transition-colors group-hover:text-accent">
        {article.title}
      </h3>

      <p className="mt-2.5 line-clamp-3 flex-1 text-[13.5px] leading-relaxed text-ink-mute">
        {article.excerpt}
      </p>

      <div className="mt-5 flex flex-wrap gap-1.5">
        {article.tags.slice(0, 3).map(t => (
          <span key={t} className="chip">{t}</span>
        ))}
      </div>
    </Link>
  )
}
