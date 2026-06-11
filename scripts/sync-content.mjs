#!/usr/bin/env node
/**
 * Sync articles from the Jekyll repo (source of truth) into content/.
 *
 * - Parses _posts/YYYY-MM-DD-day-NN-slug.md
 * - Rewrites frontmatter to the syssignals schema (day, series, seriesSlug)
 * - Strips the Jekyll series banner blockquote (the site renders its own)
 * - Rewrites internal links /articles/YYYY/MM/DD/<slug>/ -> /articles/<slug>
 *
 * Usage: node scripts/sync-content.mjs [path-to-jekyll-repo]
 */
import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'

const JEKYLL_REPO = process.argv[2] ?? path.resolve(process.cwd(), '../30-days-devops')
const POSTS_DIR = path.join(JEKYLL_REPO, '_posts')
const OUT_DIR = path.resolve(process.cwd(), 'content/devops/30-days-devops')

const SERIES = { name: '30 Days of DevOps', slug: '30-days-devops', total: 30 }

if (!fs.existsSync(POSTS_DIR)) {
  console.error(`Posts directory not found: ${POSTS_DIR}`)
  process.exit(1)
}

fs.rmSync(OUT_DIR, { recursive: true, force: true })
fs.mkdirSync(OUT_DIR, { recursive: true })

const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md')).sort()
let count = 0

for (const file of files) {
  const m = file.match(/^(\d{4}-\d{2}-\d{2})-day-(\d{2})-(.+)\.md$/)
  if (!m) {
    console.warn(`skip (unrecognised filename): ${file}`)
    continue
  }
  const [, , dayStr, rest] = m
  const day = Number(dayStr)
  const slug = `day-${dayStr}-${rest}`

  const raw = fs.readFileSync(path.join(POSTS_DIR, file), 'utf-8')
  const { data, content } = matter(raw)

  let body = content

  // Strip the leading series-banner blockquote (1+ consecutive "> " lines
  // starting with "> **30 Days of DevOps**").
  body = body.replace(/^\s*> \*\*30 Days of DevOps\*\*[^\n]*\n(?:>[^\n]*\n)*/m, '')

  // Rewrite Jekyll permalinks to flat article routes (slug-based, so posts
  // with a wrong date in the URL still resolve correctly).
  body = body.replace(/\(\/articles\/\d{4}\/\d{2}\/\d{2}\/([^)/\s]+)\/?\)/g, '(/articles/$1)')

  body = body.trim() + '\n'

  // Banner removal can leave a horizontal rule as the first line — drop it.
  body = body.replace(/^---+\n+/, '')

  // "Day N: Actual Title" -> store the actual title; day is its own field.
  const fullTitle = String(data.title ?? slug)
  const title = fullTitle.replace(/^Day \d+:\s*/, '')

  const date = data.date instanceof Date
    ? data.date.toISOString().slice(0, 10)
    : String(data.date)

  // Write frontmatter by hand (JSON string/array literals are valid YAML) —
  // matter.stringify re-parses the body and trips on content that starts
  // with a horizontal rule.
  const fm = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `day: ${day}`,
    `date: ${JSON.stringify(date)}`,
    `excerpt: ${JSON.stringify(String(data.excerpt ?? ''))}`,
    `tags: ${JSON.stringify(data.tags ?? [])}`,
    `topics: ${JSON.stringify(data.categories ?? [])}`,
    `series: ${JSON.stringify(SERIES.name)}`,
    `seriesSlug: ${JSON.stringify(SERIES.slug)}`,
    `seriesTotal: ${SERIES.total}`,
    '---',
    '',
  ].join('\n')

  fs.writeFileSync(path.join(OUT_DIR, `${slug}.md`), fm + body)
  count++
}

console.log(`synced ${count} articles -> ${path.relative(process.cwd(), OUT_DIR)}`)
