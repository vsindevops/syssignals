'use client'

import { createContext, useCallback, useContext, useEffect, useState } from 'react'

const STORAGE_KEY = 'ss:completed'
const LAST_READ_KEY = 'ss:last-read'

interface ProgressContextValue {
  completed: string[]
  hydrated: boolean
  isComplete: (slug: string) => boolean
  toggle: (slug: string) => void
  lastRead: string | null
  setLastRead: (slug: string) => void
}

const ProgressContext = createContext<ProgressContextValue>({
  completed: [],
  hydrated: false,
  isComplete: () => false,
  toggle: () => {},
  lastRead: null,
  setLastRead: () => {},
})

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [lastRead, setLastReadState] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    // microtask defers setState past the synchronous effect body, and still
    // lands before paint — server HTML and first client render stay identical
    queueMicrotask(() => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (raw) setCompleted(JSON.parse(raw))
        setLastReadState(localStorage.getItem(LAST_READ_KEY))
      } catch {
        /* private mode / corrupt state — start fresh */
      }
      setHydrated(true)
    })
  }, [])

  const persist = (slugs: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
    } catch {}
  }

  const toggle = useCallback((slug: string) => {
    setCompleted(prev => {
      const next = prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
      persist(next)
      return next
    })
  }, [])

  const isComplete = useCallback((slug: string) => completed.includes(slug), [completed])

  const setLastRead = useCallback((slug: string) => {
    setLastReadState(slug)
    try {
      localStorage.setItem(LAST_READ_KEY, slug)
    } catch {}
  }, [])

  return (
    <ProgressContext.Provider value={{ completed, hydrated, isComplete, toggle, lastRead, setLastRead }}>
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
