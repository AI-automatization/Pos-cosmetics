import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { headers } from 'next/headers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import PageJsonLd from '@/components/PageJsonLd'
import { ArrowLeft } from 'lucide-react'
import type { Lang } from '@/i18n/translations'

const pageMeta: Record<Lang, { title: string; description: string }> = {
  uz: {
    title: 'RAOS — Foydalanish shartlari',
    description: "RAOS platformasidan foydalanish shartlari va qoidalari.",
  },
  ru: {
    title: 'RAOS — Условия использования',
    description: 'Условия использования и правила платформы RAOS.',
  },
  en: {
    title: 'RAOS — Terms of Service',
    description: 'RAOS platform terms of service and usage rules.',
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
      canonical: `https://raos.uz${langPrefix}/terms`,
      languages: {
        'uz': 'https://raos.uz/terms',
        'ru': 'https://raos.uz/ru/terms',
        'en': 'https://raos.uz/en/terms',
        'x-default': 'https://raos.uz/terms',
      },
    },
  }
}

export default function TermsPage() {
  return (
    <>
      <PageJsonLd
        pageName="Foydalanish shartlari"
        pageUrl="https://raos.uz/terms"
        breadcrumbs={[
          { name: 'Bosh sahifa', url: 'https://raos.uz' },
          { name: 'Foydalanish shartlari', url: 'https://raos.uz/terms' },
        ]}
      />
      <Header />
      <main id="main-content" className="min-h-screen bg-[#0E1530] pt-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <a
            href="/"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors mb-10"
          >
            <ArrowLeft size={16} />
            Bosh sahifaga
          </a>

          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Foydalanish shartlari</h1>
          <p className="text-slate-500 text-sm mb-10">Oxirgi yangilanish: 2026-yil 21-may</p>

          <div className="prose-legal">

            <Section title="1. Qabul qilish">
              <p>
                RAOS platformasidan foydalanish orqali siz ushbu shartlarni to&apos;liq qabul qilasiz.
                Agar shartlarga rozi bo&apos;lmasangiz, platformadan foydalanmang.
              </p>
              <p>
                Platforma operatori: <strong className="text-white">Tezcode</strong> (Toshkent, O&apos;zbekiston).
              </p>
            </Section>

            <Section title="2. Xizmat tavsifi">
              <p>
                RAOS — savdo nuqtalari (POS) uchun bulutli boshqaruv tizimi. Xizmat quyidagilarni o&apos;z ichiga oladi:
              </p>
              <ul>
                <li>Savdo va kassa boshqaruvi (offline ishlash imkoniyati bilan)</li>
                <li>Sklad va inventar kuzatuvi</li>
                <li>Soliq.uz (OFD) integratsiyasi</li>
                <li>AI hisobot va tahlil (Night Cashier)</li>
                <li>Telegram bot orqali bildirishnomalar</li>
                <li>Ko&apos;p filial va foydalanuvchi boshqaruvi</li>
              </ul>
            </Section>

            <Section title="3. Hisob va ro'yxatdan o'tish">
              <ul>
                <li>Ro&apos;yxatdan o&apos;tish uchun haqiqiy ma&apos;lumot kiritish majburiy</li>
                <li>Bitta korxona uchun bitta hisob ochiladi</li>
                <li>Hisob ma&apos;lumotlarini (parol) boshqalarga bermaslik kerak</li>
                <li>Hisobdagi barcha faoliyat uchun foydalanuvchi o&apos;zi javobgar</li>
              </ul>
            </Section>

            <Section title="4. Sinov davri va to'lov">
              <p>
                <strong className="text-white">30 kunlik bepul sinov:</strong> Ariza tasdiqlanib, hisob ochilgandan so&apos;ng
                barcha funksiyalar 30 kun bepul taqdim etiladi. Karta yoki to&apos;lov ma&apos;lumoti talab qilinmaydi.
              </p>
              <p>Tarif rejalari (oylik/yillik):</p>
              <ul>
                <li><strong className="text-white">Starter</strong> — 249 000 so&apos;m/oy: 1 filial, 3 kassir</li>
                <li><strong className="text-white">Growth</strong> — 449 000 so&apos;m/oy: 3 filial, 10 kassir</li>
                <li><strong className="text-white">Pro</strong> — 799 000 so&apos;m/oy: cheksiz filial va kassir</li>
              </ul>
              <p>
                Yillik to&apos;lovda 2 oy bepul beriladi. Narxlar oldindan xabardor qilib o&apos;zgartirilishi mumkin.
              </p>
            </Section>

            <Section title="5. To'lovni qaytarish">
              <p>
                Xizmat sifatida muammo yuzaga kelsa, 7 ish kuni ichida murojaat qiling.
                Asossiz bekor qilishda to&apos;lov qaytarilmaydi.
                Bepul sinov davrida bekor qilish uchun hech qanday jarima yo&apos;q.
              </p>
            </Section>

            <Section title="6. Foydalanish qoidalari">
              <p>Quyidagilar taqiqlanadi:</p>
              <ul>
                <li>Platformani noto&apos;g&apos;ri yoki noqonuniy maqsadlarda ishlatish</li>
                <li>Boshqa foydalanuvchilarning ma&apos;lumotlariga ruxsatsiz kirish</li>
                <li>Tizimga zarar yetkazishga urinish (DDoS, hack)</li>
                <li>Litsenziya shartlarini buzgan holda xizmatni qayta sotish</li>
                <li>Fishing yoki firibgarlik operatsiyalari uchun foydalanish</li>
              </ul>
            </Section>

            <Section title="7. Intellektual mulk">
              <p>
                RAOS platformasining barcha kodlari, dizaynlari, logotipi va kontenti Tezcode kompaniyasiga tegishli.
                Foydalanuvchi faqat xizmatdan foydalanish huquqiga ega — ko&apos;chirish, tarqatish yoki o&apos;zgartirish
                taqiqlanadi.
              </p>
            </Section>

            <Section title="8. Ma'lumotlaringizga egalik">
              <p>
                Platforma orqali kiritgan barcha biznes ma&apos;lumotlaringiz (tovarlar, sotuvlar, mijozlar) sizga tegishli.
                Hisob yopilganda so&apos;rov asosida ma&apos;lumotlaringizni CSV/Excel formatida olishingiz mumkin.
              </p>
            </Section>

            <Section title="9. Xizmat uzilishi">
              <p>
                Texnik ishlar, yangilanishlar yoki favqulodda holatlarda xizmat vaqtincha to&apos;xtatilishi mumkin.
                Rejalashtirilgan texnik ishlar haqida Telegram orqali oldindan xabar beriladi.
                Tezcode uzilish tufayli yetkazilgan zararlar uchun javobgar emas.
              </p>
            </Section>

            <Section title="10. Shartnomani tugatish">
              <p>
                Foydalanuvchi istalgan vaqtda hisobni yopishi mumkin. Tezcode quyidagi hollarda hisobni yopishi mumkin:
              </p>
              <ul>
                <li>Ushbu shartlar buzilganda</li>
                <li>6 oy va undan ortiq to&apos;lov qilinmaganda</li>
                <li>Noqonuniy faoliyat aniqlanganda</li>
              </ul>
            </Section>

            <Section title="11. Murojaat va nizolar">
              <p>
                Savollar va shikoyatlar uchun:{' '}
                <a href="mailto:info@raos.uz" className="text-[#24D4F4] hover:underline">info@raos.uz</a>{' '}
                yoki Telegram: <a href="https://t.me/raos_support" className="text-[#24D4F4] hover:underline">@raos_support</a>
              </p>
              <p>
                Nizolar birinchi navbatda muzokaralar orqali hal qilinadi.
                Kelishuv bo&apos;lmasa — O&apos;zbekiston qonunchiligiga muvofiq sud tartibida.
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
