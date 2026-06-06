import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RAOS — POS tizimi O'zbekiston uchun",
    short_name: 'RAOS',
    description: "Kassa dasturi va POS tizimi O'zbekiston do'konlari uchun",
    start_url: '/',
    display: 'standalone',
    background_color: '#0E1530',
    theme_color: '#0E1530',
    icons: [
      {
        src: '/icon',
        sizes: 'any',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      },
    ],
  }
}
