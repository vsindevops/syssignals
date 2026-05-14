import type { Metadata } from 'next'
import Link from 'next/link'
import { getAllArticles } from '@/lib/mdx'

export const metadata: Metadata = { title: 'Articles' }

export default function ArticlesPage() {
  const articles = getAllArticles()

  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-text-primary">All Articles</h1>
      <p className="mt-2 text-sm text-text-secondary">
        {articles.length} article{articles.length !== 1 ? 's' : ''} published.
      </p>

      <div className="mt-10 space-y-3">
        {articles.length === 0 && (
          <p className="text-sm text-text-muted">No articles yet — check back soon.</p>
        )}
        {articles.map(article => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}`}
            className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-border bg-bg-secondary px-5 py-4 hover:border-accent transition-all"
          >
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors truncate">
                {article.title}
              </p>
              {article.excerpt && (
                <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{article.excerpt}</p>
              )}
            </div>
            <div className="flex items-center gap-3 shrink-0 text-[11px] text-text-muted">
              {article.series && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-text-secondary whitespace-nowrap">
                  {article.series}
                </span>
              )}
              {article.tags.slice(0, 2).map(tag => (
                <span key={tag} className="hidden sm:inline text-text-muted">#{tag}</span>
              ))}
              <span className="whitespace-nowrap">{article.readTime}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
