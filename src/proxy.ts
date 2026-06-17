import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Article gate: reading an article requires being signed in — EXCEPT the first
 * `FREE_PREVIEW_DAYS` days, which stay fully public so search engines can index
 * them and new readers get a free on-ramp before the sign-in wall.
 *
 * This is a fast cookie-presence check (the session itself is validated
 * against the database by the API routes) so article pages stay statically
 * served. OG images stay public — link previews on X/LinkedIn must work.
 */
const FREE_PREVIEW_DAYS = 7

/**
 * Day N from a slug, or null if it isn't day-numbered. Works for every series
 * regardless of prefix: `day-01-...` (DevOps) and `py-day-01-...` (Python) both
 * resolve to 1, so the free-preview window applies per-series.
 */
function dayFromPath(pathname: string): number | null {
  const slug = pathname.split('/')[2] ?? '' // /articles/<slug>
  const m = slug.match(/(?:^|-)day-0*(\d+)-/)
  return m ? Number(m[1]) : null
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // public: social-card images for link previews
  if (pathname.endsWith('/opengraph-image')) return NextResponse.next()

  // public: the first N days (SEO-indexable free preview)
  const day = dayFromPath(pathname)
  if (day !== null && day <= FREE_PREVIEW_DAYS) return NextResponse.next()

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
