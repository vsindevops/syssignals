'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { LogOut, UserRound, BookOpenCheck, Settings } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'

export default function AccountMenu() {
  const { user, completed } = useProgress()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [open])

  // unknown yet — reserve no space, avoid flicker
  if (user === null) return null

  if (user === false) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2 px-3.5 py-1.5 text-[13px] font-medium text-ink-dim transition-colors hover:border-accent/50 hover:text-ink"
      >
        <UserRound size={14} />
        Sign in
      </Link>
    )
  }

  const initial = (user || '?').charAt(0).toUpperCase()

  const handleSignOut = async () => {
    // device returns to a clean anonymous state — the account keeps everything
    try {
      localStorage.removeItem('ss:completed')
      localStorage.removeItem('ss:last-read')
      localStorage.removeItem('ss:merged')
    } catch {}
    await signOut({ redirect: false })
    window.location.href = '/'
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Account menu"
        className={`flex h-8.5 w-8.5 items-center justify-center rounded-full border text-[13px] font-semibold transition-colors ${
          open ? 'border-accent/60 bg-accent/15 text-accent' : 'border-line-2 bg-surface-2 text-ink-dim hover:border-accent/40 hover:text-ink'
        }`}
      >
        {initial}
      </button>

      {open && (
        <div className="card absolute right-0 top-11 z-50 w-64 overflow-hidden !rounded-xl p-1.5 shadow-2xl animate-fade-up">
          <div className="border-b border-line px-3 py-2.5">
            <p className="truncate text-[13px] font-medium text-ink">{user}</p>
            <p className="mt-0.5 font-mono text-[11px] text-ink-mute">progress synced</p>
          </div>
          <Link
            href="/series/30-days-devops"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-ink-dim transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <BookOpenCheck size={15} className="text-green" />
            {completed.length} day{completed.length === 1 ? '' : 's'} completed
          </Link>
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-ink-dim transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <Settings size={15} className="text-ink-mute" />
            Settings &amp; membership
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-ink-dim transition-colors hover:bg-surface-3 hover:text-ink"
          >
            <LogOut size={15} className="text-ink-mute" />
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}
