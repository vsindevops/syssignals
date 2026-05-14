'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { clsx } from 'clsx'

const links = [
  { href: '/series',   label: 'Series'   },
  { href: '/articles', label: 'Articles' },
  { href: '/about',    label: 'About'    },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg-primary/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">

        {/* Brand */}
        <Link href="/" className="flex flex-col leading-none group">
          <span className="text-sm font-bold tracking-tight text-text-primary group-hover:text-accent transition-colors">
            Systems and Signals
          </span>
          <span className="text-[10px] text-text-muted tracking-wide">
            DevOps · MLOps · Security
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={clsx(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                pathname?.startsWith(href)
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
              )}
            >
              {label}
            </Link>
          ))}

          {/* CTA */}
          <Link
            href="/series"
            className="ml-3 rounded-md bg-accent px-3 py-1.5 text-xs font-semibold text-bg-primary hover:bg-accent-hover transition-colors"
            style={{ '--tw-bg-opacity': '1' } as React.CSSProperties}
          >
            Start Learning
          </Link>
        </nav>
      </div>
    </header>
  )
}
