import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import Google from 'next-auth/providers/google'
import PostgresAdapter from '@auth/pg-adapter'
import { db } from '@/lib/db'

/** Google SSO is enabled only when its OAuth credentials are present. */
export const googleEnabled = !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET)

const FROM = 'Systems & Signals <hello@syssignals.com>'

function magicLinkEmail(url: string, host: string) {
  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background:#07090e;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#07090e;padding:40px 16px;">
      <tr><td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:440px;background:#0c1016;border:1px solid #1c2533;border-radius:14px;padding:36px;">
          <tr><td style="font-size:17px;font-weight:700;color:#e8edf4;padding-bottom:6px;">
            systems<span style="color:#22d3ee;">&amp;</span>signals
          </td></tr>
          <tr><td style="font-size:14px;line-height:1.6;color:#94a3b8;padding-bottom:24px;">
            Click the button below to sign in to <strong style="color:#e8edf4;">${host}</strong>.
            This link expires in 24 hours and can only be used once.
          </td></tr>
          <tr><td align="center" style="padding-bottom:24px;">
            <a href="${url}" style="display:inline-block;background:#22d3ee;color:#07090e;font-size:15px;font-weight:600;text-decoration:none;padding:12px 32px;border-radius:10px;">
              Sign in
            </a>
          </td></tr>
          <tr><td style="font-size:12px;line-height:1.6;color:#5d6b7e;">
            If you didn't request this email, you can safely ignore it — nothing
            happens unless the link is clicked.
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(db()),
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // signed in for 30 days…
    updateAge: 24 * 60 * 60, // …rolling: any visit ≥1 day after the last extends it
  },
  trustHost: true,
  callbacks: {
    session({ session, user }) {
      session.user.id = user.id
      return session
    },
  },
  pages: {
    signIn: '/login',
    verifyRequest: '/login?sent=1',
    error: '/login',
  },
  providers: [
    ...(googleEnabled ? [Google({ allowDangerousEmailAccountLinking: true })] : []),
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: FROM,
      async sendVerificationRequest({ identifier, url, provider }) {
        const { host } = new URL(url)
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: provider.from,
            to: [identifier],
            subject: `Sign in to ${host}`,
            html: magicLinkEmail(url, host),
            text: `Sign in to ${host}:\n${url}\n\nThis link expires in 24 hours and can only be used once.`,
          }),
        })
        if (!res.ok) throw new Error(`Resend error: ${await res.text()}`)
      },
    }),
  ],
})
