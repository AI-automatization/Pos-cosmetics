'use client'

import { useEffect, useRef } from 'react'
import { useLang } from '@/i18n/LangContext'

export default function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLang()

  useEffect(() => {
    const elements = sectionRef.current?.querySelectorAll('.fade-up')
    if (!elements) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          } else {
            entry.target.classList.remove('visible')
          }
        })
      },
      { threshold: 0.15 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#0E1530] py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14 fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.howItWorks.title}</h2>
          <p className="text-slate-300 mt-3 text-base">{t.howItWorks.subtitle}</p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Desktop connector */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+20px)] right-[calc(16.67%+20px)] h-px border-t-2 border-dashed border-[#24D4F4]/30" />

          {t.howItWorks.steps.map((step, idx) => (
            <div
              key={idx}
              className="fade-up relative flex flex-col items-center text-center gap-4 z-10"
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="w-20 h-20 rounded-full border-2 border-[#24D4F4] bg-[#0E1530] flex items-center justify-center shadow-[0_0_20px_rgba(36,212,244,0.15)]">
                <span className="text-[#24D4F4] font-bold text-xl">{step.number}</span>
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-300 text-sm leading-relaxed max-w-xs mx-auto">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 fade-up" style={{ animationDelay: '0.45s' }}>
          <a
            href="#register"
            className="inline-flex items-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold px-8 py-3.5 rounded-xl hover:bg-[#0FA8C8] transition-colors"
          >
            {t.howItWorks.cta}
          </a>
        </div>
      </div>
    </section>
  )
}
