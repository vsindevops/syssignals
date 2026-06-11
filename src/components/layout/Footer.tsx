import Link from 'next/link'
import Logo from '@/components/Logo'

export default function Footer() {
  return (
    <footer className="mt-28 border-t border-line bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
                systems<span className="text-accent">&amp;</span>signals
              </span>
            </div>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-mute">
              Project-based learning for DevOps, MLOps and AI engineers.
              Every article ships a working project — verified commands,
              expected output, no fluff.
            </p>
            <p className="mt-4 flex items-center gap-2 font-mono text-xs text-ink-mute">
              <span className="inline-block h-2 w-2 rounded-full bg-green animate-pulse-dot" />
              30 Days of DevOps — publishing now
            </p>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-mute">Learn</p>
            <ul className="space-y-2.5 text-sm text-ink-dim">
              <li><Link href="/series/30-days-devops" className="transition-colors hover:text-accent">30 Days of DevOps</Link></li>
              <li><Link href="/series" className="transition-colors hover:text-accent">All Series</Link></li>
              <li><Link href="/articles" className="transition-colors hover:text-accent">All Articles</Link></li>
              <li><Link href="/about" className="transition-colors hover:text-accent">About</Link></li>
            </ul>
          </div>

          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-widest text-ink-mute">Connect</p>
            <ul className="space-y-2.5 text-sm text-ink-dim">
              <li>
                <a href="https://github.com/syssignals" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://x.com/syssignals" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-accent">
                  X / Twitter
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 font-mono text-xs text-ink-mute sm:flex-row">
          <span>© {new Date().getFullYear()} Systems &amp; Signals · Vishwas Sharma</span>
          <span>built in public · one project a day</span>
        </div>
      </div>
    </footer>
  )
}
