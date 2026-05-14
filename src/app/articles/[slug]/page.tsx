import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { getAllArticles, getArticle, getSeriesArticles } from '@/lib/mdx'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  return {
    title:       article.title,
    description: article.excerpt,
  }
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const seriesArticles = article.seriesSlug
    ? getSeriesArticles(article.seriesSlug)
    : []

  const currentIndex = seriesArticles.findIndex(a => a.slug === slug)
  const prev = currentIndex > 0 ? seriesArticles[currentIndex - 1] : null
  const next = currentIndex < seriesArticles.length - 1 ? seriesArticles[currentIndex + 1] : null

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex gap-10">

        {/* Article */}
        <article className="flex-1 min-w-0">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-text-muted mb-8">
            <Link href="/" className="hover:text-accent transition-colors">Home</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-accent transition-colors">Articles</Link>
            {article.series && (
              <>
                <span>/</span>
                <span className="text-text-secondary">{article.series}</span>
              </>
            )}
          </nav>

          {/* Header */}
          <header className="mb-10 pb-8 border-b border-border">
            {article.day && (
              <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-3">
                Day {article.day}
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-text-primary leading-tight">
              {article.title}
            </h1>
            {article.excerpt && (
              <p className="mt-3 text-base text-text-secondary leading-relaxed">
                {article.excerpt}
              </p>
            )}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-text-muted">
              <span>Vishwas Sharma</span>
              <span>·</span>
              {article.date && <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>}
              <span>·</span>
              <span>{article.readTime}</span>
              {article.tags.map(tag => (
                <span key={tag}
                  className="rounded-full border border-border px-2.5 py-0.5 text-text-secondary">
                  #{tag}
                </span>
              ))}
            </div>
          </header>

          {/* Content */}
          <div className="prose prose-invert prose-sm max-w-none
            prose-headings:font-semibold prose-headings:tracking-tight
            prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-3 prose-h2:border-b prose-h2:border-border
            prose-h3:text-base prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-text-secondary prose-p:leading-relaxed
            prose-a:text-accent prose-a:no-underline hover:prose-a:underline
            prose-code:text-[#f0883e] prose-code:bg-bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-[0.84em] prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
            prose-pre:bg-bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:text-sm
            prose-blockquote:border-l-accent prose-blockquote:bg-bg-secondary prose-blockquote:rounded-r-md prose-blockquote:not-italic prose-blockquote:text-text-secondary
            prose-table:text-sm prose-th:text-text-primary prose-th:font-semibold prose-td:text-text-secondary
            prose-hr:border-border
            prose-strong:text-text-primary prose-strong:font-semibold
            prose-li:text-text-secondary">
            <MDXRemote source={article.content} />
          </div>

          {/* Prev / Next */}
          {(prev || next) && (
            <nav className="mt-14 pt-8 border-t border-border grid grid-cols-2 gap-4">
              {prev ? (
                <Link href={`/articles/${prev.slug}`}
                  className="group rounded-lg border border-border bg-bg-secondary p-4 hover:border-accent transition-all">
                  <p className="text-[11px] text-text-muted mb-1">← Previous</p>
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                    {prev.title}
                  </p>
                </Link>
              ) : <div />}
              {next && (
                <Link href={`/articles/${next.slug}`}
                  className="group rounded-lg border border-border bg-bg-secondary p-4 hover:border-accent transition-all text-right ml-auto w-full">
                  <p className="text-[11px] text-text-muted mb-1">Next →</p>
                  <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors line-clamp-2">
                    {next.title}
                  </p>
                </Link>
              )}
            </nav>
          )}

        </article>

        {/* Series sidebar */}
        {seriesArticles.length > 0 && (
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-20 rounded-xl border border-border bg-bg-secondary p-4">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-text-muted mb-3">
                {article.series}
              </p>
              <ul className="space-y-0.5">
                {seriesArticles.map((a, i) => (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className={`flex items-start gap-2.5 rounded-md px-2.5 py-2 text-xs transition-colors ${
                        a.slug === slug
                          ? 'bg-accent/10 text-accent font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                      }`}
                    >
                      <span className="shrink-0 text-[10px] text-text-muted mt-0.5 w-4 text-right">
                        {i + 1}
                      </span>
                      <span className="leading-snug">{a.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}

      </div>
    </div>
  )
}
