'use client'

import { useState } from 'react'
import { Send, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { useLang } from '@/i18n/LangContext'

interface FormData {
  shopType: string
  shopName: string
  branches: number
  fullName: string
  phone: string
  telegram: string
}

const INPUT_CLASS =
  'w-full bg-[#112F4B] border border-[rgba(36,212,244,0.2)] text-white placeholder-slate-500 focus:border-[#24D4F4] focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors'

export default function RegistrationForm() {
  const { t } = useLang()
  const r = t.register

  const [form, setForm] = useState<FormData>({
    shopType: '',
    shopName: '',
    branches: 1,
    fullName: '',
    phone: '',
    telegram: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(false)
  const [website, setWebsite] = useState('') // honeypot
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({})

  const validate = () => {
    const newErrors: Partial<Record<keyof FormData, string>> = {}
    if (!form.shopName.trim()) newErrors.shopName = r.errors.shopName
    if (!form.fullName.trim()) newErrors.fullName = r.errors.fullName
    if (!form.phone.trim()) {
      newErrors.phone = r.errors.phoneRequired
    } else if (!/^\+998\d{9}$/.test(form.phone.replace(/\s/g, ''))) {
      newErrors.phone = r.errors.phoneFormat
    }
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setLoading(true)
    setSubmitError(false)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website }),
      })
      if (res.ok) setSubmitted(true)
      else setSubmitError(true)
    } catch {
      setSubmitError(true)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  if (submitted) {
    return (
      <section id="register" className="bg-[#0E1530] py-20">
        <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="glass rounded-2xl p-10 flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <span className="text-emerald-400 text-3xl">✓</span>
            </div>
            <h3 className="text-white font-bold text-2xl">{r.successTitle}</h3>
            <p className="text-slate-400 text-base">{r.successDesc}</p>
            <div className="flex flex-col gap-2 text-left w-full mt-2">
              {r.successSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-3 text-slate-300 text-sm">
                  <span className="w-6 h-6 rounded-full bg-[#24D4F4]/15 text-[#24D4F4] text-xs font-bold flex items-center justify-center shrink-0">{idx + 1}</span>
                  {step}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm mt-2">
              Telegram: <a href="https://t.me/raos_support" className="text-[#24D4F4] hover:underline">@raos_support</a>
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="register" className="bg-[#0E1530] py-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">{r.title}</h2>
          <p className="text-slate-400 mt-3 text-base">{r.subtitle}</p>
        </div>

        <div className="glass rounded-2xl p-8">
          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Honeypot: скрыт от людей, боты заполняют */}
            <input
              type="text"
              name="website"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            {/* Do'kon turi */}
            <div>
              <label htmlFor="shopType" className="block text-sm font-medium text-slate-300 mb-2">
                {r.shopTypeLabel}
              </label>
              <select
                id="shopType"
                name="shopType"
                value={form.shopType}
                onChange={(e) => handleChange('shopType', e.target.value)}
                className={clsx(INPUT_CLASS, 'appearance-none')}
              >
                <option value="">{r.shopTypePlaceholder}</option>
                {r.shopTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            {/* Do'kon nomi */}
            <div>
              <label htmlFor="shopName" className="block text-sm font-medium text-slate-300 mb-2">
                {r.shopNameLabel} <span className="text-[#24D4F4]">*</span>
              </label>
              <input
                id="shopName"
                name="shopName"
                type="text"
                value={form.shopName}
                onChange={(e) => handleChange('shopName', e.target.value)}
                placeholder={r.shopNamePlaceholder}
                maxLength={100}
                autoComplete="organization"
                className={clsx(INPUT_CLASS, errors.shopName && 'border-red-500/60')}
              />
              {errors.shopName && (
                <p className="text-red-400 text-xs mt-1">{errors.shopName}</p>
              )}
            </div>

            {/* Filiallar soni */}
            <div>
              <label htmlFor="branches" className="block text-sm font-medium text-slate-300 mb-2">
                {r.branchesLabel}
              </label>
              <input
                id="branches"
                name="branches"
                type="number"
                min={1}
                max={100}
                value={form.branches}
                onChange={(e) => handleChange('branches', Number(e.target.value))}
                className={INPUT_CLASS}
              />
            </div>

            {/* Ism */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-2">
                {r.fullNameLabel} <span className="text-[#24D4F4]">*</span>
              </label>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange('fullName', e.target.value)}
                placeholder={r.fullNamePlaceholder}
                maxLength={80}
                autoComplete="name"
                className={clsx(INPUT_CLASS, errors.fullName && 'border-red-500/60')}
              />
              {errors.fullName && (
                <p className="text-red-400 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            {/* Telefon */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                {r.phoneLabel} <span className="text-[#24D4F4]">*</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+998 90 123 45 67"
                maxLength={17}
                autoComplete="tel"
                className={clsx(INPUT_CLASS, errors.phone && 'border-red-500/60')}
              />
              {errors.phone && (
                <p className="text-red-400 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Telegram */}
            <div>
              <label htmlFor="telegram" className="block text-sm font-medium text-slate-300 mb-2">
                {r.telegramLabel}{' '}
                <span className="text-slate-500 text-xs font-normal">{r.optional}</span>
              </label>
              <input
                id="telegram"
                name="telegram"
                type="text"
                value={form.telegram}
                onChange={(e) => handleChange('telegram', e.target.value)}
                placeholder="@username"
                maxLength={40}
                className={INPUT_CLASS}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold py-4 rounded-xl hover:bg-[#0FA8C8] hover:scale-[1.02] transition-all text-base disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? r.submitting : r.submit}
            </button>

            <p className="text-center text-emerald-400/70 text-xs">
              {r.guarantee}
            </p>

            {submitError && (
              <p role="alert" className="text-red-400 text-sm text-center">
                {r.errors.submitFailed}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  )
}
