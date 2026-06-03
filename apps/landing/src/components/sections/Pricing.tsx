'use client'

import { useState } from 'react'
import { Check, Info } from 'lucide-react'
import { clsx } from 'clsx'
import { useLang } from '@/i18n/LangContext'
import type { Translations } from '@/i18n/translations'
import { formatNumber } from '@/lib/format'

type Plan = Translations['pricing']['plans'][number]

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false)
  const { t } = useLang()

  return (
    <section id="pricing" className="bg-[#112F4B] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.pricing.title}</h2>
          <p className="text-slate-400 mt-3 text-base">{t.pricing.subtitle}</p>
        </div>

        {/* Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={clsx('text-sm font-semibold transition-colors', !isYearly ? 'text-white' : 'text-slate-400')}>
            {t.pricing.monthly}
          </span>
          <button
            onClick={() => setIsYearly((v) => !v)}
            className={clsx(
              'relative w-14 h-7 rounded-full transition-colors overflow-hidden',
              isYearly ? 'bg-[#24D4F4]' : 'bg-slate-600',
            )}
            aria-label={`${t.pricing.monthly}/${t.pricing.yearly}`}
          >
            <span
              className={clsx(
                'absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200',
                isYearly ? 'translate-x-7' : 'translate-x-0',
              )}
            />
          </button>
          <span className={clsx('text-sm font-semibold transition-colors', isYearly ? 'text-white' : 'text-slate-400')}>
            {t.pricing.yearly}
          </span>
          <span
            className={clsx(
              'bg-emerald-500/20 text-emerald-400 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-500/30 transition-opacity duration-200',
              isYearly ? 'opacity-100' : 'opacity-0 pointer-events-none',
            )}
          >
            {t.pricing.save}
          </span>
        </div>

        {/* Kartalar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {t.pricing.plans.map((plan, idx) => (
            <PricingCard key={idx} plan={plan} isYearly={isYearly} perMonth={t.pricing.perMonth} />
          ))}
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">{t.pricing.note}</p>
      </div>
    </section>
  )
}

function PricingCard({
  plan,
  isYearly,
  perMonth,
}: {
  plan: Plan
  isYearly: boolean
  perMonth: string
}) {
  const price = isYearly ? plan.yearlyPrice : plan.price
  const formattedPrice = formatNumber(price)

  const cardContent = (
    <div
      className={clsx(
        'rounded-2xl p-7 flex flex-col gap-5 transition-all duration-300 cursor-pointer',
        plan.highlighted
          ? 'bg-[#112F4B]'
          : 'glass hover:scale-[0.97] hover:border-[#24D4F4] hover:shadow-[0_0_30px_rgba(36,212,244,0.2)]',
      )}
    >
      {plan.badge && (
        <span className="inline-flex w-fit text-xs font-bold px-3 py-1 rounded-full bg-[#24D4F4] text-[#0E1530]">
          {plan.badge}
        </span>
      )}

      <div>
        <h3 className="text-white font-bold text-xl">{plan.name}</h3>
        <p className="text-slate-400 text-sm mt-1">{plan.description}</p>
      </div>

      <div>
        <div className="flex items-baseline gap-1">
          <span className="text-white font-bold text-4xl">{formattedPrice}</span>
          <span className="text-slate-400 text-sm">{perMonth}</span>
        </div>
        {isYearly && (
          <p className="text-slate-500 text-xs mt-1 line-through">
            {formatNumber(plan.price)} {perMonth}
          </p>
        )}
      </div>

      <ul className="flex flex-col gap-2.5">
        {plan.features.map((feature, featureIdx) => {
          const isObj = typeof feature === 'object' && feature !== null
          const text = isObj ? feature.text : feature
          const tooltip = isObj ? feature.tooltip : null
          return (
            <li key={featureIdx} className="flex items-start gap-2.5">
              <Check size={16} className="text-[#24D4F4] mt-0.5 shrink-0" />
              <span className="text-slate-300 text-sm flex items-center gap-1">
                {text}
                {tooltip && (
                  <span className="relative group/tip inline-flex">
                    <Info size={13} className="text-slate-500 cursor-help hover:text-[#24D4F4] transition-colors shrink-0" />
                    <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 rounded-lg bg-slate-800 border border-slate-700 px-3 py-2 text-xs text-slate-200 opacity-0 group-hover/tip:opacity-100 transition-opacity duration-200 z-20 text-center leading-relaxed shadow-xl">
                      {tooltip}
                      <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700" />
                    </span>
                  </span>
                )}
              </span>
            </li>
          )
        })}
      </ul>

      <a
        href="#register"
        className={clsx(
          'mt-auto inline-flex items-center justify-center font-bold py-3.5 rounded-xl transition-colors text-sm',
          plan.highlighted
            ? 'bg-[#24D4F4] text-[#0E1530] hover:bg-[#0FA8C8]'
            : 'border border-[#24D4F4]/40 text-white hover:bg-[#24D4F4]/10',
        )}
      >
        {plan.cta}
      </a>
    </div>
  )

  if (plan.highlighted) {
    return (
      <div className="animated-border md:scale-105 transition-transform duration-300">
        <div className="animated-border-inner">{cardContent}</div>
      </div>
    )
  }

  return cardContent
}
