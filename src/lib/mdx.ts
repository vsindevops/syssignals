import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import readingTime from 'reading-time'

const CONTENT_DIR = path.join(process.cwd(), 'content')

export interface ArticleMeta {
  slug:        string
  title:       string
  date:        string
  excerpt:     string
  series?:     string
  seriesSlug?: string
  day?:        number
  tags:        string[]
  readTime:    string
}

export interface Article extends ArticleMeta {
  content: string
}

export function getAllArticles(): ArticleMeta[] {
  const articles: ArticleMeta[] = []

  const walkDir = (dir: string, seriesSlug?: string, seriesName?: string) => {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        walkDir(fullPath, entry.name, entry.name)
      } else if (entry.name.endsWith('.mdx') || entry.name.endsWith('.md')) {
        const raw     = fs.readFileSync(fullPath, 'utf-8')
        const { data, content } = matter(raw)
        const slug    = entry.name.replace(/\.(mdx|md)$/, '')
        articles.push({
          slug,
          title:      data.title       ?? slug,
          date:       data.date        ? String(data.date) : '',
          excerpt:    data.excerpt     ?? '',
          series:     data.series      ?? seriesName,
          seriesSlug: data.seriesSlug  ?? seriesSlug,
          day:        data.day,
          tags:       data.tags        ?? [],
          readTime:   readingTime(content).text,
        })
      }
    }
  }

  walkDir(CONTENT_DIR)
  return articles.sort((a, b) => (a.date < b.date ? 1 : -1))
}

export function getArticle(slug: string): Article | null {
  const search = (dir: string): Article | null => {
    if (!fs.existsSync(dir)) return null
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        const result = search(fullPath)
        if (result) return result
      } else if (entry.name.replace(/\.(mdx|md)$/, '') === slug) {
        const raw = fs.readFileSync(fullPath, 'utf-8')
        const { data, content } = matter(raw)
        return {
          slug,
          title:      data.title   ?? slug,
          date:       data.date    ? String(data.date) : '',
          excerpt:    data.excerpt ?? '',
          series:     data.series,
          seriesSlug: data.seriesSlug,
          day:        data.day,
          tags:       data.tags    ?? [],
          readTime:   readingTime(content).text,
          content,
        }
      }
    }
    return null
  }
  return search(CONTENT_DIR)
}

export function getSeriesArticles(seriesSlug: string): ArticleMeta[] {
  return getAllArticles()
    .filter(a => a.seriesSlug === seriesSlug)
    .sort((a, b) => (a.day ?? 0) - (b.day ?? 0))
}
