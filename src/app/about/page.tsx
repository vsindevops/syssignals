import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Reveal from '@/components/motion/Reveal'

const XIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const GitHubIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
  </svg>
)

export const metadata: Metadata = {
  title: 'About',
  description: 'Systems & Signals is built by Vishwas Sharma — project-based DevOps, MLOps and AI engineering content, published in public.',
}

const PRINCIPLES = [
  {
    title: 'Projects over theory',
    body: 'You learn systems by running them. Every article leaves you with something working on your machine — a pipeline, a cluster, a deployment — not a pile of definitions.',
  },
  {
    title: 'Verified, end to end',
    body: 'Every command is executed before it is published, with its expected output shown. Articles are validated for internal consistency — ports, names, versions, error messages — before they ship.',
  },
  {
    title: 'Explain the diagram',
    body: 'A diagram nobody explains is worse than no diagram. Every one comes with a plain-English walkthrough of each node, arrow and colour.',
  },
  {
    title: 'Respect the learner',
    body: 'No command appears without context — what the tool is, why it is needed, what each flag does. Copy-paste-complete file contents, never "edit line 12". Common errors and their fixes, always.',
  },
]

export default function AboutPage() {
  return (
    <div className="relative">
      <div className="bg-grid bg-grid-fade absolute inset-x-0 top-0 -z-10 h-[360px]" />
      <div className="mx-auto max-w-3xl px-5 pt-14">
        <Reveal>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">about</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">
            Signal, extracted from <span className="gradient-text">systems</span>.
          </h1>
          <div className="mt-6 space-y-4 text-[15.5px] leading-relaxed text-ink-dim">
            <p>
              Systems &amp; Signals is a project-based learning platform for DevOps,
              MLOps and AI engineering, built and written by{' '}
              <span className="font-medium text-ink">Vishwas Sharma</span>. It started
              with a simple frustration: most infrastructure tutorials either skip the
              parts that break, or never actually run their own commands.
            </p>
            <p>
              The flagship series, <Link href="/series/30-days-devops" className="text-accent hover:underline">30 Days of DevOps</Link>,
              builds a production-grade platform from zero — Git workflows to Docker to a full
              Kubernetes stack with GitOps, observability, security policies and scheduling —
              one verified, hands-on project per day, published in public.
            </p>
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <h2 className="font-display text-2xl font-semibold text-ink">How articles are made</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {PRINCIPLES.map(p => (
              <div key={p.title} className="card h-full p-6">
                <h3 className="font-display text-[15.5px] font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-ink-mute">{p.body}</p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal className="mt-14">
          <div className="card flex flex-col items-start gap-5 p-8 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h2 className="font-display text-xl font-semibold text-ink">Follow the build</h2>
              <p className="mt-1.5 text-sm text-ink-mute">
                New days announced on X. Code for every article lives on GitHub.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="https://x.com/syssignals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
              >
                <XIcon /> @syssignals
              </a>
              <a
                href="https://github.com/syssignals"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface-2 px-4 py-2.5 text-sm font-medium text-ink-dim transition-colors hover:border-line-2 hover:text-ink"
              >
                <GitHubIcon /> syssignals
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <Link
            href="/series/30-days-devops"
            className="group inline-flex items-center gap-2 text-[15px] font-medium text-accent"
          >
            Start with Day 1 of the curriculum
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
