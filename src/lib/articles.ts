import fs from 'node:fs'
import path from 'node:path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface ArticleMeta {
  slug: string
  title: string
  day?: number
  date: string
  excerpt: string
  tags: string[]
  topics: string[]
  series?: string
  seriesSlug?: string
  seriesTotal?: number
  readTime: string
  readMinutes: number
  words: number
}

export interface Article extends ArticleMeta {
  content: string
}

interface RawFile {
  filePath: string
  slug: string
}

function listContentFiles(): RawFile[] {
  const out: RawFile[] = []
  const walk = (dir: string) => {
    if (!fs.existsSync(dir)) return
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(fullPath)
      else if (/\.mdx?$/.test(entry.name)) {
        out.push({ filePath: fullPath, slug: entry.name.replace(/\.mdx?$/, '') })
      }
    }
  }
  walk(CONTENT_DIR)
  return out
}

function parseFile(file: RawFile, withContent: boolean): Article {
  const raw = fs.readFileSync(file.filePath, 'utf-8')
  const { data, content } = matter(raw)
  const rt = readingTime(content)
  return {
    slug: file.slug,
    title: data.title ?? file.slug,
    day: data.day,
    date: data.date ? String(data.date) : '',
    excerpt: data.excerpt ?? '',
    tags: data.tags ?? [],
    topics: data.topics ?? [],
    series: data.series,
    seriesSlug: data.seriesSlug,
    seriesTotal: data.seriesTotal,
    readTime: `${Math.ceil(rt.minutes)} min read`,
    readMinutes: Math.ceil(rt.minutes),
    words: rt.words,
    content: withContent ? content : '',
  }
}

export function getAllArticles(): ArticleMeta[] {
  return listContentFiles()
    .map(f => parseFile(f, false))
    .sort((a, b) => (b.day ?? 0) - (a.day ?? 0) || (a.date < b.date ? 1 : -1))
}

export function getArticle(slug: string): Article | null {
  const file = listContentFiles().find(f => f.slug === slug)
  return file ? parseFile(file, true) : null
}

export function getSeriesArticles(seriesSlug: string): ArticleMeta[] {
  return getAllArticles()
    .filter(a => a.seriesSlug === seriesSlug)
    .sort((a, b) => (a.day ?? 0) - (b.day ?? 0))
}

export function getAdjacent(slug: string): { prev: ArticleMeta | null; next: ArticleMeta | null } {
  const article = getAllArticles().find(a => a.slug === slug)
  if (!article?.seriesSlug || article.day === undefined) return { prev: null, next: null }
  const series = getSeriesArticles(article.seriesSlug)
  const idx = series.findIndex(a => a.slug === slug)
  return {
    prev: idx > 0 ? series[idx - 1] : null,
    next: idx >= 0 && idx < series.length - 1 ? series[idx + 1] : null,
  }
}

export interface SearchDoc {
  slug: string
  title: string
  day?: number
  excerpt: string
  tags: string[]
  readTime: string
}

export function getSearchIndex(): SearchDoc[] {
  return getAllArticles().map(({ slug, title, day, excerpt, tags, readTime }) => ({
    slug, title, day, excerpt, tags, readTime,
  }))
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>()
  for (const a of getAllArticles())
    for (const t of a.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count)
}
