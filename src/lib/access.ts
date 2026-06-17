/**
 * Single source of truth for which articles are publicly readable (and therefore
 * SEO-indexable) vs. login-gated. Imported by the gate (`proxy.ts`), the sitemap,
 * and article metadata so they can never disagree.
 *
 * Pure string logic only — safe to import in the middleware/edge runtime.
 */

/** First N days of every series are free (the SEO on-ramp). */
export const FREE_PREVIEW_DAYS = 7

/**
 * Extra always-public days beyond the preview window, keyed by series slug prefix
 * (`''` = the prefix-less DevOps series, `'py-'` = Python). The DevOps Day 30
 * capstone is free as a finale teaser.
 */
export const EXTRA_FREE_DAYS: Record<string, number[]> = {
  '': [30],
}

/**
 * `{ prefix, day }` from a slug, or null if it isn't day-numbered.
 * `day-30-...` → {prefix:'', day:30}; `py-day-01-...` → {prefix:'py-', day:1}.
 */
export function parseDaySlug(slug: string): { prefix: string; day: number } | null {
  const m = slug.match(/^([a-z]+-)?day-0*(\d+)-/)
  return m ? { prefix: m[1] ?? '', day: Number(m[2]) } : null
}

/** True if the article at this slug is publicly readable (no login required). */
export function isFreeSlug(slug: string): boolean {
  const p = parseDaySlug(slug)
  if (!p) return false
  return p.day <= FREE_PREVIEW_DAYS || (EXTRA_FREE_DAYS[p.prefix] ?? []).includes(p.day)
}
