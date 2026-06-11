'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

/** Public view-count chip backed by the GoatCounter counter API. */
export default function ViewCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<string | null>(null)

  useEffect(() => {
    const path = encodeURIComponent(`/articles/${slug}`)
    fetch(`https://syssignals.goatcounter.com/counter/${path}.json`)
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (d?.count) setCount(String(d.count).trim())
      })
      .catch(() => {})
  }, [slug])

  if (!count) return null

  return (
    <span className="flex items-center gap-1.5">
      <Eye size={12} />
      {count} views
    </span>
  )
}
