import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = {
  title: 'RAOS — Maxfiylik siyosati',
  description: "RAOS platformasida shaxsiy ma'lumotlarni himoya qilish siyosati. O'RQ-547 asosida.",
  alternates: {
    canonical: 'https://raos.uz/privacy',
    languages: {
      'uz': 'https://raos.uz/privacy',
      'ru': 'https://raos.uz/ru/privacy',
      'en': 'https://raos.uz/en/privacy',
    },
  },
}

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0E1530] pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            Bosh sahifaga
          </a>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Maxfiylik siyosati</h1>
          <p className="text-slate-500 text-sm mb-10">Oxirgi yangilanish: 2026-yil 21-may</p>

          <div className="prose-legal">

            <Section title="1. Umumiy ma'lumot">
              <p>
                Ushbu maxfiylik siyosati RAOS platformasi (keyingi o&apos;rinlarda &quot;Platforma&quot;) foydalanuvchilarining
                shaxsiy ma&apos;lumotlarini to&apos;plash, saqlash va qayta ishlash tartibini belgilaydi.
                Siyosat O&apos;zbekiston Respublikasining &quot;Shaxsiy ma&apos;lumotlar to&apos;g&apos;risida&quot;gi
                O&apos;RQ-547-son qonuni asosida tayyorlangan.
              </p>
              <p>
                Platforma operatori: <strong className="text-white">Tezcode</strong> (Toshkent, O&apos;zbekiston).
                Bog&apos;lanish: <a href="mailto:info@raos.uz" className="text-[#24D4F4] hover:underline">info@raos.uz</a>
              </p>
            </Section>

            <Section title="2. To'planadigan ma'lumotlar">
              <p>Ro&apos;yxatdan o&apos;tish va xizmatdan foydalanish jarayonida quyidagi ma&apos;lumotlar to&apos;planadi:</p>
              <ul>
                <li>To&apos;liq ism va familiya</li>
                <li>Telefon raqami</li>
                <li>Telegram username (ixtiyoriy)</li>
                <li>Do&apos;kon nomi va turi</li>
                <li>Filiallar soni</li>
                <li>Qurilma ma&apos;lumotlari va IP manzil (texnik maqsadlarda)</li>
              </ul>
            </Section>

            <Section title="3. Ma'lumotlardan foydalanish maqsadi">
              <ul>
                <li>RAOS xizmatlarini taqdim etish va yaxshilash</li>
                <li>Foydalanuvchi hisobini boshqarish</li>
                <li>Texnik yordam ko&apos;rsatish (Telegram orqali)</li>
                <li>Hisob-kitob va to&apos;lov operatsiyalari</li>
                <li>Yangiliklar va xizmat o&apos;zgarishlari haqida xabardor qilish</li>
                <li>O&apos;zbekiston soliq va fiskal talablariga rioya qilish</li>
              </ul>
            </Section>

            <Section title="4. Ma'lumotlarni saqlash">
              <p>
                Shaxsiy ma&apos;lumotlar foydalanuvchi hisobi faol bo&apos;lgan davr va undan keyin 3 yil mobaynida saqlanadi.
                Moliyaviy va fiskal ma&apos;lumotlar O&apos;zbekiston qonunchiligiga muvofiq 5 yil saqlanadi.
              </p>
              <p>
                Ma&apos;lumotlar O&apos;zbekiston hududidagi serverlarda saqlanadi. Xorijga uzatilmaydi.
              </p>
            </Section>

            <Section title="5. Uchinchi shaxslarga berish">
              <p>Shaxsiy ma&apos;lumotlar quyidagi holatlardagina uchinchi shaxslarga berilishi mumkin:</p>
              <ul>
                <li>Foydalanuvchining aniq roziligi bilan</li>
                <li>O&apos;zbekiston qonunchiligiga muvofiq davlat organlari talabi bo&apos;yicha</li>
                <li>Soliq.uz (OFD) — fiskal cheklar uzatish uchun (faqat savdo ma&apos;lumotlari)</li>
              </ul>
              <p>Marketing maqsadlarida uchinchi shaxslarga ma&apos;lumot berilmaydi.</p>
            </Section>

            <Section title="6. Foydalanuvchi huquqlari">
              <p>O&apos;RQ-547 asosida sizda quyidagi huquqlar mavjud:</p>
              <ul>
                <li>O&apos;z ma&apos;lumotlaringizga kirish va nusxa olish huquqi</li>
                <li>Noto&apos;g&apos;ri ma&apos;lumotlarni tuzatish talabi</li>
                <li>Ma&apos;lumotlarni o&apos;chirish talabi (hisob yopilganda)</li>
                <li>Ma&apos;lumotlarni qayta ishlashga rozi bo&apos;lmaslik huquqi</li>
              </ul>
              <p>
                So&apos;rovlar uchun:{' '}
                <a href="mailto:info@raos.uz" className="text-[#24D4F4] hover:underline">info@raos.uz</a>
              </p>
            </Section>

            <Section title="7. Cookie va kuzatuv">
              <p>
                Platforma texnik cookie fayllardan foydalanadi (sessiya boshqaruvi, til sozlamalari).
                Reklama yoki tracking cookie ishlatilmaydi. Til tanlovi (uz/ru/en) faqat
                brauzeringizda (localStorage) saqlanadi.
              </p>
            </Section>

            <Section title="8. Xavfsizlik">
              <p>
                Ma&apos;lumotlar shifrlangan kanal (HTTPS/TLS) orqali uzatiladi.
                Parollar bcrypt algoritmi bilan himoyalanadi.
                Ma&apos;lumotlarga kirish faqat vakolatli xodimlarga berilgan.
              </p>
            </Section>

            <Section title="9. Siyosat o'zgarishlari">
              <p>
                Maxfiylik siyosati o&apos;zgarganda foydalanuvchilar Telegram orqali xabardor qilinadi.
                Yangi siyosat e&apos;lon qilingan kundan 14 kun o&apos;tgach kuchga kiradi.
              </p>
            </Section>

          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-bold text-white mb-3 pb-2 border-b border-[rgba(36,212,244,0.15)]">
        {title}
      </h2>
      <div className="text-slate-400 text-sm leading-relaxed space-y-3">{children}</div>
    </div>
  )
}
