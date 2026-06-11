import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Layers } from 'lucide-react'
import { getAllArticles, getArticle, getAdjacent } from '@/lib/articles'
import { renderMarkdown } from '@/lib/markdown'
import JsonLd, { articleJsonLd } from '@/components/JsonLd'
import ReadingProgress from '@/components/article/ReadingProgress'
import Toc from '@/components/article/Toc'
import ArticleEnhancer from '@/components/article/ArticleEnhancer'
import Comments from '@/components/article/Comments'
import MarkComplete from '@/components/article/MarkComplete'
import ViewCount from '@/components/article/ViewCount'
import NewsletterForm from '@/components/NewsletterForm'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getAllArticles().map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  return {
    title: article.day !== undefined ? `Day ${article.day}: ${article.title}` : article.title,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: article.date,
      tags: article.tags,
    },
  }
}

const fmtDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  })

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const { html, toc, hasMermaid } = await renderMarkdown(article.content)
  const { prev, next } = getAdjacent(slug)
  const shareUrl = `https://syssignals.com/articles/${slug}`
  const shareText = `${article.day !== undefined ? `Day ${article.day}: ` : ''}${article.title} — by @syssignals`

  return (
    <>
      <JsonLd data={articleJsonLd(article)} />
      <ReadingProgress />
      <ArticleEnhancer slug={slug} hasMermaid={hasMermaid} />

      <div className="relative">
        <div className="bg-grid bg-grid-fade absolute inset-x-0 top-0 -z-10 h-[340px]" />

        <div className="mx-auto max-w-6xl px-5 pt-10">
          {/* breadcrumb */}
          {article.series && (
            <Link
              href={`/series/${article.seriesSlug}`}
              className="inline-flex items-center gap-2 font-mono text-xs text-ink-mute transition-colors hover:text-accent"
            >
              <Layers size={12} />
              {article.series}
              {article.day !== undefined && article.seriesTotal && (
                <span className="text-ink-mute/70">· day {article.day} of {article.seriesTotal}</span>
              )}
            </Link>
          )}

          <div className="mt-5 grid gap-12 lg:grid-cols-[minmax(0,1fr)_230px]">
            <div className="min-w-0 max-w-[760px]">
              {/* header */}
              <header className="animate-fade-up">
                <div className="flex flex-wrap items-center gap-2">
                  {article.day !== undefined && (
                    <span className="chip !border-accent/25 !text-accent">DAY {String(article.day).padStart(2, '0')}</span>
                  )}
                  {article.topics.map(t => (
                    <span key={t} className="chip">{t}</span>
                  ))}
                </div>

                <h1 className="mt-5 font-display text-[2rem] font-bold leading-[1.15] tracking-tight text-ink sm:text-[2.6rem]">
                  {article.title}
                </h1>

                <p className="mt-5 text-[15.5px] leading-relaxed text-ink-dim">{article.excerpt}</p>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-line py-3.5 font-mono text-[12px] text-ink-mute">
                  <span className="flex items-center gap-1.5"><CalendarDays size={12} /> {fmtDate(article.date)}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> {article.readTime}</span>
                  <span>{Math.round(article.words / 100) / 10}k words</span>
                  <ViewCount slug={slug} />
                  <span className="ml-auto">
                    <MarkComplete slug={slug} day={article.day} />
                  </span>
                </div>
              </header>

              {/* body */}
              <article className="prose-ss mt-10" dangerouslySetInnerHTML={{ __html: html }} />

              {/* footer */}
              <footer className="mt-16 border-t border-line pt-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <MarkComplete slug={slug} day={article.day} />
                  <div className="flex items-center gap-2 font-mono text-xs text-ink-mute">
                    share:
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
                    >
                      X
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>

                <div className="card mt-10 p-6">
                  <p className="font-display text-[15.5px] font-semibold text-ink">
                    Get the next day in your inbox
                  </p>
                  <p className="mb-4 mt-1 text-[13px] text-ink-mute">
                    One email per published day — nothing else.
                  </p>
                  <NewsletterForm compact />
                </div>

                {(prev || next) && (
                  <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Series navigation">
                    {prev ? (
                      <Link href={`/articles/${prev.slug}`} className="card card-hover group p-5">
                        <span className="flex items-center gap-1.5 font-mono text-[11px] text-ink-mute">
                          <ArrowLeft size={12} className="transition-transform group-hover:-translate-x-0.5" />
                          previous · day {prev.day}
                        </span>
                        <span className="mt-2 block font-display text-[15px] font-semibold leading-snug text-ink group-hover:text-accent">
                          {prev.title}
                        </span>
                      </Link>
                    ) : (
                      <span />
                    )}
                    {next ? (
                      <Link href={`/articles/${next.slug}`} className="card card-hover group p-5 text-right">
                        <span className="flex items-center justify-end gap-1.5 font-mono text-[11px] text-ink-mute">
                          next · day {next.day}
                          <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                        </span>
                        <span className="mt-2 block font-display text-[15px] font-semibold leading-snug text-ink group-hover:text-accent">
                          {next.title}
                        </span>
                      </Link>
                    ) : (
                      <div className="card flex items-center justify-center p-5 font-mono text-xs text-ink-mute">
                        next day publishing soon — follow{' '}
                        <a href="https://x.com/syssignals" target="_blank" rel="noopener noreferrer" className="ml-1 text-accent hover:underline">
                          @syssignals
                        </a>
                      </div>
                    )}
                  </nav>
                )}

                <Comments slug={slug} />
              </footer>
            </div>

            {/* TOC rail */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pb-8 pr-1">
                <Toc entries={toc} />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}
