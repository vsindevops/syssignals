import { notFound } from 'next/navigation'
import { getArticle } from '@/lib/articles'
import { ogCard, OG_SIZE } from '@/lib/og'

export const size = OG_SIZE
export const contentType = 'image/png'
export const alt = 'Article cover'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  return ogCard({
    day: article.day,
    title: article.title,
    subtitle: `${article.readTime} · hands-on build`,
    footer: 'syssignals.com · 30 Days of DevOps',
  })
}
