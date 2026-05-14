import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = { title: 'Series' }

const SERIES = [
  {
    slug:       '30-days-devops',
    title:      '30 Days of DevOps',
    domain:     'DevOps',
    status:     'Active',
    days:       30,
    desc:       'A structured 30-day program through the full DevOps toolchain. Git workflows, Docker, Kubernetes, CI/CD pipelines, Terraform, Ansible, Prometheus, Grafana, and security hardening.',
    topics:     ['Git & Branching', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'Secrets Management'],
    color:      'border-accent',
    dotColor:   'bg-success',
  },
]

const COMING = [
  { title: '30 Days of MLOps',    domain: 'MLOps',    desc: 'ML pipelines, experiment tracking, model serving, and monitoring in production.' },
  { title: '30 Days of Security', domain: 'Security', desc: 'Threat modelling, hardening, secrets management, CVE triage, and compliance automation.' },
]

export default function SeriesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">

      <h1 className="text-2xl font-bold tracking-tight text-text-primary">Series</h1>
      <p className="mt-2 text-sm text-text-secondary">
        Each series is a structured, project-based program. Work through it day by day and ship a real system.
      </p>

      {/* Active series */}
      <div className="mt-10 space-y-5">
        {SERIES.map(s => (
          <div key={s.slug}
            className={`rounded-xl border ${s.color} bg-bg-secondary p-6`}>
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${s.dotColor}`} />
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-success">
                    {s.status}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-text-primary tracking-tight">{s.title}</h2>
                <p className="text-xs text-text-secondary mt-1">{s.domain} · {s.days} articles</p>
              </div>
              <Link
                href={`/articles?series=${s.slug}`}
                className="shrink-0 rounded-md bg-accent px-4 py-2 text-xs font-semibold text-bg-primary hover:bg-[#79b8ff] transition-colors">
                Start Series →
              </Link>
            </div>

            <p className="mt-4 text-sm text-text-secondary leading-relaxed">{s.desc}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {s.topics.map(t => (
                <span key={t}
                  className="rounded-full border border-border px-2.5 py-0.5 text-[11px] text-text-secondary">
                  {t}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Coming soon */}
      <h2 className="mt-14 text-xs font-semibold uppercase tracking-widest text-text-muted mb-5">
        Coming Soon
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {COMING.map(s => (
          <div key={s.title}
            className="rounded-xl border border-border bg-bg-secondary p-5 opacity-60">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-text-muted" />
              <span className="text-[11px] font-semibold uppercase tracking-widest text-text-muted">
                In Development
              </span>
            </div>
            <h3 className="text-sm font-bold text-text-primary">{s.title}</h3>
            <p className="text-[11px] text-text-muted mt-0.5">{s.domain}</p>
            <p className="mt-2 text-xs text-text-secondary leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>

    </div>
  )
}
