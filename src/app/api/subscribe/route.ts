import { NextResponse } from 'next/server'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/**
 * Newsletter signup. Provider is chosen by environment:
 *   - BUTTONDOWN_API_KEY                      -> Buttondown
 *   - RESEND_API_KEY + RESEND_AUDIENCE_ID     -> Resend audience
 * With neither set, returns 503 so the UI can fall back gracefully.
 */
export async function POST(req: Request) {
  let body: { email?: string; website?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  // honeypot — bots fill every field; humans never see this one
  if (body.website) return NextResponse.json({ ok: true })

  const email = body.email?.trim().toLowerCase() ?? ''
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  try {
    if (process.env.BUTTONDOWN_API_KEY) {
      const res = await fetch('https://api.buttondown.com/v1/subscribers', {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email_address: email }),
      })
      if (res.status === 201) return NextResponse.json({ ok: true })
      const data = await res.json().catch(() => ({}))
      // already subscribed reads as success to the visitor
      if (JSON.stringify(data).includes('already')) return NextResponse.json({ ok: true })
      return NextResponse.json({ error: 'Subscription failed — please try again.' }, { status: 502 })
    }

    if (process.env.RESEND_API_KEY && process.env.RESEND_AUDIENCE_ID) {
      const res = await fetch(
        `https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, unsubscribed: false }),
        },
      )
      if (res.ok) return NextResponse.json({ ok: true })
      return NextResponse.json({ error: 'Subscription failed — please try again.' }, { status: 502 })
    }
  } catch {
    return NextResponse.json({ error: 'Subscription failed — please try again.' }, { status: 502 })
  }

  return NextResponse.json(
    { error: 'Signups open soon — follow @syssignals on X meanwhile.' },
    { status: 503 },
  )
}
