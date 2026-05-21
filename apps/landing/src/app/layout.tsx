import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ScrollProgress'
import { LangProvider } from '@/i18n/LangContext'
import JsonLd from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: "RAOS — POS tizimi va kassa dasturi O'zbekiston uchun",
    template: '%s | RAOS — POS tizimi',
  },
  description:
    "POS tizimi va kassa dasturi O'zbekiston do'konlari uchun. Soliq.uz integratsiya, AI hisobot, offline ishlaydi. 30 kun bepul sinov — karta kerak emas.",
  keywords: [
    'POS tizimi', 'POS tizimi Uzbekiston', 'kassa dasturi', 'kassa dasturi Toshkent',
    "do'kon boshqaruv dasturi", 'RAOS', 'Soliq.uz integratsiya', 'offline kassa',
    'smart kassa', 'savdo dasturi', 'fiskal kassa',
    'онлайн касса', 'POS система Узбекистан', 'кассовый аппарат', 'касса Ташкент',
    'POS system Uzbekistan', 'cash register software', 'point of sale Tashkent',
  ],
  authors: [{ name: 'Tezcode', url: 'https://raos.uz' }],
  creator: 'Tezcode',
  metadataBase: new URL('https://raos.uz'),
  alternates: {
    canonical: '/',
    languages: {
      'uz': '/',
      'ru': '/?lang=ru',
      'en': '/?lang=en',
    },
  },
  openGraph: {
    title: "RAOS — POS tizimi va kassa dasturi O'zbekiston uchun",
    description: "POS tizimi: kassa, sklad, Soliq.uz, AI hisobot. 30 kun bepul. Offline ishlaydi. Toshkent, Samarqand, Namangan.",
    type: 'website',
    url: 'https://raos.uz',
    siteName: 'RAOS',
    locale: 'uz_UZ',
    alternateLocale: ['ru_RU', 'en_US'],
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RAOS — Smart POS tizimi',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RAOS — POS tizimi O'zbekiston do'konlari uchun",
    description: "Kassa dasturi: 30 kun bepul sinov. Offline ishlaydi. Soliq.uz integratsiya. Karta kerak emas.",
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  // verification: { google: 'REAL_TOKEN_HERE' }, // TODO: получить реальный токен из Google Search Console
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body className={`${inter.className} antialiased`}>
        <JsonLd />
        <LangProvider>
          <ScrollProgress />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
