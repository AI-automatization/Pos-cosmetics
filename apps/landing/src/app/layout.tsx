import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
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
    // UZ — asosiy
    'POS tizimi', "POS tizimi O'zbekiston", 'pos dasturi', 'kassa dasturi', 'kassa tizimi',
    'kassa dasturi Toshkent', 'kassa dasturi Samarqand', 'kassa dasturi Namangan',
    'pos tizimi Toshkent', 'pos tizimi Samarqand', 'pos tizimi Andijon',
    "do'kon boshqaruv dasturi", 'savdo dasturi', 'sklad dasturi', 'tovar hisobi',
    'Soliq.uz integratsiya', 'OFD kassa', 'fiskal kassa', 'elektron kassa',
    'offline kassa', 'internet siz kassa', 'smart kassa', 'mobil kassa',
    'kassa ilovasi Android', 'telefon kassa', 'RAOS', 'raos.uz',
    // RU
    'POS система', 'POS система Узбекистан', 'POS система Ташкент', 'POS система Самарканд',
    'кассовый аппарат', 'кассовая программа', 'программа для кассы',
    'программа для магазина', 'управление магазином', 'складской учёт',
    'онлайн касса', 'электронная касса', 'касса без интернета', 'оффлайн касса',
    'интеграция Soliq.uz', 'фискальная касса Узбекистан',
    // EN
    'POS system', 'POS system Uzbekistan', 'point of sale Uzbekistan',
    'cash register software', 'retail POS software', 'store management software',
    'offline POS', 'mobile POS app', 'POS terminal Uzbekistan',
  ],
  authors: [{ name: 'Tezcode', url: 'https://raos.uz' }],
  creator: 'Tezcode',
  metadataBase: new URL('https://raos.uz'),
  alternates: {
    canonical: 'https://raos.uz',
    languages: {
      'uz': 'https://raos.uz',
      'ru': 'https://raos.uz/ru',
      'en': 'https://raos.uz/en',
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
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: "RAOS — Smart POS tizimi O'zbekiston uchun",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "RAOS — POS tizimi O'zbekiston do'konlari uchun",
    description: "Kassa dasturi: 30 kun bepul sinov. Offline ishlaydi. Soliq.uz integratsiya. Karta kerak emas.",
    images: ['/opengraph-image'],
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
  verification: { google: 'vhyI9C-zea0H-4Pek0dA2mpC7i6doIrSF-wqFRWdtQk', yandex: '9e0fb9bddc5ecb6c' },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const lang = headersList.get('x-lang') ?? 'uz'

  return (
    <html lang={lang}>
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
