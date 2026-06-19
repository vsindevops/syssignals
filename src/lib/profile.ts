import { db } from '@/lib/db'

export interface Profile {
  name: string
  email: string
  image: string | null
  role: string
  bio: string
  linkedin: string
  twitter: string
  github: string
}

const empty = (): Profile => ({
  name: '', email: '', image: null, role: '', bio: '', linkedin: '', twitter: '', github: '',
})

export async function getProfile(userId: number | string): Promise<Profile> {
  const { rows } = await db().query(
    'SELECT name, email, image, role, bio, linkedin, twitter, github FROM users WHERE id = $1',
    [Number(userId)],
  )
  if (rows.length === 0) return empty()
  const r = rows[0]
  return {
    name: r.name ?? '',
    email: r.email ?? '',
    image: r.image ?? null,
    role: r.role ?? '',
    bio: r.bio ?? '',
    linkedin: r.linkedin ?? '',
    twitter: r.twitter ?? '',
    github: r.github ?? '',
  }
}

export interface ProfileInput {
  name?: string
  role?: string
  bio?: string
  linkedin?: string
  twitter?: string
  github?: string
}

const LIMITS = { name: 80, role: 120, bio: 600, linkedin: 200, twitter: 100, github: 100 }

/** Trim, length-cap, and normalise social handles before persisting. */
export function sanitizeProfile(input: ProfileInput) {
  const s = (v: unknown, max: number) => (typeof v === 'string' ? v.trim().slice(0, max) : '')
  // accept either a full URL or a bare handle/username for socials
  const handle = (v: unknown, max: number) => s(v, max).replace(/^@/, '')
  return {
    name: s(input.name, LIMITS.name),
    role: s(input.role, LIMITS.role),
    bio: s(input.bio, LIMITS.bio),
    linkedin: handle(input.linkedin, LIMITS.linkedin),
    twitter: handle(input.twitter, LIMITS.twitter),
    github: handle(input.github, LIMITS.github),
  }
}

export async function updateProfile(userId: number | string, input: ProfileInput) {
  const p = sanitizeProfile(input)
  await db().query(
    `UPDATE users
        SET name = $1, role = $2, bio = $3, linkedin = $4, twitter = $5, github = $6
      WHERE id = $7`,
    [p.name || null, p.role || null, p.bio || null, p.linkedin || null, p.twitter || null, p.github || null, Number(userId)],
  )
  return p
}
