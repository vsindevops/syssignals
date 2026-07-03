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
 * open ones above.
 *
 * The count is PER-SERIES, keyed by slug prefix, so a long flagship series can
 * offer a bigger free on-ramp without changing the others:
 *   - `py-` (Python for AI Engineering) → 4 free (days 1–4)
 *   - `ml-` (100 Days of MLOps)         → 15 free (days 1–15)
 * Any gated prefix not listed falls back to `DEFAULT_FREE_PREVIEW_DAYS`.
 */
export const DEFAULT_FREE_PREVIEW_DAYS = 4

export const FREE_PREVIEW_DAYS_BY_PREFIX: Readonly<Record<string, number>> = {
  'py-': 4,
  'ml-': 15,
}

/** Number of free preview days for a given slug prefix. */
export function freePreviewDays(prefix: string): number {
  return FREE_PREVIEW_DAYS_BY_PREFIX[prefix] ?? DEFAULT_FREE_PREVIEW_DAYS
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
  if (FULLY_OPEN_PREFIXES.has(p.prefix)) return true
  return p.day <= freePreviewDays(p.prefix)
}

/**
 * Validation lockdown. When `ACCESS_ALLOWLIST` is set (comma-separated emails),
 * ONLY those users can read gated articles — normal paid entitlement is ignored
 * for everyone else. Leave it unset for normal paid access. Reversible via env.
 */
export function accessAllowlist(): string[] {
  return (process.env.ACCESS_ALLOWLIST ?? '')
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export const allowlistActive = () => accessAllowlist().length > 0

/** Is this email permitted to read gated content during a lockdown? */
export function emailAllowlisted(email: string | null | undefined): boolean {
  if (!email) return false
  return accessAllowlist().includes(email.toLowerCase())
}
