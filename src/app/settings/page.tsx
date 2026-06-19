import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getProfile } from '@/lib/profile'
import { getEntitlement } from '@/lib/entitlement'
import ProfileForm from '@/components/settings/ProfileForm'
import MembershipPanel from '@/components/settings/MembershipPanel'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Settings',
  robots: { index: false, follow: false },
}

export default async function SettingsPage() {
  const session = await auth()
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent('/settings')}`)
  }

  const [profile, ent] = await Promise.all([
    getProfile(session.user.id),
    getEntitlement(session.user.id),
  ])

  return (
    <div className="mx-auto max-w-3xl px-5 pt-14">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">account</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-ink">Settings</h1>
      <p className="mt-3 text-[15px] text-ink-dim">Manage your profile and membership.</p>

      <section className="mt-10">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-mute">Profile</h2>
        <ProfileForm initial={profile} />
      </section>

      <section className="mt-12 pb-10">
        <h2 className="mb-4 font-mono text-xs uppercase tracking-widest text-ink-mute">Billing</h2>
        <MembershipPanel ent={ent} />
      </section>
    </div>
  )
}
