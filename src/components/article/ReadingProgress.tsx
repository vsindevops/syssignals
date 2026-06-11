'use client'

import { useEffect, useState } from 'react'

/** Thin gradient bar under the navbar showing scroll progress through the page. */
export default function ReadingProgress() {
  const [pct, setPct] = useState(0)

  useEffect(() => {
    let raf = 0
    const onScroll = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const doc = document.documentElement
        const max = doc.scrollHeight - window.innerHeight
        setPct(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0)
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="fixed inset-x-0 top-0 z-[60] h-[2.5px] bg-transparent" aria-hidden="true">
      <div
        className="h-full bg-gradient-to-r from-accent to-accent-2"
        style={{ width: `${pct}%`, transition: 'width 80ms linear' }}
      />
    </div>
  )
}
