'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, CornerDownLeft } from 'lucide-react'
import type { SearchDoc } from '@/lib/articles'

interface Props {
  docs: SearchDoc[]
  open: boolean
  onClose: () => void
}

function score(doc: SearchDoc, q: string): number {
  const query = q.toLowerCase().trim()
  if (!query) return 1
  const title = doc.title.toLowerCase()
  const hay = `day ${doc.day ?? ''} ${title} ${doc.tags.join(' ')} ${doc.excerpt}`.toLowerCase()
  const terms = query.split(/\s+/)
  let s = 0
  for (const t of terms) {
    if (title.startsWith(t)) s += 6
    else if (title.includes(t)) s += 4
    else if (doc.tags.some(tag => tag.toLowerCase().includes(t))) s += 3
    else if (hay.includes(t)) s += 1
    else return 0 // every term must match somewhere
  }
  return s
}

export default function SearchPalette({ docs, open, onClose }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const results = useMemo(() => {
    return docs
      .map(d => ({ d, s: score(d, query) }))
      .filter(r => r.s > 0)
      .sort((a, b) => b.s - a.s || (b.d.day ?? 0) - (a.d.day ?? 0))
      .slice(0, 9)
      .map(r => r.d)
  }, [docs, query])

  // reset state when the palette opens / the query changes (adjust-during-render)
  const [prevOpen, setPrevOpen] = useState(open)
  const [prevQuery, setPrevQuery] = useState(query)
  if (prevOpen !== open) {
    setPrevOpen(open)
    if (open) {
      setQuery('')
      setPrevQuery('')
      setActive(0)
    }
  }
  if (prevQuery !== query) {
    setPrevQuery(query)
    setActive(0)
  }

  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' })
  }, [active])

  if (!open) return null

  const go = (slug: string) => {
    onClose()
    router.push(`/articles/${slug}`)
  }

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive(a => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive(a => Math.max(a - 1, 0))
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault()
      go(results[active].slug)
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[14vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Search articles"
    >
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="card relative w-full max-w-xl overflow-hidden shadow-2xl animate-fade-up !rounded-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={17} className="shrink-0 text-ink-mute" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search articles, topics, days…"
            className="w-full bg-transparent py-3.5 text-[15px] text-ink placeholder:text-ink-mute focus:outline-none"
          />
          <kbd className="shrink-0">esc</kbd>
        </div>

        <ul ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
          {results.length === 0 && (
            <li className="px-4 py-8 text-center font-mono text-sm text-ink-mute">
              no signal — try a different query
            </li>
          )}
          {results.map((doc, i) => (
            <li key={doc.slug} data-idx={i}>
              <button
                onClick={() => go(doc.slug)}
                onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                  i === active ? 'bg-surface-3 text-ink' : 'text-ink-dim'
                }`}
              >
                <FileText size={15} className={`shrink-0 ${i === active ? 'text-accent' : 'text-ink-mute'}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[14px] font-medium">
                    {doc.day !== undefined && (
                      <span className="mr-2 font-mono text-xs text-accent">D{String(doc.day).padStart(2, '0')}</span>
                    )}
                    {doc.title}
                  </span>
                  <span className="block truncate text-xs text-ink-mute">{doc.readTime} · {doc.tags.slice(0, 4).join(', ')}</span>
                </span>
                {i === active && <CornerDownLeft size={14} className="shrink-0 text-ink-mute" />}
              </button>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4 border-t border-line px-4 py-2 font-mono text-[11px] text-ink-mute">
          <span><kbd>↑</kbd> <kbd>↓</kbd> navigate</span>
          <span><kbd>↵</kbd> open</span>
          <span className="ml-auto">{results.length} result{results.length === 1 ? '' : 's'}</span>
        </div>
      </div>
    </div>
  )
}
