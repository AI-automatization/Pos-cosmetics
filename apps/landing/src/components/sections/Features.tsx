'use client'

import { useEffect, useRef } from 'react'
import { ShieldCheck, Brain, Gift, WifiOff, Globe } from 'lucide-react'
import { useLang } from '@/i18n/LangContext'

const ICONS = [ShieldCheck, Brain, Gift, WifiOff, Globe]

export default function Features() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()

  useEffect(() => {
    const cards = sectionRef.current?.querySelectorAll('.slide-left, .slide-right')
    const innerEls = sectionRef.current?.querySelectorAll('.fade-up')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.05 },
    )
    cards?.forEach((el) => observer.observe(el))
    innerEls?.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section id="features" className="bg-[#112F4B] py-20">
      <div ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.features.title}</h2>
          <p className="text-slate-300 mt-3 text-base">{t.features.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {t.features.items.map((feature, idx) => {
            const Icon = ICONS[idx] ?? ShieldCheck
            const animClass = idx % 2 === 0 ? 'slide-left' : 'slide-right'
            const baseDelay = idx * 0.1
            return (
              <div
                key={idx}
                className={`${animClass} glass rounded-xl p-6 flex flex-col gap-4 hover:border-[#24D4F4]/40 hover:shadow-[0_0_20px_rgba(36,212,244,0.1)] transition-all duration-200 group`}
                style={{ animationDelay: `${baseDelay}s` }}
              >
                <div
                  className="fade-up w-12 h-12 rounded-xl bg-[#24D4F4]/10 flex items-center justify-center group-hover:bg-[#24D4F4]/20 transition-colors"
                  style={{ animationDelay: `${baseDelay + 0.15}s` }}
                  role="img"
                  aria-label={feature.title}
                >
                  <Icon size={24} className="text-[#24D4F4]" aria-hidden="true" />
                </div>

                {feature.badge && (
                  <span
                    className="fade-up inline-flex w-fit text-xs font-bold px-2.5 py-1 rounded-full bg-[#24D4F4]/10 text-[#24D4F4] border border-[#24D4F4]/20"
                    style={{ animationDelay: `${baseDelay + 0.22}s` }}
                  >
                    {feature.badge}
                  </span>
                )}

                <h3
                  className="fade-up text-white font-bold text-base leading-snug"
                  style={{ animationDelay: `${baseDelay + 0.3}s` }}
                >
                  {feature.title}
                </h3>

                <p
                  className="fade-up text-slate-300 text-sm leading-relaxed"
                  style={{ animationDelay: `${baseDelay + 0.38}s` }}
                >
                  {feature.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
