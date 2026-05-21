'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Sparkles,
  Shirt,
  Settings,
  ShoppingCart,
  Wind,
  Smartphone,
  Eye,
} from 'lucide-react'
import { clsx } from 'clsx'
import { useLang } from '@/i18n/LangContext'

const ICONS = [Sparkles, Shirt, Settings, ShoppingCart, Wind, Smartphone, Eye]

export default function SegmentCarousel() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const { t } = useLang()
  const [active, setActive] = useState(0)

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
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const Icon = ICONS[active] ?? Sparkles
  const segment = t.segments.items[active]

  return (
    <section className="bg-[#112F4B] py-20">
      <div ref={sectionRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Sarlavha */}
        <div className="text-center mb-10 fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t.segments.title}
          </h2>
        </div>

        {/* Pill tugmalar */}
        <div className="fade-up flex flex-wrap justify-center gap-2.5 mb-10">
          {t.segments.items.map((seg, idx) => (
            <button
              key={idx}
              onClick={() => setActive(idx)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200',
                active === idx
                  ? 'bg-[#24D4F4] text-[#0E1530] border-[#24D4F4] shadow-[0_0_16px_rgba(36,212,244,0.4)]'
                  : 'bg-transparent text-slate-400 border-[rgba(36,212,244,0.2)] hover:border-[#24D4F4]/50 hover:text-white',
              )}
            >
              {(() => {
                const PillIcon = ICONS[idx] ?? Sparkles
                return <PillIcon size={14} className="shrink-0" />
              })()}
              {seg.title}
            </button>
          ))}
        </div>

        {/* Featured karta */}
        <div className="fade-up">
          <div
            key={active}
            className="glass rounded-2xl p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-[0_0_40px_rgba(36,212,244,0.08)] animate-segment-in"
          >
            {/* Icon blok */}
            <div className="shrink-0 w-20 h-20 rounded-2xl bg-[#24D4F4]/10 border border-[#24D4F4]/20 flex items-center justify-center shadow-[0_0_24px_rgba(36,212,244,0.15)]">
              <Icon size={36} className="text-[#24D4F4]" />
            </div>

            {/* Matn */}
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h3 className="text-white font-bold text-xl">{segment.title}</h3>
              <p className="text-slate-400 text-base leading-relaxed">{segment.description}</p>
              {/* Dot navigator */}
              <div className="flex justify-center sm:justify-start gap-1.5 mt-3">
                {t.segments.items.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActive(idx)}
                    className={clsx(
                      'rounded-full transition-all duration-300',
                      active === idx
                        ? 'w-5 h-2 bg-[#24D4F4]'
                        : 'w-2 h-2 bg-slate-600 hover:bg-slate-400',
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
