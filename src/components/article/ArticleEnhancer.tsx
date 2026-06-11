'use client'

import { useEffect } from 'react'
import { useProgress } from '@/components/progress/ProgressProvider'

/**
 * Client-side enhancement of the server-rendered article HTML:
 *  - header bar (language label + copy button) on every code figure
 *  - mermaid diagram rendering
 *  - records this article as last-read for "continue learning"
 */
export default function ArticleEnhancer({ slug, hasMermaid }: { slug: string; hasMermaid: boolean }) {
  const { setLastRead } = useProgress()

  useEffect(() => setLastRead(slug), [slug, setLastRead])

  // code block headers + copy
  useEffect(() => {
    const figures = document.querySelectorAll<HTMLElement>('figure[data-rehype-pretty-code-figure]')
    for (const fig of figures) {
      if (fig.querySelector('.code-head')) continue
      const pre = fig.querySelector('pre')
      if (!pre) continue
      const lang = pre.dataset.language || 'text'

      const head = document.createElement('div')
      head.className = 'code-head'
      const langEl = document.createElement('span')
      langEl.className = 'lang'
      langEl.textContent = lang
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.className = 'code-copy'
      btn.textContent = 'copy'
      btn.setAttribute('aria-label', 'Copy code')
      btn.addEventListener('click', async () => {
        const text = pre.innerText.replace(/\n$/, '')
        let ok = true
        try {
          await navigator.clipboard.writeText(text)
        } catch {
          // clipboard API unavailable (permissions / embedded context) — legacy path
          const ta = document.createElement('textarea')
          ta.value = text
          ta.style.position = 'fixed'
          ta.style.opacity = '0'
          document.body.appendChild(ta)
          ta.select()
          ok = document.execCommand('copy')
          ta.remove()
        }
        btn.textContent = ok ? '✓ copied' : 'failed'
        if (ok) btn.classList.add('copied')
        setTimeout(() => {
          btn.textContent = 'copy'
          btn.classList.remove('copied')
        }, 1600)
      })
      head.append(langEl, btn)
      fig.prepend(head)
    }
  }, [slug])

  // mermaid
  useEffect(() => {
    if (!hasMermaid) return
    let cancelled = false

    const run = async () => {
      const blocks = document.querySelectorAll<HTMLElement>('[data-mermaid]')
      if (blocks.length === 0) return
      const mermaid = (await import('mermaid')).default
      if (cancelled) return

      mermaid.initialize({
        startOnLoad: false,
        theme: 'base',
        themeVariables: {
          darkMode: true,
          background: '#0c1016',
          primaryColor: '#111722',
          primaryTextColor: '#e8edf4',
          primaryBorderColor: '#2a3850',
          secondaryColor: '#161e2b',
          tertiaryColor: '#0c1016',
          lineColor: '#5d6b7e',
          fontFamily: 'var(--font-jbmono), monospace',
          fontSize: '14px',
        },
      })

      let i = 0
      for (const block of blocks) {
        const src = block.querySelector('.mermaid-src')?.textContent
        const target = block.querySelector<HTMLElement>('.mermaid-target')
        if (!src || !target || target.dataset.rendered) continue
        try {
          const { svg } = await mermaid.render(`ss-mmd-${i++}`, src)
          if (cancelled) return
          target.innerHTML = svg
          target.dataset.rendered = '1'
        } catch {
          // fall back to showing the raw definition
          const fallback = block.querySelector<HTMLElement>('.mermaid-src')
          if (fallback) fallback.hidden = false
        }
      }
    }

    run()
    return () => {
      cancelled = true
    }
  }, [slug, hasMermaid])

  return null
}
