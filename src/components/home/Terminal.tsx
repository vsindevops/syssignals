'use client'

import { useEffect, useRef, useState } from 'react'

interface Line {
  type: 'cmd' | 'out' | 'ok'
  text: string
}

const SCRIPT: Line[] = [
  { type: 'cmd', text: 'kubectl apply -f priorityclass.yaml' },
  { type: 'out', text: 'priorityclass.scheduling.k8s.io/critical-priority created' },
  { type: 'cmd', text: 'helm upgrade webapp ./charts/webapp -n production' },
  { type: 'ok', text: 'Release "webapp" has been upgraded. Happy Helming!' },
  { type: 'cmd', text: 'kubectl get pods -n production' },
  { type: 'out', text: 'webapp-7d9f8b6c5-x2k4j   1/1   Running   0   12s' },
  { type: 'out', text: 'webapp-7d9f8b6c5-m8n3p   1/1   Running   0   12s' },
  { type: 'cmd', text: 'argocd app sync webapp --prune' },
  { type: 'ok', text: '✔ Synced — cluster matches Git' },
]

const TYPE_MS = 28
const LINE_PAUSE_MS = 420
const RESTART_PAUSE_MS = 5200

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([])
  const [current, setCurrent] = useState('')
  const idx = useRef(0)
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined)

  useEffect(() => {
    let cancelled = false

    const step = () => {
      if (cancelled) return
      if (idx.current >= SCRIPT.length) {
        timer.current = setTimeout(() => {
          if (cancelled) return
          idx.current = 0
          setLines([])
          setCurrent('')
          step()
        }, RESTART_PAUSE_MS)
        return
      }
      const line = SCRIPT[idx.current]
      if (line.type === 'cmd') {
        // type character by character
        let i = 0
        const typeChar = () => {
          if (cancelled) return
          i++
          setCurrent(line.text.slice(0, i))
          if (i < line.text.length) {
            timer.current = setTimeout(typeChar, TYPE_MS)
          } else {
            timer.current = setTimeout(() => {
              if (cancelled) return
              setLines(prev => [...prev, line])
              setCurrent('')
              idx.current++
              step()
            }, LINE_PAUSE_MS)
          }
        }
        typeChar()
      } else {
        setLines(prev => [...prev, line])
        idx.current++
        timer.current = setTimeout(step, 240)
      }
    }

    timer.current = setTimeout(step, 800)
    return () => {
      cancelled = true
      clearTimeout(timer.current)
    }
  }, [])

  return (
    <div className="card overflow-hidden font-mono text-[12.5px] leading-relaxed shadow-2xl">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
        <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
        <span className="ml-2 text-[11px] text-ink-mute">vishwas@syssignals — zsh</span>
      </div>
      <div className="h-56 overflow-hidden p-4">
        {lines.map((l, i) => (
          <p key={i} className={l.type === 'cmd' ? 'text-ink' : l.type === 'ok' ? 'text-green' : 'text-ink-mute'}>
            {l.type === 'cmd' ? <><span className="text-accent">$ </span>{l.text}</> : l.text}
          </p>
        ))}
        <p className="text-ink">
          <span className="text-accent">$ </span>
          {current}
          <span className="animate-blink inline-block h-[1.1em] w-[7px] translate-y-[3px] bg-accent" />
        </p>
      </div>
    </div>
  )
}
