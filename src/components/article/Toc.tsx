'use client'

import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'
import type { TocEntry } from '@/lib/markdown'

export default function Toc({ entries }: { entries: TocEntry[] }) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const headings = entries
      .map(e => document.getElementById(e.id))
      .filter((el): el is HTMLElement => el !== null)
    if (headings.length === 0) return

    const visible = new Set<string>()
    const observer = new IntersectionObserver(
      observed => {
        for (const entry of observed) {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        }
        if (visible.size > 0) {
          // highest visible heading
          const first = headings.find(h => visible.has(h.id))
          if (first) setActive(first.id)
        } else {
          // none visible — highlight the last heading above the viewport
          let lastAbove: string | null = null
          for (const h of headings) {
            if (h.getBoundingClientRect().top < 120) lastAbove = h.id
          }
          if (lastAbove) setActive(lastAbove)
        }
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    )
    headings.forEach(h => observer.observe(h))
    return () => observer.disconnect()
  }, [entries])

  if (entries.length === 0) return null

  return (
    <nav aria-label="Table of contents" className="text-[13px]">
      <p className="mb-3 font-mono text-[11px] uppercase tracking-widest text-ink-mute">On this page</p>
      <ul className="space-y-0.5 border-l border-line">
        {entries.map(e => (
          <li key={e.id}>
            <a
              href={`#${e.id}`}
              className={`block border-l-2 py-1 leading-snug transition-colors ${
                e.depth === 3 ? 'pl-7' : 'pl-3.5'
              } ${
                active === e.id
                  ? '-ml-px border-accent text-accent'
                  : '-ml-px border-transparent text-ink-mute hover:text-ink-dim'
              }`}
            >
              {e.text}
            </a>
          </li>
        ))}
      </ul>
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="mt-5 flex items-center gap-1.5 font-mono text-[11px] text-ink-mute transition-colors hover:text-accent"
      >
        <ArrowUp size={12} /> back to top
      </button>
    </nav>
  )
}
