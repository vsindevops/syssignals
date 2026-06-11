'use client'

import Link from 'next/link'
import { Play } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'
import type { SearchDoc } from '@/lib/articles'

/**
 * "Continue where you left off" strip — appears once the reader has opened
 * at least one article on this device.
 */
export default function ContinueCard({ docs, total }: { docs: SearchDoc[]; total: number }) {
  const { hydrated, lastRead, completed } = useProgress()
  if (!hydrated) return null

  // Next unfinished lesson after the last-read one, falling back to last read.
  const ordered = [...docs].sort((a, b) => (a.day ?? 0) - (b.day ?? 0))
  const lastDoc = ordered.find(d => d.slug === lastRead)
  if (!lastDoc) return null

  const next =
    ordered.find(d => (d.day ?? 0) > (lastDoc.day ?? 0) && !completed.includes(d.slug)) ??
    (completed.includes(lastDoc.slug) ? null : lastDoc)
  const target = next ?? lastDoc
  const pct = Math.round((completed.length / total) * 100)

  return (
    <section className="mx-auto -mt-6 max-w-6xl px-5 pb-4">
      <Link
        href={`/articles/${target.slug}`}
        className="card card-hover group flex items-center gap-5 p-5"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:scale-110">
          <Play size={18} className="ml-0.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-[11px] uppercase tracking-wider text-ink-mute">
            {next && next !== lastDoc ? 'Up next for you' : 'Continue where you left off'}
          </span>
          <span className="mt-1 block truncate font-display text-[15.5px] font-semibold text-ink">
            Day {target.day}: {target.title}
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-3 sm:flex">
          <span className="font-mono text-xs text-ink-mute">{pct}% of series</span>
          <span className="h-1.5 w-28 overflow-hidden rounded-full bg-surface-3">
            <span className="block h-full rounded-full bg-gradient-to-r from-accent to-accent-2" style={{ width: `${pct}%` }} />
          </span>
        </span>
      </Link>
    </section>
  )
}
