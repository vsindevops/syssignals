'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Search, Menu, X } from 'lucide-react'
import Logo from '@/components/Logo'
import SearchPalette from '@/components/search/SearchPalette'
import type { SearchDoc } from '@/lib/articles'

const LINKS = [
  { href: '/series', label: 'Series' },
  { href: '/articles', label: 'Articles' },
  { href: '/about', label: 'About' },
]

export default function Navbar({ searchDocs }: { searchDocs: SearchDoc[] }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // close the mobile menu when the route changes
  const [prevPath, setPrevPath] = useState(pathname)
  if (prevPath !== pathname) {
    setPrevPath(pathname)
    setMenuOpen(false)
  }

  return (
    <>
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          scrolled || menuOpen ? 'nav-blur border-line' : 'border-transparent bg-transparent'
        }`}
      >
        <nav className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-5">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-85">
            <Logo size={28} />
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">
              systems<span className="text-accent">&amp;</span>signals
            </span>
          </Link>

          <div className="ml-auto hidden items-center gap-1 md:flex">
            {LINKS.map(l => {
              const isActive = pathname === l.href || pathname.startsWith(l.href + '/')
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors ${
                    isActive ? 'text-ink' : 'text-ink-dim hover:text-ink'
                  }`}
                >
                  {l.label}
                </Link>
              )
            })}
          </div>

          <button
            onClick={() => setSearchOpen(true)}
            className="hidden items-center gap-2.5 rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-[13px] text-ink-mute transition-colors hover:border-line-2 hover:text-ink-dim md:flex"
            aria-label="Search"
          >
            <Search size={14} />
            <span>Search</span>
            <kbd className="ml-3">⌘K</kbd>
          </button>

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-ink-dim hover:text-ink"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="rounded-lg p-2 text-ink-dim hover:text-ink"
              aria-label="Menu"
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </nav>

        {menuOpen && (
          <div className="border-t border-line px-5 py-3 md:hidden">
            {LINKS.map(l => (
              <Link
                key={l.href}
                href={l.href}
                className="block rounded-lg px-2 py-2.5 text-[15px] font-medium text-ink-dim hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </header>

      <SearchPalette docs={searchDocs} open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
