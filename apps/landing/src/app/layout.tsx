import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ScrollProgress'
import { LangProvider } from '@/i18n/LangContext'
import JsonLd from '@/components/JsonLd'
import Analytics from '@/components/Analytics'

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
  },
  twitter: {
    card: 'summary_large_image',
    title: "RAOS — POS tizimi O'zbekiston do'konlari uchun",
    description: "Kassa dasturi: 30 kun bepul sinov. Offline ishlaydi. Soliq.uz integratsiya. Karta kerak emas.",
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
    icon: '/icon',
    apple: '/apple-icon',
  },
  verification: { google: 'vhyI9C-zea0H-4Pek0dA2mpC7i6doIrSF-wqFRWdtQk' },
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
        <Analytics />
        <LangProvider>
          <ScrollProgress />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
