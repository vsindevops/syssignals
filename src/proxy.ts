import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Article gate: reading an article requires being signed in — EXCEPT a public
 * free-preview window, kept open so search engines can index it and new readers
 * get a free on-ramp before the sign-in wall.
 *
 * Free = the first `FREE_PREVIEW_DAYS` days of any series, PLUS any per-series
 * `EXTRA_FREE_DAYS` (e.g. the DevOps finale, Day 30, as a free payoff/teaser).
 *
 * This is a fast cookie-presence check (the session itself is validated
 * against the database by the API routes) so article pages stay statically
 * served. OG images stay public — link previews on X/LinkedIn must work.
 */
const FREE_PREVIEW_DAYS = 7

/**
 * Extra always-public days beyond the preview window, keyed by the series' slug
 * prefix (`''` = the prefix-less DevOps series, `'py-'` = Python). The DevOps
 * Day 30 capstone is free as a finale teaser.
 */
const EXTRA_FREE_DAYS: Record<string, number[]> = {
  '': [30],
}

/**
 * `{ prefix, day }` from a slug, or null if it isn't day-numbered. Works for
 * every series: `day-30-...` → {prefix:'', day:30} (DevOps),
 * `py-day-01-...` → {prefix:'py-', day:1} (Python).
 */
function parseSlug(pathname: string): { prefix: string; day: number } | null {
  const slug = pathname.split('/')[2] ?? '' // /articles/<slug>
  const m = slug.match(/^([a-z]+-)?day-0*(\d+)-/)
  return m ? { prefix: m[1] ?? '', day: Number(m[2]) } : null
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // public: social-card images for link previews
  if (pathname.endsWith('/opengraph-image')) return NextResponse.next()

  // public: the free-preview window (first N days + per-series extras) — SEO
  const parsed = parseSlug(pathname)
  if (parsed) {
    const { prefix, day } = parsed
    const isFree = day <= FREE_PREVIEW_DAYS || (EXTRA_FREE_DAYS[prefix] ?? []).includes(day)
    if (isFree) return NextResponse.next()
  }

  const hasSession =
    request.cookies.has('__Secure-authjs.session-token') ||
    request.cookies.has('authjs.session-token')
  if (hasSession) return NextResponse.next()

  const login = new URL('/login', request.url)
  login.searchParams.set('callbackUrl', pathname)
  return NextResponse.redirect(login)
}

export const config = {
  // only article detail pages — the index, series and homepage stay open
  matcher: '/articles/:slug+',
}
