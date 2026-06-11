'use client'

import { Check } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'

export default function MarkComplete({ slug, day }: { slug: string; day?: number }) {
  const { hydrated, isComplete, toggle } = useProgress()
  const done = hydrated && isComplete(slug)

  return (
    <button
      onClick={() => toggle(slug)}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[13.5px] font-medium transition-all active:scale-[0.97] ${
        done
          ? 'border-green/50 bg-green/10 text-green'
          : 'border-line bg-surface-2 text-ink-dim hover:border-accent/50 hover:text-ink'
      }`}
    >
      <span
        className={`flex h-4.5 w-4.5 items-center justify-center rounded-full border ${
          done ? 'border-green bg-green text-bg' : 'border-line-2 text-transparent'
        }`}
      >
        <Check size={11} strokeWidth={3.5} />
      </span>
      {done ? `Day ${day ?? ''} complete` : 'Mark as complete'}
    </button>
  )
}
