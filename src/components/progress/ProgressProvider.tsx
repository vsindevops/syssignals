'use client'

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'

const STORAGE_KEY = 'ss:completed'
const LAST_READ_KEY = 'ss:last-read'
const MERGED_KEY = 'ss:merged' // set once local progress has been imported into the account

interface ProgressContextValue {
  completed: string[]
  hydrated: boolean
  isComplete: (slug: string) => boolean
  toggle: (slug: string) => void
  lastRead: string | null
  setLastRead: (slug: string) => void
  /** null = unknown (still loading), false = anonymous, string = signed-in email */
  user: string | null | false
  refreshUser: () => void
}

const ProgressContext = createContext<ProgressContextValue>({
  completed: [],
  hydrated: false,
  isComplete: () => false,
  toggle: () => {},
  lastRead: null,
  setLastRead: () => {},
  user: null,
  refreshUser: () => {},
})

const readLocal = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

const writeLocal = (slugs: string[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slugs))
  } catch {}
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([])
  const [lastRead, setLastReadState] = useState<string | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [user, setUser] = useState<string | null | false>(null)
  const signedIn = useRef(false)

  const loadServer = useCallback(async (local: string[], localLastRead: string | null) => {
    try {
      const res = await fetch('/api/progress')
      const data = await res.json()
      if (!data.authenticated) {
        signedIn.current = false
        setUser(false)
        return
      }
      signedIn.current = true
      setUser(data.email ?? '')

      let serverSlugs: string[] = data.completed ?? []

      // One-time import of progress made before this device signed in.
      const needsMerge = !localStorage.getItem(MERGED_KEY) && local.length > 0
      if (needsMerge) {
        const missing = local.filter(s => !serverSlugs.includes(s))
        if (missing.length > 0) {
          await fetch('/api/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slugs: missing }),
          })
          serverSlugs = [...serverSlugs, ...missing]
        }
      }
      try {
        localStorage.setItem(MERGED_KEY, '1')
      } catch {}

      setCompleted(serverSlugs)
      writeLocal(serverSlugs)
      if (data.lastRead) setLastReadState(data.lastRead)
      else if (localLastRead) setLastReadState(localLastRead)
    } catch {
      // network hiccup — stay on local state
      setUser(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      const local = readLocal()
      const localLastRead = localStorage.getItem(LAST_READ_KEY)
      setCompleted(local)
      setLastReadState(localLastRead)
      setHydrated(true)
      loadServer(local, localLastRead)
    })
  }, [loadServer])

  const toggle = useCallback((slug: string) => {
    setCompleted(prev => {
      const done = !prev.includes(slug)
      const next = done ? [...prev, slug] : prev.filter(s => s !== slug)
      writeLocal(next)
      if (signedIn.current) {
        fetch('/api/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, done }),
        }).catch(() => {})
      }
      return next
    })
  }, [])

  const isComplete = useCallback((slug: string) => completed.includes(slug), [completed])

  const setLastRead = useCallback((slug: string) => {
    setLastReadState(slug)
    try {
      localStorage.setItem(LAST_READ_KEY, slug)
    } catch {}
    if (signedIn.current) {
      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastRead: slug }),
      }).catch(() => {})
    }
  }, [])

  const refreshUser = useCallback(() => {
    loadServer(readLocal(), localStorage.getItem(LAST_READ_KEY))
  }, [loadServer])

  return (
    <ProgressContext.Provider
      value={{ completed, hydrated, isComplete, toggle, lastRead, setLastRead, user, refreshUser }}
    >
      {children}
    </ProgressContext.Provider>
  )
}

export const useProgress = () => useContext(ProgressContext)
