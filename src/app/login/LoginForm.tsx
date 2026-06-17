'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Mail, Loader2, MailCheck } from 'lucide-react'

type Status = 'idle' | 'loading' | 'sent' | 'error'

interface Props {
  initialSent: boolean
  error?: string
  returnTo?: string
  googleEnabled?: boolean
}

const GoogleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38z" />
  </svg>
)

export default function LoginForm({ initialSent, error, returnTo = '/', googleEnabled }: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<Status>(initialSent ? 'sent' : 'idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (status === 'loading') return
    setStatus('loading')
    // redirectTo: the magic link drops the reader back where they started
    const res = await signIn('resend', { email, redirect: false, redirectTo: returnTo })
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
    <div className="card p-8">
      {(status === 'error' || error) && (
        <p className="mb-4 rounded-lg border border-red/30 bg-red/10 px-3.5 py-2.5 text-[13px] text-red">
          {error === 'Verification'
            ? 'That sign-in link has expired or was already used — request a fresh one.'
            : error === 'OAuthAccountNotLinked'
              ? 'That email is already registered with a different sign-in method.'
              : 'Could not sign you in. Please try again.'}
        </p>
      )}

      {googleEnabled && (
        <>
          <button
            type="button"
            onClick={() => signIn('google', { redirectTo: returnTo })}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-line bg-surface-2 px-5 py-3 text-[14.5px] font-medium text-ink transition-colors hover:border-line-2"
          >
            <GoogleIcon />
            Continue with Google
          </button>
          <div className="my-5 flex items-center gap-3">
            <span className="h-px flex-1 bg-line" />
            <span className="font-mono text-[11px] uppercase tracking-wider text-ink-mute">or email</span>
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      <form onSubmit={submit}>
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
      </form>
      <p className="mt-4 text-center text-[12.5px] leading-relaxed text-ink-mute">
        No password needed — we email you a one-time link.
        <br />
        New here? Signing in creates your account.
      </p>
    </div>
  )
}
