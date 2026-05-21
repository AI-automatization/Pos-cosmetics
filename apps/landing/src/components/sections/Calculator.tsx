'use client'

import { useState, useMemo } from 'react'
import { useLang } from '@/i18n/LangContext'

const BRANCH_COST: Record<string, number> = {
  a:     3_588_000,
  b:     1_200_000,
  smart: 2_400_000,
  other: 1_800_000,
  none:  0,
}

const FINE_RISK: Record<string, number> = {
  a:     300_000,
  b:     700_000,
  smart: 1_000_000,
  other: 2_000_000,
  none:  3_500_000,
}

const POS_KEYS = ['a', 'b', 'smart', 'other', 'none'] as const
type PosKey = typeof POS_KEYS[number]

function getRaosYearly(branches: number): number {
  const monthly = branches <= 1 ? 249_000 : branches <= 3 ? 449_000 : 799_000
  return monthly * 12
}

function fmt(n: number): string {
  if (n === 0) return '0'
  const mln = n / 1_000_000
  if (mln >= 1) return mln.toFixed(1) + ' mln'
  return Math.round(n / 1_000) + ' ming'
}

function BarRow({
  label,
  value,
  maxVal,
  gradientFrom,
  gradientTo,
  textColor,
}: {
  label: string
  value: number
  maxVal: number
  gradientFrom: string
  gradientTo: string
  textColor: string
}) {
  const pct = maxVal > 0 ? Math.max(4, (value / maxVal) * 100) : 4
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-slate-400 text-xs sm:text-sm">{label}</span>
        <span className={`text-xs sm:text-sm font-bold ${textColor}`}>{fmt(value)} UZS</span>
      </div>
      <div className="h-2 rounded-full bg-slate-700/40 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(to right, ${gradientFrom}, ${gradientTo})`,
          }}
        />
      </div>
    </div>
  )
}

export default function Calculator() {
  const { t } = useLang()
  const tr = t.calculator
  const [branches, setBranches] = useState(2)
  const [posType, setPosType] = useState<PosKey>('a')

  const { currentCost, fineRisk, totalCurrent, raosCost, savings, maxVal } = useMemo(() => {
    const currentCost = BRANCH_COST[posType] * branches
    const fineRisk = FINE_RISK[posType] * branches
    const totalCurrent = currentCost + fineRisk
    const raosCost = getRaosYearly(branches)
    const savings = Math.max(0, totalCurrent - raosCost)
    const maxVal = Math.max(totalCurrent, raosCost, 1)
    return { currentCost, fineRisk, totalCurrent, raosCost, savings, maxVal }
  }, [branches, posType])

  const sliderPct = ((branches - 1) / 9) * 100

  return (
    <section id="calculator" className="py-20 bg-[#0a1020]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{tr.title}</h2>
          <p className="text-slate-400 max-w-xl mx-auto">{tr.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Controls */}
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-8">

            {/* Branch slider */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">{tr.branches}</span>
                <span className="text-[#24D4F4] text-3xl font-bold tabular-nums">{branches}</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={branches}
                onChange={(e) => setBranches(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #24D4F4 ${sliderPct}%, rgba(36,212,244,0.2) ${sliderPct}%)`,
                  accentColor: '#24D4F4',
                }}
              />
              <div className="flex justify-between text-slate-500 text-xs mt-2 px-0.5">
                <span>1</span>
                <span>3</span>
                <span>5</span>
                <span>7</span>
                <span>10</span>
              </div>
            </div>

            {/* POS type buttons */}
            <div>
              <p className="text-white font-semibold mb-3">{tr.currentSystem}</p>
              <div className="flex flex-wrap gap-2">
                {POS_KEYS.map((key) => (
                  <button
                    key={key}
                    onClick={() => setPosType(key)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold border transition-all duration-200 ${
                      posType === key
                        ? 'bg-[#24D4F4]/20 text-[#24D4F4] border-[#24D4F4]/60 shadow-[0_0_12px_rgba(36,212,244,0.2)]'
                        : 'bg-transparent text-slate-400 border-slate-600/40 hover:border-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {tr.options[key]}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">{tr.disclaimer}</p>
          </div>

          {/* Results */}
          <div className="glass rounded-2xl p-6 sm:p-8 space-y-5">

            <BarRow
              label={tr.results.currentCost}
              value={currentCost}
              maxVal={maxVal}
              gradientFrom="rgba(249,115,22,0.7)"
              gradientTo="rgba(251,146,60,0.4)"
              textColor="text-orange-300"
            />
            <BarRow
              label={tr.results.fineRisk}
              value={fineRisk}
              maxVal={maxVal}
              gradientFrom="rgba(239,68,68,0.7)"
              gradientTo="rgba(252,165,165,0.4)"
              textColor="text-red-300"
            />

            <div className="border-t border-slate-700/40 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">{tr.results.total}</span>
                <span className="text-white font-bold">
                  {fmt(totalCurrent)} UZS{tr.results.perYear}
                </span>
              </div>
            </div>

            <BarRow
              label={tr.results.raosCost}
              value={raosCost}
              maxVal={maxVal}
              gradientFrom="rgba(36,212,244,0.7)"
              gradientTo="rgba(95,238,251,0.4)"
              textColor="text-[#24D4F4]"
            />

            {/* Savings highlight */}
            <div
              className={`rounded-2xl p-5 text-center transition-all duration-500 ${
                savings > 0
                  ? 'bg-emerald-500/10 border border-emerald-500/30'
                  : 'bg-slate-700/20 border border-slate-600/20'
              }`}
            >
              <p className="text-slate-400 text-sm mb-1">{tr.results.savings}</p>
              <p
                className={`text-3xl font-bold transition-all duration-500 ${
                  savings > 0 ? 'text-emerald-400' : 'text-slate-500'
                }`}
              >
                {savings > 0 ? `${fmt(savings)} UZS` : '—'}
              </p>
              {savings > 0 && (
                <p className="text-emerald-400/60 text-sm mt-1">{tr.results.perYear}</p>
              )}
            </div>

            <a
              href="/#register"
              className="block w-full text-center bg-[#24D4F4] text-[#0E1530] font-bold py-3 rounded-xl hover:bg-[#0FA8C8] transition-colors"
            >
              {tr.cta}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
