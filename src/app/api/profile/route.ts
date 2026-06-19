import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { updateProfile, type ProfileInput } from '@/lib/profile'

/** Save the signed-in user's profile (name, role, bio, social handles). */
export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })
  }

  let body: ProfileInput
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  try {
    const saved = await updateProfile(session.user.id, body)
    return NextResponse.json({ ok: true, profile: saved })
  } catch {
    return NextResponse.json({ error: 'Could not save — please try again.' }, { status: 500 })
  }
}
