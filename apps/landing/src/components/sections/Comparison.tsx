'use client'

import { useLang } from '@/i18n/LangContext'
import type { Lang, Translations } from '@/i18n/translations'

type CompRow = Translations['comparison']['rows'][number]

const UZ_MONTHS = ['yanvar','fevral','mart','aprel','may','iyun','iyul','avgust','sentabr','oktabr','noyabr','dekabr']
const RU_MONTHS = ['январь','февраль','март','апрель','май','июнь','июль','август','сентябрь','октябрь','ноябрь','декабрь']
const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function currentMonthDate(lang: Lang): string {
  const now = new Date()
  const m = now.getMonth()
  const y = now.getFullYear()
  if (lang === 'ru') return `${RU_MONTHS[m]} ${y} г.`
  if (lang === 'en') return `${EN_MONTHS[m]} ${y}`
  return `${y}-${UZ_MONTHS[m]}`
}

export default function Comparison() {
  const { t, lang } = useLang()
  const note = t.comparison.note.replace('{date}', currentMonthDate(lang))

  return (
    <section id="comparison" className="bg-[#0E1530] py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{t.comparison.title}</h2>
          <p className="text-slate-400 mt-3 text-base">{t.comparison.subtitle}</p>
        </div>

        <div className="overflow-x-auto rounded-2xl glass shadow-[0_0_40px_rgba(36,212,244,0.15)]">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[rgba(36,212,244,0.15)]">
                <th className="text-left py-4 px-6 text-slate-400 font-semibold text-sm">
                  {t.comparison.featureLabel}
                </th>
                <th className="py-4 px-6 text-center font-bold text-base bg-[#24D4F4]/10 text-[#24D4F4]">
                  RAOS
                </th>
                <th className="py-4 px-6 text-center font-semibold text-sm text-slate-300">{t.comparison.competitorA ?? 'Tizim A'}</th>
                <th className="py-4 px-6 text-center font-semibold text-sm text-slate-300">{t.comparison.competitorB ?? 'Tizim B'}</th>
              </tr>
            </thead>
            <tbody>
              {t.comparison.rows.map((row, idx) => (
                <ComparisonRow
                  key={idx}
                  row={row}
                  isLast={idx === t.comparison.rows.length - 1}
                />
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-center text-slate-500 text-xs mt-4">{note}</p>

        <div className="text-center mt-8">
          <a
            href="#register"
            className="inline-flex items-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold px-8 py-3.5 rounded-xl hover:bg-[#0FA8C8] hover:scale-105 transition-all text-sm"
          >
            {(t.comparison as Record<string, unknown>).cta as string ?? "Bepul sinab ko'ring →"}
          </a>
        </div>
      </div>
    </section>
  )
}

function ComparisonRow({ row, isLast }: { row: CompRow; isLast: boolean }) {
  return (
    <tr className={isLast ? '' : 'border-b border-[rgba(36,212,244,0.08)]'}>
      <td className="py-4 px-6 text-slate-300 text-sm font-medium">{row.feature}</td>
      <td className="py-4 px-6 text-center bg-[#24D4F4]/5">
        <CellValue value={row.raos} />
      </td>
      <td className="py-4 px-6 text-center">
        <CellValue value={row.billz} />
      </td>
      <td className="py-4 px-6 text-center">
        <CellValue value={row.yespos} />
      </td>
    </tr>
  )
}

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <span className="text-emerald-400 text-lg font-bold">✓</span>
    ) : (
      <span className="text-red-400 text-lg font-bold">✗</span>
    )
  }
  return <span className="text-white text-sm">{value}</span>
}
