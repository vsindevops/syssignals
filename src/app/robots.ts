import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // no SEO value; save crawl budget (gated article pages already redirect)
      disallow: ['/api/', '/login'],
    },
    sitemap: 'https://syssignals.com/sitemap.xml',
    host: 'https://syssignals.com',
  }
}
