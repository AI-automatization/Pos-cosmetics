import TutorialsClient from './TutorialsClient'

export const metadata = {
  title: "RAOS — Darsliklar | Video qo'llanmalar",
  description: "RAOS POS tizimi bo'yicha bepul video darsliklar. Ro'yxatdan o'tish, tovar qo'shish, hisobot olish.",
  alternates: {
    canonical: 'https://raos.uz/tutorials',
    languages: {
      'uz': 'https://raos.uz/tutorials',
      'ru': 'https://raos.uz/ru/tutorials',
      'en': 'https://raos.uz/en/tutorials',
    },
  },
}

export default function TutorialsPage() {
  return <TutorialsClient />
}
