'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    goatcounter?: {
      no_onload?: boolean
      count?: (opts: { path: string }) => void
    }
  }
}

/**
 * GoatCounter pageview tracking, SPA-aware: auto-count on load is disabled
 * and every App Router navigation (including the first page) reports its
 * path explicitly. GoatCounter ignores localhost by default.
 */
export default function Analytics() {
  const pathname = usePathname()
  const loaded = useRef(false)

  useEffect(() => {
    if (!loaded.current) return
    window.goatcounter?.count?.({ path: pathname })
  }, [pathname])

  return (
    <>
      <Script id="gc-init" strategy="afterInteractive">
        {`window.goatcounter = { no_onload: true }`}
      </Script>
      <Script
        data-goatcounter="https://syssignals.goatcounter.com/count"
        src="https://gc.zgo.at/count.js"
        strategy="afterInteractive"
        onLoad={() => {
          loaded.current = true
          window.goatcounter?.count?.({ path: window.location.pathname })
        }}
      />
    </>
  )
}
