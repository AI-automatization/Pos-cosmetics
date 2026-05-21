'use client'

import { useEffect, useRef, useState } from 'react'
import { Star } from 'lucide-react'
import { useLang } from '@/i18n/LangContext'
import type { Translations } from '@/i18n/translations'

type StatItem = Translations['testimonials']['stats'][number]
type TestimonialItem = Translations['testimonials']['items'][number]

function useCountUp(target: number, duration = 1500, active: boolean) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    let start = 0
    const step = target / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, active])
  return count
}

export default function Testimonials() {
  const statsRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)
  const [statsActive, setStatsActive] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const statsEl = statsRef.current
    if (!statsEl) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setStatsActive(entry.isIntersecting)
        })
      },
      { threshold: 0.3 },
    )
    observer.observe(statsEl)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const elements = cardsRef.current?.querySelectorAll('.scale-in')
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

  return (
    <section className="bg-[#0E1530] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div ref={statsRef} className="flex flex-wrap justify-center gap-10 mb-16">
          {t.testimonials.stats.map((stat) => (
            <StatItem key={stat.label} stat={stat} active={statsActive} />
          ))}
        </div>

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.testimonials.title}</h2>
        </div>

        <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {t.testimonials.items.map((item, idx) => (
            <TestimonialCard key={idx} testimonial={item} idx={idx} />
          ))}
        </div>
      </div>
    </section>
  )
}

function StatItem({ stat, active }: { stat: StatItem; active: boolean }) {
  const count = useCountUp(stat.value, 1500, active)
  return (
    <div className="text-center">
      <p className="text-[#24D4F4] font-bold text-4xl">
        {count.toLocaleString('uz-UZ')}
        {stat.suffix}
      </p>
      <p className="text-slate-400 text-sm mt-1">{stat.label}</p>
    </div>
  )
}

function TestimonialCard({ testimonial, idx }: { testimonial: TestimonialItem; idx: number }) {
  return (
    <div
      className="scale-in glass rounded-xl p-6 flex flex-col gap-4 transition-all duration-300 cursor-pointer hover:scale-[0.97] hover:border-[#24D4F4] hover:shadow-[0_0_30px_rgba(36,212,244,0.2)]"
      style={{ animationDelay: `${idx * 0.15}s` }}
    >
      <div className="flex gap-0.5">
        {Array.from({ length: testimonial.rating }).map((_, i) => (
          <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
        ))}
      </div>
      <p className="text-slate-300 text-sm leading-relaxed italic">&quot;{testimonial.text}&quot;</p>
      <div className="mt-auto pt-3 border-t border-[rgba(36,212,244,0.1)]">
        <p className="text-white font-semibold text-sm">{testimonial.name}</p>
        <p className="text-slate-500 text-xs mt-0.5">{testimonial.business}</p>
      </div>
    </div>
  )
}
