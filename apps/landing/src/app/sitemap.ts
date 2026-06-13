import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://raos.uz'
  const lastModified = new Date('2026-06-13')

  const pages = [
    { path: '',           changeFrequency: 'weekly' as const,  priority: 1.0 },
    { path: '/tutorials', changeFrequency: 'weekly' as const,  priority: 0.8 },
    { path: '/privacy',   changeFrequency: 'yearly' as const,  priority: 0.3 },
    { path: '/terms',     changeFrequency: 'yearly' as const,  priority: 0.3 },
  ]

  const result: MetadataRoute.Sitemap = []

  for (const page of pages) {
    // Main (UZ) version with alternates
    result.push({
      url: `${baseUrl}${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      alternates: {
        languages: {
          uz: `${baseUrl}${page.path}`,
          ru: `${baseUrl}/ru${page.path}`,
          en: `${baseUrl}/en${page.path}`,
          'x-default': `${baseUrl}${page.path}`,
        },
      },
    })
    // RU version
    result.push({
      url: `${baseUrl}/ru${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority * 0.9,
      alternates: {
        languages: {
          uz: `${baseUrl}${page.path}`,
          ru: `${baseUrl}/ru${page.path}`,
          en: `${baseUrl}/en${page.path}`,
          'x-default': `${baseUrl}${page.path}`,
        },
      },
    })
    // EN version
    result.push({
      url: `${baseUrl}/en${page.path}`,
      lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority * 0.9,
      alternates: {
        languages: {
          uz: `${baseUrl}${page.path}`,
          ru: `${baseUrl}/ru${page.path}`,
          en: `${baseUrl}/en${page.path}`,
          'x-default': `${baseUrl}${page.path}`,
        },
      },
    })
  }

  return result
}
