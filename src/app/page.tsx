import Link from 'next/link'
import { getAllArticles } from '@/lib/mdx'

const DOMAINS = [
  { icon: '⚙️', label: 'DevOps',   desc: 'CI/CD, containers, Kubernetes, IaC, and cloud infrastructure.'   },
  { icon: '🤖', label: 'MLOps',    desc: 'ML pipelines, model serving, monitoring, and experiment tracking.' },
  { icon: '🔐', label: 'Security', desc: 'Hardening, secrets management, threat modelling, and compliance.'  },
]

export default function HomePage() {
  const articles = getAllArticles().slice(0, 5)

  return (
    <>
      {/* Hero */}
      <section className="border-b border-border bg-bg-primary">
        <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <p className="text-xs font-semibold uppercase tracking-widest text-accent mb-4">
            Learn by building
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary leading-tight max-w-2xl">
            The engineer&apos;s guide to<br />
            <span className="text-accent">DevOps · MLOps · Security</span>
          </h1>
          <p className="mt-6 text-base text-text-secondary leading-relaxed max-w-xl">
            Project-based articles and courses that ship working systems.
            No isolated theory. No toy examples. Every piece of content
            produces something you can run.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/series"
              className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-bg-primary hover:bg-[#79b8ff] transition-colors">
              Browse Series
            </Link>
            <Link href="/articles"
              className="rounded-md border border-border px-5 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-text-secondary transition-colors">
              All Articles
            </Link>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="border-b border-border bg-bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DOMAINS.map(({ icon, label, desc }) => (
              <div key={label} className="rounded-lg border border-border bg-bg-primary p-5">
                <div className="text-2xl mb-3">{icon}</div>
                <p className="text-sm font-semibold text-text-primary mb-1">{label}</p>
                <p className="text-xs text-text-secondary leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest articles */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-text-muted">
            Latest Articles
          </h2>
          <Link href="/articles" className="text-xs text-accent hover:underline">
            View all →
          </Link>
        </div>

        <div className="space-y-3">
          {articles.length === 0 && (
            <p className="text-sm text-text-muted">No articles yet — check back soon.</p>
          )}
          {articles.map(article => (
            <Link
              key={article.slug}
              href={`/articles/${article.slug}`}
              className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-border bg-bg-secondary px-5 py-4 hover:border-accent transition-all"
            >
              <div>
                <p className="text-sm font-medium text-text-primary group-hover:text-accent transition-colors">
                  {article.title}
                </p>
                {article.excerpt && (
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{article.excerpt}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0 text-[11px] text-text-muted">
                {article.series && (
                  <span className="rounded-full border border-border px-2.5 py-0.5 text-text-secondary">
                    {article.series}
                  </span>
                )}
                <span>{article.readTime}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA banner */}
      <section className="border-t border-border bg-bg-secondary">
        <div className="mx-auto max-w-6xl px-6 py-14 text-center">
          <h2 className="text-xl font-bold text-text-primary tracking-tight">
            Ready to start building?
          </h2>
          <p className="mt-2 text-sm text-text-secondary max-w-md mx-auto">
            Pick a series and work through it end-to-end. Every article is a step in a larger project.
          </p>
          <Link href="/series"
            className="mt-6 inline-block rounded-md bg-accent px-6 py-2.5 text-sm font-semibold text-bg-primary hover:bg-[#79b8ff] transition-colors">
            View all Series
          </Link>
        </div>
      </section>
    </>
  )
}
