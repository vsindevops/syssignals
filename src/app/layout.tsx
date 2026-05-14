import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: {
    default:  'Systems and Signals',
    template: '%s · Systems and Signals',
  },
  description: 'Project-based learning for DevOps, MLOps and Security engineers. Every article ships working code.',
  metadataBase: new URL('https://syssignals.com'),
  openGraph: {
    siteName: 'Systems and Signals',
    locale:   'en_US',
    type:     'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-screen flex flex-col bg-bg-primary text-text-primary">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
