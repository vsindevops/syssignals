'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

/**
 * Sitewide click-to-zoom for content visuals. Mounted once in the root layout.
 *
 * Any image inside article prose, any rendered mermaid diagram, or any element
 * tagged `data-zoomable` opens in a full-screen viewer that can be zoomed and
 * panned — so a learner can read a detailed diagram without zooming the whole
 * page. Uses event delegation, so it also catches mermaid SVGs that the
 * ArticleEnhancer renders asynchronously after this component has mounted.
 *
 * Dependency-free: React + createPortal + Pointer/Wheel events only.
 */

type Content =
  | { kind: 'img'; src: string; alt: string }
  | { kind: 'svg'; markup: string; label: string }

const MIN_SCALE = 1
const MAX_SCALE = 8

/** Find the zoomable visual a click landed on, or null if the click isn't one. */
function resolveTarget(target: EventTarget | null): Content | null {
  if (!(target instanceof Element)) return null

  // Mermaid diagram: a click anywhere inside the rendered SVG counts.
  const diagram = target.closest('.mermaid-target')
  if (diagram) {
    const svg = diagram.querySelector('svg')
    if (svg) {
      // Mermaid renders with width="100%" and an inline max-width but no
      // intrinsic height — fine inside its sized container, but it collapses
      // to 0 once cloned into the viewer. Give the clone explicit pixel
      // dimensions from its viewBox so it scales like a normal image.
      const clone = svg.cloneNode(true) as SVGSVGElement
      const vb = (clone.getAttribute('viewBox') || '').split(/\s+/).map(Number)
      if (vb.length === 4 && vb[2] > 0 && vb[3] > 0) {
        clone.setAttribute('width', String(vb[2]))
        clone.setAttribute('height', String(vb[3]))
      }
      clone.removeAttribute('style') // drop mermaid's inline max-width cap
      return {
        kind: 'svg',
        markup: clone.outerHTML,
        label: svg.getAttribute('aria-label') || 'diagram',
      }
    }
  }

  // Content image: inside article prose, or explicitly opted in via data-zoomable.
  const img = target.closest('img')
  if (img instanceof HTMLImageElement && (img.closest('.prose-ss') || img.closest('[data-zoomable]'))) {
    return { kind: 'img', src: img.currentSrc || img.src, alt: img.alt || 'image' }
  }

  // A non-img element marked zoomable that wraps an image.
  const zoomable = target.closest('[data-zoomable]')
  const inner = zoomable?.querySelector('img')
  if (inner instanceof HTMLImageElement) {
    return { kind: 'img', src: inner.currentSrc || inner.src, alt: inner.alt || 'image' }
  }

  return null
}

export default function ImageLightbox() {
  const [mounted, setMounted] = useState(false)
  const [content, setContent] = useState<Content | null>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)

  const stageRef = useRef<HTMLDivElement>(null)
  const restoreFocusRef = useRef<HTMLElement | null>(null)
  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map())
  const pinchStart = useRef<{ dist: number; scale: number } | null>(null)
  const downAt = useRef<{ x: number; y: number } | null>(null)
  const dragged = useRef(false)

  useEffect(() => setMounted(true), [])

  const reset = useCallback(() => {
    setScale(1)
    setTx(0)
    setTy(0)
  }, [])

  const close = useCallback(() => {
    setContent(null)
    reset()
    restoreFocusRef.current?.focus?.()
    restoreFocusRef.current = null
  }, [reset])

  // One delegated open handler for the whole document.
  useEffect(() => {
    if (!mounted) return
    const onClick = (e: MouseEvent) => {
      // Leave modified / non-primary clicks alone (new-tab, etc.).
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const found = resolveTarget(e.target)
      if (!found) return
      e.preventDefault()
      restoreFocusRef.current = document.activeElement as HTMLElement | null
      reset()
      setContent(found)
    }
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [mounted, reset])

  // Body scroll lock + Escape while open.
  useEffect(() => {
    if (!content) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [content, close])

  const clamp = (s: number) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s))

  /** Zoom toward a focal point (screen coords) so that point stays put. */
  const zoomTo = useCallback((nextScale: number, focalX: number, focalY: number) => {
    const stage = stageRef.current
    if (!stage) return
    const rect = stage.getBoundingClientRect()
    const cx = focalX - rect.left - rect.width / 2
    const cy = focalY - rect.top - rect.height / 2
    setScale(prevScale => {
      const s = clamp(nextScale)
      if (s === MIN_SCALE) {
        setTx(0)
        setTy(0)
      } else {
        setTx(prevTx => cx - ((cx - prevTx) / prevScale) * s)
        setTy(prevTy => cy - ((cy - prevTy) / prevScale) * s)
      }
      return s
    })
  }, [])

  const centreZoom = (factor: number) =>
    zoomTo(scale * factor, window.innerWidth / 2, window.innerHeight / 2)

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      zoomTo(scale * (e.deltaY < 0 ? 1.18 : 1 / 1.18), e.clientX, e.clientY)
    },
    [scale, zoomTo],
  )

  const onDoubleClick = useCallback(
    (e: React.MouseEvent) => zoomTo(scale > 1.2 ? 1 : 2.5, e.clientX, e.clientY),
    [scale, zoomTo],
  )

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {
      // capture can fail (e.g. synthetic events) — tracking must continue
    }
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      downAt.current = { x: e.clientX, y: e.clientY }
      dragged.current = false
    }
  }, [])

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const pts = pointers.current
      if (!pts.has(e.pointerId)) return
      const prev = pts.get(e.pointerId)!
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY })

      if (pts.size === 2) {
        const [a, b] = [...pts.values()]
        const dist = Math.hypot(a.x - b.x, a.y - b.y)
        if (!pinchStart.current) pinchStart.current = { dist, scale }
        else zoomTo(pinchStart.current.scale * (dist / pinchStart.current.dist), (a.x + b.x) / 2, (a.y + b.y) / 2)
        dragged.current = true
        return
      }

      if (downAt.current && Math.hypot(e.clientX - downAt.current.x, e.clientY - downAt.current.y) > 6) {
        dragged.current = true
      }
      // Pan only when zoomed in.
      if (scale <= 1) return
      setTx(v => v + (e.clientX - prev.x))
      setTy(v => v + (e.clientY - prev.y))
    },
    [scale, zoomTo],
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinchStart.current = null
  }, [])

  // Close when the click lands on empty backdrop (not the visual) and wasn't a drag.
  const onBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && !dragged.current) close()
    },
    [close],
  )

  if (!mounted || !content) return null

  return createPortal(
    <div
      className="ss-lb"
      role="dialog"
      aria-modal="true"
      aria-label={content.kind === 'img' ? content.alt : content.label}
      onClick={onBackdropClick}
    >
      <div className="ss-lb-bar">
        <button type="button" className="ss-lb-btn" aria-label="Zoom out" onClick={() => centreZoom(1 / 1.4)}>−</button>
        <span className="ss-lb-zoom" aria-hidden="true">{Math.round(scale * 100)}%</span>
        <button type="button" className="ss-lb-btn" aria-label="Zoom in" onClick={() => centreZoom(1.4)}>+</button>
        <button type="button" className="ss-lb-btn" aria-label="Reset zoom" onClick={reset}>⟲</button>
        <button type="button" className="ss-lb-btn ss-lb-close" aria-label="Close" autoFocus onClick={close}>✕</button>
      </div>

      <div
        ref={stageRef}
        className="ss-lb-stage"
        onClick={onBackdropClick}
        onWheel={onWheel}
        onDoubleClick={onDoubleClick}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ cursor: scale > 1 ? 'grab' : 'zoom-in' }}
      >
        <div className="ss-lb-content" style={{ transform: `translate(${tx}px, ${ty}px) scale(${scale})` }}>
          {content.kind === 'img' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={content.src} alt={content.alt} draggable={false} />
          ) : (
            <div className="ss-lb-svg" dangerouslySetInnerHTML={{ __html: content.markup }} />
          )}
        </div>
      </div>

      <p className="ss-lb-hint">scroll or pinch to zoom · drag to pan · esc to close</p>
    </div>,
    document.body,
  )
}
