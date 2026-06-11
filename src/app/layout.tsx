import type { Metadata } from 'next'
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Analytics from '@/components/Analytics'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { ProgressProvider } from '@/components/progress/ProgressProvider'
import { getSearchIndex } from '@/lib/articles'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const grotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-grotesk', display: 'swap' })
const jbmono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jbmono', display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: 'Systems & Signals — project-based DevOps, MLOps and AI engineering',
    template: '%s · Systems & Signals',
  },
  description:
    'Project-based learning for DevOps, MLOps and AI engineers. Every article ships a working project — verified commands, expected output, no fluff.',
  metadataBase: new URL('https://syssignals.com'),
  alternates: {
    types: { 'application/rss+xml': '/feed.xml' },
  },
  openGraph: {
    siteName: 'Systems & Signals',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@syssignals',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const searchDocs = getSearchIndex()

  return (
    <html lang="en" className={`${inter.variable} ${grotesk.variable} ${jbmono.variable} h-full antialiased`}>
      <body className="min-h-screen flex flex-col">
        <ProgressProvider>
          <Navbar searchDocs={searchDocs} />
          <main className="flex-1">{children}</main>
          <Footer />
        </ProgressProvider>
        <Analytics />
      </body>
    </html>
  )
}
