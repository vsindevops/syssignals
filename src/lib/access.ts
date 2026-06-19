/**
 * Single source of truth for which articles are publicly readable (and therefore
 * SEO-indexable) vs. login-gated. Imported by the gate (`proxy.ts`), the sitemap,
 * and article metadata so they can never disagree.
 *
 * Pure string logic only — safe to import in the middleware/edge runtime.
 */

/**
 * Series prefixes that are FULLY open — every day public and SEO-indexable.
 * `''` is the prefix-less DevOps series (`day-NN-...`). Opening DevOps entirely
 * is a deliberate SEO decision: it's the flagship, finished 30-day series and
 * the strongest long-tail search asset, so all 30 days are crawlable.
 */
export const FULLY_OPEN_PREFIXES: ReadonlySet<string> = new Set([''])

/**
 * First N days of a *gated* series are free (the SEO on-ramp); from day N+1 the
 * lesson is login/membership-gated. Applies to every series except the fully
 * open ones above — e.g. Python (`py-`) is free for days 1–4, gated from day 5.
 */
export const FREE_PREVIEW_DAYS = 4

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
  if (FULLY_OPEN_PREFIXES.has(p.prefix)) return true
  return p.day <= FREE_PREVIEW_DAYS
}
