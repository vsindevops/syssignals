'use client'

import { useState } from 'react'
import { Loader2, Check } from 'lucide-react'
import type { Profile } from '@/lib/profile'

const FIELDS = [
  { key: 'role', label: 'Current role', placeholder: 'e.g. DevOps Engineer at Acme', type: 'text' },
  { key: 'linkedin', label: 'LinkedIn', placeholder: 'profile URL or username', type: 'text' },
  { key: 'twitter', label: 'X (Twitter)', placeholder: 'handle (without @)', type: 'text' },
  { key: 'github', label: 'GitHub', placeholder: 'username', type: 'text' },
] as const

export default function ProfileForm({ initial }: { initial: Profile }) {
  const [form, setForm] = useState({
    name: initial.name,
    role: initial.role,
    bio: initial.bio,
    linkedin: initial.linkedin,
    twitter: initial.twitter,
    github: initial.github,
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const set = (k: string, v: string) => {
    setForm(f => ({ ...f, [k]: v }))
    if (status === 'saved') setStatus('idle')
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('saving')
    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('saved')
      } else {
        setStatus('error')
        setMsg(data.error ?? 'Could not save.')
      }
    } catch {
      setStatus('error')
      setMsg('Network error — please try again.')
    }
  }

  const input =
    'w-full rounded-xl border border-line bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-mute transition-colors focus:border-accent/60 focus:outline-none'

  return (
    <form onSubmit={submit} className="card p-6 md:p-8">
      <div className="flex items-center gap-4 border-b border-line pb-5">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-surface-2 text-lg font-semibold text-ink-dim">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {initial.image ? <img src={initial.image} alt="" className="h-full w-full object-cover" /> : (initial.name || initial.email || '?').charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="truncate font-display text-[15px] font-semibold text-ink">{initial.name || 'Your profile'}</p>
          <p className="truncate font-mono text-xs text-ink-mute">{initial.email}</p>
        </div>
      </div>

      <div className="mt-6 space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-dim">Name</label>
          <input className={input} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Your name" />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-ink-dim">Bio</label>
          <textarea
            className={`${input} min-h-[96px] resize-y`}
            value={form.bio}
            onChange={e => set('bio', e.target.value)}
            placeholder="A short bio — what you do, what you're learning."
            maxLength={600}
          />
          <p className="mt-1 text-right font-mono text-[10.5px] text-ink-mute">{form.bio.length}/600</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {FIELDS.map(f => (
            <div key={f.key}>
              <label className="mb-1.5 block text-sm font-medium text-ink-dim">{f.label}</label>
              <input
                className={input}
                value={form[f.key]}
                onChange={e => set(f.key, e.target.value)}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-7 flex items-center gap-4">
        <button
          type="submit"
          disabled={status === 'saving'}
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-[14px] font-semibold text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
        >
          {status === 'saving' && <Loader2 size={15} className="animate-spin" />}
          {status === 'saved' ? <><Check size={15} /> Saved</> : 'Save profile'}
        </button>
        {status === 'error' && <span className="text-[13px] text-amber">{msg}</span>}
      </div>
    </form>
  )
}
