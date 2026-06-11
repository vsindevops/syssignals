'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageSquare } from 'lucide-react'

/**
 * Giscus comments (GitHub Discussions on syssignals/30-days-devops).
 * Loaded lazily when scrolled near the viewport. Mapped by slug ("specific"
 * term) so discussions survive any future URL changes.
 */
export default function Comments({ slug }: { slug: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin: '600px 0px' },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!visible || !ref.current || ref.current.querySelector('iframe, script')) return
    const s = document.createElement('script')
    s.src = 'https://giscus.app/client.js'
    s.async = true
    s.crossOrigin = 'anonymous'
    const attrs: Record<string, string> = {
      'data-repo': 'syssignals/30-days-devops',
      'data-repo-id': 'R_kgDOSdLhDg',
      'data-category': 'General',
      'data-category-id': 'DIC_kwDOSdLhDs4C9Krv',
      'data-mapping': 'specific',
      'data-term': slug,
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'top',
      'data-theme': 'transparent_dark',
      'data-lang': 'en',
    }
    for (const [k, v] of Object.entries(attrs)) s.setAttribute(k, v)
    ref.current.appendChild(s)
  }, [visible, slug])

  return (
    <section className="mt-14" aria-label="Comments">
      <h2 className="flex items-center gap-2.5 font-display text-xl font-semibold text-ink">
        <MessageSquare size={18} className="text-accent" />
        Discussion
      </h2>
      <p className="mt-1.5 text-sm text-ink-mute">
        Comments are powered by GitHub Discussions — sign in with GitHub to join.
      </p>
      <div ref={ref} className="mt-6 min-h-[180px]" />
    </section>
  )
}
