import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { headers } from 'next/headers'
import './globals.css'
import ScrollProgress from '@/components/ScrollProgress'
import { LangProvider } from '@/i18n/LangContext'
import type { Lang } from '@/i18n/translations'
import JsonLd from '@/components/JsonLd'
import Analytics from '@/components/Analytics'

const inter = Inter({ subsets: ['latin', 'cyrillic'], display: 'swap' })

const seoMeta: Record<Lang, { title: string; description: string; ogTitle: string; ogDesc: string; twitterTitle: string; twitterDesc: string }> = {
  uz: {
    title: "RAOS — POS tizimi va kassa dasturi O'zbekiston uchun",
    description: "POS tizimi va kassa dasturi O'zbekiston do'konlari uchun. Soliq.uz integratsiya, AI hisobot, offline ishlaydi. 30 kun bepul sinov — karta kerak emas.",
    ogTitle: "RAOS — POS tizimi va kassa dasturi O'zbekiston uchun",
    ogDesc: "POS tizimi: kassa, sklad, Soliq.uz, AI hisobot. 30 kun bepul. Offline ishlaydi. Toshkent, Samarqand, Namangan.",
    twitterTitle: "RAOS — POS tizimi O'zbekiston do'konlari uchun",
    twitterDesc: "Kassa dasturi: 30 kun bepul sinov. Offline ishlaydi. Soliq.uz integratsiya. Karta kerak emas.",
  },
  ru: {
    title: 'RAOS — POS система и кассовая программа для Узбекистана',
    description: 'POS система и кассовая программа для магазинов Узбекистана. Интеграция Soliq.uz, AI-отчёты, работает офлайн. 30 дней бесплатно — без карты.',
    ogTitle: 'RAOS — POS система и кассовая программа для Узбекистана',
    ogDesc: 'POS система: касса, склад, Soliq.uz, AI-отчёты. 30 дней бесплатно. Работает офлайн. Ташкент, Самарканд, Наманган.',
    twitterTitle: 'RAOS — POS система для магазинов Узбекистана',
    twitterDesc: 'Кассовая программа: 30 дней бесплатно. Работает офлайн. Интеграция Soliq.uz. Без карты.',
  },
  en: {
    title: 'RAOS — POS System & Cash Register Software for Uzbekistan',
    description: 'POS system and cash register software for Uzbekistan stores. Soliq.uz integration, AI reports, works offline. 30-day free trial — no card required.',
    ogTitle: 'RAOS — POS System & Cash Register Software for Uzbekistan',
    ogDesc: 'POS system: cash register, inventory, Soliq.uz, AI reports. 30 days free. Works offline. Tashkent, Samarkand, Namangan.',
    twitterTitle: 'RAOS — POS System for Uzbekistan Stores',
    twitterDesc: 'Cash register software: 30-day free trial. Works offline. Soliq.uz integration. No card required.',
  },
}

const localeMap: Record<Lang, string> = { uz: 'uz_UZ', ru: 'ru_RU', en: 'en_US' }

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const lang = (headersList.get('x-lang') ?? 'uz') as Lang
  const meta = seoMeta[lang]
  const langPrefix = lang === 'uz' ? '' : `/${lang}`

  return {
    title: {
      default: meta.title,
      template: `%s | RAOS — ${lang === 'ru' ? 'POS система' : lang === 'en' ? 'POS System' : 'POS tizimi'}`,
    },
    description: meta.description,
    keywords: [
      // UZ — asosiy
      'POS tizimi', "POS tizimi O'zbekiston", 'pos dasturi', 'kassa dasturi', 'kassa tizimi',
      'kassa dasturi Toshkent', 'kassa dasturi Samarqand', 'kassa dasturi Namangan',
      'pos tizimi Toshkent', 'pos tizimi Samarqand', 'pos tizimi Andijon',
      "do'kon boshqaruv dasturi", 'savdo dasturi', 'sklad dasturi', 'tovar hisobi',
      'Soliq.uz integratsiya', 'OFD kassa', 'fiskal kassa', 'elektron kassa',
      'offline kassa', 'internet siz kassa', 'smart kassa', 'mobil kassa',
      'kassa ilovasi Android', 'telefon kassa', 'RAOS', 'raos.uz',
      'kassa dasturi Buxoro', 'kassa dasturi Andijon', "kassa dasturi Farg'ona",
      'kassa dasturi Nukus', 'kassa dasturi Qarshi', 'kassa dasturi Jizzax',
      'kosmetika kassasi', 'kiyim kassasi', 'oziq-ovqat kassasi', 'dorixona kassasi',
      'avtoqismlar kassasi', 'telefon kassasi', 'optika kassasi', 'parfumeriya kassasi',
      'restoran kassasi', 'fast food kassasi', 'savdo markazi kassasi',
      'ombor boshqaruv dasturi', 'inventar dasturi', 'sotuv hisoboti',
      'chegirma tizimi', 'mijozlar bazasi', 'QR kod kassa',
      // RU
      'POS система', 'POS система Узбекистан', 'POS система Ташкент', 'POS система Самарканд',
      'кассовый аппарат', 'кассовая программа', 'программа для кассы',
      'программа для магазина', 'управление магазином', 'складской учёт',
      'онлайн касса', 'электронная касса', 'касса без интернета', 'оффлайн касса',
      'интеграция Soliq.uz', 'фискальная касса Узбекистан',
      'POS система Бухара', 'POS система Наманган', 'POS система Андижан',
      'программа для косметики', 'программа для одежды', 'учёт товаров',
      'программа для аптеки', 'кассовая программа для ресторана',
      // EN
      'POS system', 'POS system Uzbekistan', 'point of sale Uzbekistan',
      'cash register software', 'retail POS software', 'store management software',
      'offline POS', 'mobile POS app', 'POS terminal Uzbekistan',
      'best POS Uzbekistan', 'cloud POS Central Asia', 'inventory management Uzbekistan',
      'Soliq.uz integration', 'fiscal cash register Uzbekistan',
    ],
    authors: [{ name: 'Tezcode', url: 'https://raos.uz' }],
    creator: 'Tezcode',
    publisher: 'Tezcode',
    category: 'Business Software',
    metadataBase: new URL('https://raos.uz'),
    applicationName: 'RAOS',
    alternates: {
      canonical: `https://raos.uz${langPrefix}`,
      languages: {
        'uz': 'https://raos.uz',
        'ru': 'https://raos.uz/ru',
        'en': 'https://raos.uz/en',
        'x-default': 'https://raos.uz',
      },
    },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDesc,
      type: 'website',
      url: `https://raos.uz${langPrefix}`,
      siteName: 'RAOS',
      locale: localeMap[lang],
      alternateLocale: Object.values(localeMap).filter(l => l !== localeMap[lang]),
      images: [
        {
          url: '/opengraph-image',
          width: 1200,
          height: 630,
          alt: meta.ogTitle,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.twitterTitle,
      description: meta.twitterDesc,
      images: ['/opengraph-image'],
      creator: '@raos_uz',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/icon',
      apple: '/apple-icon',
    },
    verification: {
      google: 'vhyI9C-zea0H-4Pek0dA2mpC7i6doIrSF-wqFRWdtQk',
      yandex: '9e0fb9bddc5ecb6c',
    },
    other: {
      'geo.region': 'UZ',
      'geo.placename': 'Tashkent',
      'geo.position': '41.2995;69.2401',
      'ICBM': '41.2995, 69.2401',
      'format-detection': 'telephone=no',
    },
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const lang = (headersList.get('x-lang') ?? 'uz') as Lang

  return (
    <html lang={lang} dir="ltr">
      <head>
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://mc.yandex.ru" />
        <link rel="dns-prefetch" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="https://mc.yandex.ru" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <JsonLd />
        <Analytics />
        <LangProvider initialLang={lang}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-[#24D4F4] focus:text-[#0E1530] focus:px-4 focus:py-2 focus:rounded-lg focus:font-bold"
          >
            Asosiy kontentga o&apos;tish
          </a>
          <ScrollProgress />
          {children}
        </LangProvider>
      </body>
    </html>
  )
}
