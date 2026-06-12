import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { db } from '@/lib/db'

/**
 * Reading progress for the signed-in user.
 *   GET  -> { authenticated, email?, completed?, lastRead? }
 *   POST -> { slug, done } toggle one article
 *           { slugs: [...] } bulk-merge (used once after login to import
 *                            localStorage progress)
 *           { lastRead }     update last-read pointer
 */
export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ authenticated: false })

  const userId = Number(session.user.id)
  const [progress, user] = await Promise.all([
    db().query('SELECT slug FROM progress WHERE user_id = $1', [userId]),
    db().query('SELECT email, last_read FROM users WHERE id = $1', [userId]),
  ])

  return NextResponse.json({
    authenticated: true,
    email: user.rows[0]?.email ?? session.user.email,
    completed: progress.rows.map(r => r.slug),
    lastRead: user.rows[0]?.last_read ?? null,
  })
}

const SLUG_RE = /^[a-z0-9-]{1,120}$/

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }
  const userId = Number(session.user.id)

  let body: { slug?: string; done?: boolean; slugs?: string[]; lastRead?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  if (Array.isArray(body.slugs)) {
    const slugs = body.slugs.filter(s => typeof s === 'string' && SLUG_RE.test(s)).slice(0, 200)
    if (slugs.length > 0) {
      const values = slugs.map((_, i) => `($1, $${i + 2})`).join(', ')
      await db().query(
        `INSERT INTO progress (user_id, slug) VALUES ${values} ON CONFLICT DO NOTHING`,
        [userId, ...slugs],
      )
    }
    return NextResponse.json({ ok: true })
  }

  if (typeof body.lastRead === 'string' && SLUG_RE.test(body.lastRead)) {
    await db().query('UPDATE users SET last_read = $1 WHERE id = $2', [body.lastRead, userId])
    return NextResponse.json({ ok: true })
  }

  if (typeof body.slug === 'string' && SLUG_RE.test(body.slug)) {
    if (body.done) {
      await db().query(
        'INSERT INTO progress (user_id, slug) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [userId, body.slug],
      )
    } else {
      await db().query('DELETE FROM progress WHERE user_id = $1 AND slug = $2', [userId, body.slug])
    }
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
}
