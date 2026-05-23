'use client'

import { useLang } from '@/i18n/LangContext'

export default function CTASection() {
  const { t } = useLang()

  return (
    <section className="relative overflow-hidden py-24 bg-gradient-to-b from-[#0E1530] to-[#112F4B]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#24D4F4]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">{t.cta.title}</h2>
        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">{t.cta.desc}</p>
        <a
          href="#register"
          className="inline-flex items-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold px-10 py-4 rounded-xl text-lg hover:bg-[#0FA8C8] transition-colors animate-pulse hover:animate-none"
        >
          {t.cta.button}
        </a>
        <p className="text-slate-500 text-sm mt-6">{t.cta.note}</p>
      </div>
    </section>
  )
}
