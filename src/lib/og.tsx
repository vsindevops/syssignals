import fs from 'node:fs/promises'
import path from 'node:path'
import { ImageResponse } from 'next/og'

export const OG_SIZE = { width: 1200, height: 630 }

async function font(file: string) {
  return fs.readFile(path.join(process.cwd(), 'node_modules', file))
}

interface OgProps {
  day?: number
  title: string
  subtitle: string
  footer: string
}

/** Shared branded OG card — used by the site default and per-article images. */
export async function ogCard({ day, title, subtitle, footer }: OgProps) {
  const [grotesk700, grotesk500, mono400] = await Promise.all([
    font('@fontsource/space-grotesk/files/space-grotesk-latin-700-normal.woff'),
    font('@fontsource/space-grotesk/files/space-grotesk-latin-500-normal.woff'),
    font('@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff'),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          backgroundColor: '#07090e',
          backgroundImage:
            'linear-gradient(rgba(28,37,51,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(28,37,51,0.55) 1px, transparent 1px)',
          backgroundSize: '52px 52px',
          fontFamily: 'Space Grotesk',
          position: 'relative',
        }}
      >
        {/* glow */}
        <div
          style={{
            position: 'absolute',
            top: -220,
            left: 320,
            width: 560,
            height: 420,
            borderRadius: 9999,
            background: 'radial-gradient(closest-side, rgba(34,211,238,0.22), rgba(167,139,250,0.10), transparent)',
            filter: 'blur(40px)',
            display: 'flex',
          }}
        />

        {/* header: logo + wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <svg width="44" height="44" viewBox="0 0 32 32" fill="none">
            <rect x="1" y="1" width="30" height="30" rx="8" fill="#0c1016" stroke="#2a3850" />
            <path
              d="M5 16 H9 L12 9 L16 23 L20 12 L23 16 H27"
              stroke="#22d3ee"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div style={{ display: 'flex', fontSize: 28, fontWeight: 700, color: '#e8edf4' }}>
            systems<span style={{ color: '#22d3ee' }}>&amp;</span>signals
          </div>
        </div>

        {/* middle: chip + title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, maxWidth: 1020 }}>
          <div style={{ display: 'flex', gap: 14 }}>
            {day !== undefined && (
              <div
                style={{
                  display: 'flex',
                  fontFamily: 'JetBrains Mono',
                  fontSize: 22,
                  color: '#22d3ee',
                  border: '1.5px solid rgba(34,211,238,0.45)',
                  borderRadius: 999,
                  padding: '8px 22px',
                  backgroundColor: 'rgba(34,211,238,0.08)',
                }}
              >
                DAY {String(day).padStart(2, '0')} / 30
              </div>
            )}
            <div
              style={{
                display: 'flex',
                fontFamily: 'JetBrains Mono',
                fontSize: 22,
                color: '#94a3b8',
                border: '1.5px solid #1c2533',
                borderRadius: 999,
                padding: '8px 22px',
                backgroundColor: '#111722',
              }}
            >
              {subtitle}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: title.length > 70 ? 52 : 62,
              fontWeight: 700,
              lineHeight: 1.12,
              color: '#e8edf4',
              letterSpacing: -1.5,
            }}
          >
            {title}
          </div>
        </div>

        {/* footer */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', fontFamily: 'JetBrains Mono', fontSize: 22, color: '#5d6b7e' }}>
            {footer}
          </div>
          <div
            style={{
              display: 'flex',
              width: 320,
              height: 6,
              borderRadius: 999,
              background: 'linear-gradient(90deg, #22d3ee, #a78bfa)',
            }}
          />
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Space Grotesk', data: grotesk700, weight: 700, style: 'normal' },
        { name: 'Space Grotesk', data: grotesk500, weight: 500, style: 'normal' },
        { name: 'JetBrains Mono', data: mono400, weight: 400, style: 'normal' },
      ],
    },
  )
}
