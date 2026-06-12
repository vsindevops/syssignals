'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, Loader2, MailCheck } from 'lucide-react'

type Status = 'idle' | 'loading' | 'sent' | 'error'

export default function LoginForm({ initialSent, error }: { initialSent: boolean; error?: string }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(initialSent ? 'sent' : 'idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    const res = await signIn('resend', { email, redirect: false })
    setStatus(res?.error ? 'error' : 'sent')
  }

  if (status === 'sent') {
    return (
      <div className="card p-8 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green/10 text-green">
          <MailCheck size={22} />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold text-ink">Check your inbox</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-mute">
          We sent a sign-in link{email ? <> to <span className="text-ink-dim">{email}</span></> : ''}.
          Click it on this device and you&apos;ll be signed in here. The link
          expires in 24 hours.
        </p>
        <button
          onClick={() => setStatus('idle')}
          className="mt-5 text-sm text-accent hover:underline"
        >
          Use a different email
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={submit} className="card p-8">
      {(status === 'error' || error) && (
        <p className="mb-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2.5 text-[13px] text-red">
          {error === 'Verification'
            ? 'That sign-in link has expired or was already used — request a fresh one.'
            : 'Could not send the sign-in link. Please try again.'}
        </p>
      )}
      <label htmlFor="login-email" className="mb-2 block text-sm font-medium text-ink-dim">
        Email address
      </label>
      <div className="relative">
        <Mail size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
        <input
          id="login-email"
          type="email"
          required
          autoFocus
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-line bg-surface-2 py-3 pl-10 pr-3 text-[14.5px] text-ink placeholder:text-ink-mute transition-colors focus:border-accent/60 focus:outline-none"
        />
      </div>
      <button
        type="submit"
        disabled={status === 'loading'}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-[14.5px] font-semibold text-bg transition-transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
      >
        {status === 'loading' && <Loader2 size={15} className="animate-spin" />}
        Email me a sign-in link
      </button>
      <p className="mt-4 text-center text-[12.5px] leading-relaxed text-ink-mute">
        No password needed — we email you a one-time link.
        <br />
        New here? The same link creates your account.
      </p>
    </form>
  )
}
