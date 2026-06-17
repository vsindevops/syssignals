import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isFreeSlug } from '@/lib/access'

/**
 * Article gate: reading an article requires being signed in — EXCEPT the public
 * free-preview window (see `@/lib/access`), kept open so search engines can index
 * it and new readers get a free on-ramp before the sign-in wall.
 *
 * This is a fast cookie-presence check (the session itself is validated
 * against the database by the API routes) so article pages stay statically
 * served. OG images stay public — link previews on X/LinkedIn must work.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // public: social-card images for link previews
  if (pathname.endsWith('/opengraph-image')) return NextResponse.next()

  // public: the free-preview window (first N days + per-series extras) — SEO
  const slug = pathname.split('/')[2] ?? '' // /articles/<slug>
  if (isFreeSlug(slug)) return NextResponse.next()

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
