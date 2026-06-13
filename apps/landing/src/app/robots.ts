import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/_next/', '/demos/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/demos/'],
      },
      {
        userAgent: 'Googlebot-Image',
        allow: '/',
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/demos/'],
        crawlDelay: 1,
      },
      {
        userAgent: 'bingbot',
        allow: '/',
        disallow: ['/api/', '/demos/'],
      },
    ],
    sitemap: 'https://raos.uz/sitemap.xml',
    host: 'https://raos.uz',
  }
}
