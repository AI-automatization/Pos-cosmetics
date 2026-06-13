import type { Metadata } from 'next'
import { headers } from 'next/headers'
import TutorialsClient from './TutorialsClient'
import PageJsonLd from '@/components/PageJsonLd'
import type { Lang } from '@/i18n/translations'

const pageMeta: Record<Lang, { title: string; description: string }> = {
  uz: {
    title: "RAOS — Darsliklar | Video qo'llanmalar",
    description: "RAOS POS tizimi bo'yicha bepul video darsliklar. Ro'yxatdan o'tish, tovar qo'shish, hisobot olish. O'zbek, rus va ingliz tillarida.",
  },
  ru: {
    title: 'RAOS — Обучение | Видеоуроки',
    description: 'Бесплатные видеоуроки по POS-системе RAOS. Регистрация, добавление товаров, получение отчётов.',
  },
  en: {
    title: 'RAOS — Tutorials | Video Guides',
    description: 'Free video tutorials for RAOS POS system. Registration, adding products, getting reports.',
  },
}

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const lang = (headersList.get('x-lang') ?? 'uz') as Lang
  const meta = pageMeta[lang]
  const langPrefix = lang === 'uz' ? '' : `/${lang}`

  return {
    title: meta.title,
    description: meta.description,
    alternates: {
      canonical: `https://raos.uz${langPrefix}/tutorials`,
      languages: {
        'uz': 'https://raos.uz/tutorials',
        'ru': 'https://raos.uz/ru/tutorials',
        'en': 'https://raos.uz/en/tutorials',
        'x-default': 'https://raos.uz/tutorials',
      },
    },
  }
}

export default function TutorialsPage() {
  return (
    <>
      <PageJsonLd
        pageName="Darsliklar"
        pageUrl="https://raos.uz/tutorials"
        breadcrumbs={[
          { name: 'Bosh sahifa', url: 'https://raos.uz' },
          { name: 'Darsliklar', url: 'https://raos.uz/tutorials' },
        ]}
      />
      <TutorialsClient />
    </>
  )
}
