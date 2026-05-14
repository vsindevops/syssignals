import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">

          {/* Brand */}
          <div>
            <p className="text-sm font-bold text-text-primary">Systems and Signals</p>
            <p className="mt-1 text-xs text-text-muted leading-relaxed">
              Project-based learning for DevOps, MLOps and Security engineers.
              Every article ships working code.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Platform</p>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li><Link href="/series"   className="hover:text-accent transition-colors">Series</Link></li>
              <li><Link href="/articles" className="hover:text-accent transition-colors">All Articles</Link></li>
              <li><Link href="/about"    className="hover:text-accent transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">Connect</p>
            <ul className="space-y-2 text-xs text-text-secondary">
              <li>
                <a href="https://github.com/vsindevops" target="_blank" rel="noopener noreferrer"
                   className="hover:text-accent transition-colors">GitHub</a>
              </li>
              <li>
                <a href="https://x.com/syssignals" target="_blank" rel="noopener noreferrer"
                   className="hover:text-accent transition-colors">X / Twitter</a>
              </li>
            </ul>
          </div>

        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-[11px] text-text-muted">
          © {new Date().getFullYear()} Systems and Signals · Built by Vishwas Sharma
        </div>
      </div>
    </footer>
  )
}
