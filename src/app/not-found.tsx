import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-sm text-accent">404 — signal lost</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-ink">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-3 max-w-sm text-[15px] text-ink-dim">
        The route you followed has no endpoint. Try the curriculum instead.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-xl bg-accent px-6 py-3 text-[15px] font-semibold text-bg transition-transform hover:scale-[1.03]"
      >
        Back to home
      </Link>
    </div>
  )
}
