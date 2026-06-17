import type { Metadata } from 'next'
import LoginForm from './LoginForm'
import { googleEnabled } from '@/auth'

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to Systems & Signals to sync your reading progress across devices.',
  robots: { index: false, follow: true },
}

interface Props {
  searchParams: Promise<{ sent?: string; error?: string; callbackUrl?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { sent, error, callbackUrl } = await searchParams
  // same-origin paths only — never forward to an absolute URL
  const returnTo = callbackUrl?.startsWith('/') && !callbackUrl.startsWith('//') ? callbackUrl : '/'

  return (
    <div className="relative">
      <div className="bg-grid bg-grid-fade absolute inset-x-0 top-0 -z-10 h-[340px]" />
      <div className="mx-auto max-w-md px-5 pt-16">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">account</p>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-ink">
            Sign in to sync your progress
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-[14.5px] leading-relaxed text-ink-dim">
            Your completed days follow you across devices — and anything you&apos;ve
            already marked on this one is imported automatically.
          </p>
        </div>
        <div className="mt-8">
          <LoginForm initialSent={sent === '1'} error={error} returnTo={returnTo} googleEnabled={googleEnabled} />
        </div>
      </div>
    </div>
  )
}
