'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { clsx } from 'clsx'
import { useLang } from '@/i18n/LangContext'

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null)
  const { t } = useLang()

  const toggle = (idx: number) => setOpenIdx((prev) => (prev === idx ? null : idx))

  return (
    <section id="faq" className="bg-[#112F4B] py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.faq.title}</h2>
        </div>

        <div className="flex flex-col">
          {t.faq.items.map((item, idx) => {
            const isOpen = openIdx === idx
            return (
              <div
                key={idx}
                className={clsx(
                  'border-b transition-colors',
                  isOpen ? 'border-[#24D4F4]/40' : 'border-[rgba(36,212,244,0.2)]',
                )}
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                  aria-expanded={isOpen}
                >
                  <h3 className="text-white font-semibold text-base">{item.question}</h3>
                  {isOpen ? (
                    <ChevronUp size={20} className="text-[#24D4F4] shrink-0" />
                  ) : (
                    <ChevronDown size={20} className="text-slate-400 shrink-0" />
                  )}
                </button>

                <div
                  className={clsx(
                    'overflow-hidden transition-all duration-300',
                    isOpen ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0',
                  )}
                >
                  <p className="text-slate-400 text-sm leading-relaxed">{item.answer}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
