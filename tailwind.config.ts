import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary:   '#0d1117',
          secondary: '#161b22',
          tertiary:  '#1c2128',
        },
        border:  '#30363d',
        accent:  '#58a6ff',
        text: {
          primary:   '#e6edf3',
          secondary: '#8b949e',
          muted:     '#656d76',
        },
        success: '#3fb950',
        warning: '#d29922',
        danger:  '#f85149',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'ui-monospace', 'monospace'],
      },
      typography: {
        invert: {
          css: {
            '--tw-prose-body':         '#e6edf3',
            '--tw-prose-headings':     '#e6edf3',
            '--tw-prose-links':        '#58a6ff',
            '--tw-prose-code':         '#f0883e',
            '--tw-prose-pre-bg':       '#161b22',
            '--tw-prose-quotes':       '#8b949e',
            '--tw-prose-quote-borders':'#30363d',
            '--tw-prose-hr':           '#30363d',
            '--tw-prose-th-borders':   '#30363d',
            '--tw-prose-td-borders':   '#30363d',
          },
        },
      },
    },
  },
  plugins: [typography],
}

export default config
