import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Article gate: reading an article requires being signed in.
 *
 * This is a fast cookie-presence check (the session itself is validated
 * against the database by the API routes) so article pages stay statically
 * served. OG images stay public — link previews on X/LinkedIn must work.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // public: social-card images for link previews
  if (pathname.endsWith('/opengraph-image')) return NextResponse.next()

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
