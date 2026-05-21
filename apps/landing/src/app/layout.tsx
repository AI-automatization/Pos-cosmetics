import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ScrollProgress'
import { LangProvider } from '@/i18n/LangContext'
import JsonLd from '@/components/JsonLd'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: {
    default: "RAOS — O'zbekiston uchun smart POS tizimi",
    template: '%s | RAOS',
  },
  description:
    "Kassa, sklad, Soliq.uz integratsiya, AI hisobot. 30 kun bepul sinov. Internet bo'lmasa ham ishlaydi. O'zbekiston uchun yaratilgan.",
  keywords: [
    'POS tizimi', 'kassa dasturi', "do'kon boshqaruv", 'RAOS',
    'Soliq.uz', 'offline kassa', 'smart kassa', 'savdo dasturi',
    'онлайн касса', 'POS система Узбекистан', 'кассовый аппарат',
  ],
  authors: [{ name: 'Tezcode', url: 'https://raos.uz' }],
  creator: 'Tezcode',
  metadataBase: new URL('https://raos.uz'),
  alternates: {
    canonical: '/',
    languages: {
      'uz': '/',
      'ru': '/',
      'en': '/',
    },
  },
  openGraph: {
    title: "RAOS — O'zbekiston uchun smart POS tizimi",
    description: "Kassa, sklad, Soliq.uz, AI hisobot. 30 kun bepul sinov. Internet bo'lmasa ham ishlaydi.",
    type: 'website',
    url: 'https://raos.uz',
    siteName: 'RAOS',
    locale: 'uz_UZ',
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
    title: "RAOS — Smart POS tizimi",
    description: "30 kun bepul sinov. Karta kerak emas.",
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
  verification: {
    google: 'google-site-verification-token',
  },
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
