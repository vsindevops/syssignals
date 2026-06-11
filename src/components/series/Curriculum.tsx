'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'motion/react'
import { Check, Clock, Lock, ChevronRight } from 'lucide-react'
import { useProgress } from '@/components/progress/ProgressProvider'

export interface CurriculumLesson {
  day: number
  slug: string
  title: string
  excerpt: string
  readTime: string
}

export interface CurriculumModule {
  title: string
  blurb: string
  lessons: CurriculumLesson[]
}

export interface CurriculumUpcoming {
  day: number
  title: string
  blurb?: string
}

interface Props {
  modules: CurriculumModule[]
  upcoming: CurriculumUpcoming[]
  total: number
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 26
  const c = 2 * Math.PI * r
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" className="-rotate-90">
      <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-surface-3)" strokeWidth="5" />
      <circle
        cx="32" cy="32" r={r} fill="none"
        stroke="url(#ring-grad)" strokeWidth="5" strokeLinecap="round"
        strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)}
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)' }}
      />
      <defs>
        <linearGradient id="ring-grad" x1="0" y1="0" x2="64" y2="64">
          <stop stopColor="#22d3ee" />
          <stop offset="1" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function Curriculum({ modules, upcoming, total }: Props) {
  const { completed, hydrated, isComplete, toggle } = useProgress()
  const reduce = useReducedMotion()
  const published = modules.flatMap(m => m.lessons)
  const doneCount = hydrated ? published.filter(l => completed.includes(l.slug)).length : 0
  const pct = Math.round((doneCount / total) * 100)
  const totalMin = published.reduce((s, l) => s + (parseInt(l.readTime) || 0), 0)

  return (
    <div>
      {/* progress summary */}
      <div className="card flex flex-wrap items-center gap-6 p-6">
        <div className="relative">
          <ProgressRing pct={hydrated ? pct : 0} />
          <span className="absolute inset-0 flex rotate-0 items-center justify-center font-mono text-[12px] font-semibold text-ink">
            {hydrated ? `${pct}%` : '–'}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display text-lg font-semibold text-ink">
            {doneCount === 0 ? 'Your progress starts here' : `${doneCount} of ${total} days complete`}
          </p>
          <p className="mt-1 text-sm text-ink-mute">
            {published.length} published · ~{Math.round(totalMin / 60)}h of hands-on builds · progress saved on this device
          </p>
        </div>
        <div className="hidden h-2 w-44 overflow-hidden rounded-full bg-surface-3 md:block">
          <div
            className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-[width] duration-700"
            style={{ width: `${hydrated ? pct : 0}%` }}
          />
        </div>
      </div>

      {/* modules */}
      <div className="mt-10 space-y-10">
        {modules.map((mod, mi) => {
          const modDone = hydrated ? mod.lessons.filter(l => completed.includes(l.slug)).length : 0
          return (
            <motion.section
              key={mod.title}
              initial={reduce ? false : { opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: Math.min(mi * 0.04, 0.2), ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex items-baseline justify-between gap-4 px-1">
                <div>
                  <h2 className="font-display text-xl font-semibold text-ink">
                    <span className="mr-2.5 font-mono text-sm text-accent">{String(mi + 1).padStart(2, '0')}</span>
                    {mod.title}
                  </h2>
                  <p className="mt-1 text-sm text-ink-mute">{mod.blurb}</p>
                </div>
                <span className="shrink-0 font-mono text-xs text-ink-mute">{modDone}/{mod.lessons.length}</span>
              </div>

              <ol className="card mt-4 divide-y divide-line overflow-hidden">
                {mod.lessons.map(lesson => {
                  const done = hydrated && isComplete(lesson.slug)
                  return (
                    <li key={lesson.slug} className="group relative flex items-center gap-4 px-5 py-4 transition-colors hover:bg-surface-2">
                      <button
                        onClick={() => toggle(lesson.slug)}
                        aria-label={done ? `Mark Day ${lesson.day} incomplete` : `Mark Day ${lesson.day} complete`}
                        className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-all ${
                          done
                            ? 'border-green/60 bg-green/15 text-green'
                            : 'border-line-2 text-transparent hover:border-accent hover:text-accent/60'
                        }`}
                      >
                        <Check size={14} strokeWidth={3} />
                      </button>

                      <Link href={`/articles/${lesson.slug}`} className="min-w-0 flex-1">
                        {/* stretched hit-area for the row, beneath the checkbox */}
                        <span className="absolute inset-0" aria-hidden="true" />
                        <span className="flex items-center gap-3">
                          <span className="font-mono text-xs text-ink-mute">D{String(lesson.day).padStart(2, '0')}</span>
                          <span className={`truncate text-[15px] font-medium ${done ? 'text-ink-mute line-through decoration-line-2' : 'text-ink'}`}>
                            {lesson.title}
                          </span>
                        </span>
                        <span className="mt-1 hidden truncate text-[13px] text-ink-mute sm:block">{lesson.excerpt}</span>
                      </Link>

                      <span className="flex shrink-0 items-center gap-1.5 font-mono text-[11px] text-ink-mute">
                        <Clock size={11} />
                        {lesson.readTime}
                      </span>
                      <ChevronRight size={15} className="shrink-0 text-ink-mute transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                    </li>
                  )
                })}
              </ol>
            </motion.section>
          )
        })}

        {/* upcoming */}
        <section>
          <div className="px-1">
            <h2 className="font-display text-xl font-semibold text-ink">
              <span className="mr-2.5 font-mono text-sm text-accent-2">{String(modules.length + 1).padStart(2, '0')}</span>
              Coming up
            </h2>
            <p className="mt-1 text-sm text-ink-mute">One new day at a time — follow <a className="text-accent hover:underline" href="https://x.com/syssignals" target="_blank" rel="noopener noreferrer">@syssignals</a> to catch each release.</p>
          </div>
          <ol className="card mt-4 divide-y divide-line overflow-hidden opacity-80">
            {upcoming.map(u => (
              <li key={u.day} className="flex items-center gap-4 px-5 py-4">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line text-ink-mute">
                  <Lock size={12} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-3">
                    <span className="font-mono text-xs text-ink-mute">D{String(u.day).padStart(2, '0')}</span>
                    <span className={`truncate text-[15px] ${u.title === 'To be announced' ? 'text-ink-mute' : 'font-medium text-ink-dim'}`}>
                      {u.title}
                    </span>
                  </span>
                  {u.blurb && <span className="mt-1 hidden truncate text-[13px] text-ink-mute sm:block">{u.blurb}</span>}
                </span>
                <span className="chip shrink-0">soon</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  )
}
