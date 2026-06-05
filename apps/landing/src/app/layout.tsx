import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import ScrollProgress from '@/components/ScrollProgress'
import { LangProvider } from '@/i18n/LangContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: "RAOS — Har qanday do'kon uchun smart POS tizimi",
  description:
    "Kassa, sklad, Soliq.uz, AI hisobot. Pilot uchun ariza qoldiring. O'zbekiston uchun yaratilgan.",
  keywords:
    "POS tizimi, kassa dasturi, do'kon boshqaruv, RAOS, Soliq.uz, offline kassa",
  openGraph: {
    title: 'RAOS — Smart POS tizimi',
    description: 'Demo va pilot uchun ariza qoldiring.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="uz">
      <body
        className={`${inter.className} antialiased`}
        style={{ backgroundColor: '#0E1530', color: '#ffffff' }}
      >
        <LangProvider>
          <ScrollProgress />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
