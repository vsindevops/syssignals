import type { MetadataRoute } from 'next'
import { getAllArticles } from '@/lib/articles'
import { isFreeSlug } from '@/lib/access'
import { SERIES } from '@/lib/series'

const BASE = 'https://syssignals.com'

export default function sitemap(): MetadataRoute.Sitemap {
  const articles = getAllArticles()
  const newest = articles.reduce((max, a) => (a.date > max ? a.date : max), '2026-01-01')

  // Only publicly-readable articles belong in the sitemap. Gated articles
  // 307-redirect to /login, so advertising them wastes crawl budget and looks
  // like cloaking to search engines.
  const freeArticles = articles.filter(a => isFreeSlug(a.slug))

  return [
    { url: BASE, lastModified: new Date(newest), changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/articles`, lastModified: new Date(newest), changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/series`, lastModified: new Date(newest), changeFrequency: 'weekly', priority: 0.8 },
    ...Object.keys(SERIES).map(slug => ({
      url: `${BASE}/series/${slug}`,
      lastModified: new Date(newest),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    { url: `${BASE}/about`, changeFrequency: 'monthly' as const, priority: 0.5 },
    ...freeArticles.map(a => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ]
}
