import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://raos.uz'
  const lastModified = new Date('2026-05-21')
  const langs = ['uz', 'ru', 'en'] as const

  const pages = [
    { path: '', changeFrequency: 'weekly' as const, priority: 1 },
    { path: '/tutorials', changeFrequency: 'weekly' as const, priority: 0.8 },
    { path: '/privacy', changeFrequency: 'yearly' as const, priority: 0.3 },
    { path: '/terms', changeFrequency: 'yearly' as const, priority: 0.3 },
  ]

  return pages.flatMap((page) =>
    langs.map((lang) => ({
      url: `${baseUrl}${page.path}${lang === 'uz' ? '' : `?lang=${lang}`}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: lang === 'uz' ? page.priority : page.priority * 0.9,
    })),
  )
}
