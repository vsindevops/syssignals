'use client'

import { useState } from 'react'
import { Mail, Loader2, CheckCircle2 } from 'lucide-react'

type Status = 'idle' | 'loading' | 'done' | 'error'

export default function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setStatus('done')
        setMessage('You’re in — one email when a new day ships. No spam, ever.')
      } else {
        setStatus('error')
        setMessage(data.error ?? 'Something went wrong — please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error — please try again.')
    }
  }

  if (status === 'done') {
    return (
      <p className="flex items-center gap-2 text-[14.5px] font-medium text-green">
        <CheckCircle2 size={17} />
        {message}
      </p>
    )
  }

  return (
    <div>
      <form onSubmit={submit} className={`flex w-full gap-2.5 ${compact ? 'max-w-md' : 'mx-auto max-w-md'}`}>
        {/* honeypot */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          className="hidden"
        />
        <div className="relative min-w-0 flex-1">
          <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-3 text-[14px] text-ink placeholder:text-ink-mute transition-colors focus:border-accent/60 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={status === 'loading'}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-accent px-5 py-3 text-[14px] font-semibold text-bg transition-transform hover:scale-[1.03] active:scale-[0.97] disabled:opacity-60"
        >
          {status === 'loading' ? <Loader2 size={15} className="animate-spin" /> : null}
          Subscribe
        </button>
      </form>
      {status === 'error' && (
        <p className={`mt-2.5 text-[13px] text-amber ${compact ? '' : 'text-center'}`}>{message}</p>
      )}
    </div>
  )
}
