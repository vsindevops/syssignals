import { getAllArticles } from '@/lib/articles'

export const dynamic = 'force-static'

const BASE = 'https://syssignals.com'

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

export function GET() {
  const articles = getAllArticles()
  const newest = articles[0]?.date ?? '2026-01-01'

  const items = articles
    .map(a => {
      const url = `${BASE}/articles/${a.slug}`
      const title = a.day !== undefined ? `Day ${a.day}: ${a.title}` : a.title
      return `    <item>
      <title>${esc(title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(`${a.date}T09:00:00+05:30`).toUTCString()}</pubDate>
      <description>${esc(a.excerpt)}</description>
${a.tags.map(t => `      <category>${esc(t)}</category>`).join('\n')}
    </item>`
    })
    .join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Systems &amp; Signals</title>
    <link>${BASE}</link>
    <description>Project-based learning for DevOps, MLOps and AI engineers. Every article ships a working project — verified commands, expected output, no fluff.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date(`${newest}T09:00:00+05:30`).toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`

  return new Response(xml, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  })
}
