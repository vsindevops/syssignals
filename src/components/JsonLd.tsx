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

const PUBLISHER = {
  '@type': 'Organization',
  name: 'Systems & Signals',
  url: 'https://syssignals.com',
  logo: { '@type': 'ImageObject', url: 'https://syssignals.com/icon.svg' },
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
  const url = `https://syssignals.com/articles/${a.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    headline: a.day !== undefined ? `Day ${a.day}: ${a.title}` : a.title,
    description: a.excerpt,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    image: `${url}/opengraph-image`,
    datePublished: a.date,
    dateModified: a.date,
    inLanguage: 'en',
    wordCount: a.words,
    keywords: a.tags.join(', '),
    author: PERSON,
    publisher: PUBLISHER,
    isAccessibleForFree: true,
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

/** BreadcrumbList for an article (Home › Series › Article). */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  }
}

/** Site-level WebSite + Organization identity (emit once, on the homepage). */
export function siteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://syssignals.com/#org',
        name: 'Systems & Signals',
        url: 'https://syssignals.com',
        logo: 'https://syssignals.com/icon.svg',
        founder: PERSON,
        sameAs: ['https://x.com/syssignals', 'https://github.com/syssignals'],
      },
      {
        '@type': 'WebSite',
        '@id': 'https://syssignals.com/#website',
        name: 'Systems & Signals',
        url: 'https://syssignals.com',
        publisher: { '@id': 'https://syssignals.com/#org' },
        inLanguage: 'en',
      },
    ],
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
