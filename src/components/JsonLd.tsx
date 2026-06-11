/** Renders a JSON-LD structured-data script tag. */
export default function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  )
}

const PERSON = {
  '@type': 'Person',
  name: 'Vishwas Sharma',
  url: 'https://syssignals.com/about',
  sameAs: ['https://x.com/syssignals', 'https://github.com/syssignals'],
}

export function articleJsonLd(a: {
  slug: string
  title: string
  excerpt: string
  date: string
  tags: string[]
  words: number
  day?: number
  series?: string
  seriesSlug?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: a.day !== undefined ? `Day ${a.day}: ${a.title}` : a.title,
    description: a.excerpt,
    url: `https://syssignals.com/articles/${a.slug}`,
    datePublished: a.date,
    wordCount: a.words,
    keywords: a.tags.join(', '),
    author: PERSON,
    publisher: {
      '@type': 'Organization',
      name: 'Systems & Signals',
      url: 'https://syssignals.com',
    },
    ...(a.series && a.seriesSlug
      ? {
          isPartOf: {
            '@type': 'Course',
            name: a.series,
            url: `https://syssignals.com/series/${a.seriesSlug}`,
          },
        }
      : {}),
  }
}

export function courseJsonLd(s: { slug: string; name: string; description: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: s.name,
    description: s.description,
    url: `https://syssignals.com/series/${s.slug}`,
    provider: {
      '@type': 'Organization',
      name: 'Systems & Signals',
      url: 'https://syssignals.com',
    },
    isAccessibleForFree: true,
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      courseWorkload: 'PT1H',
    },
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
      category: 'free',
    },
    author: PERSON,
  }
}
