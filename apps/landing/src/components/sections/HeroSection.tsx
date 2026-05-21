'use client'

import { useLang } from '@/i18n/LangContext'

export default function HeroSection() {
  const { t } = useLang()
  const h = t.hero

  return (
    <section className="relative min-h-screen flex items-center bg-[#0E1530] overflow-hidden pt-16">
      {/* Animated blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="blob-1 absolute -top-32 -right-32 w-[500px] h-[500px] bg-[#24D4F4] rounded-full opacity-[0.06] blur-[80px] pointer-events-none" />
        <div className="blob-2 absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#5FEEFB] rounded-full opacity-[0.05] blur-[80px] pointer-events-none" />
        <div className="blob-1 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#0FA8C8] rounded-full opacity-[0.04] blur-[100px] pointer-events-none" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Chap: Matn */}
          <div className="flex flex-col gap-6">
            {/* Badge */}
            <div className="inline-flex items-center w-fit gap-2 bg-[#24D4F4]/10 border border-[#24D4F4]/30 text-[#24D4F4] text-sm font-semibold px-4 py-2 rounded-full">
              <span>{h.badge}</span>
            </div>

            {/* H1 */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {h.title}{' '}
              <span className="text-shimmer">{h.titleHighlight}</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl font-semibold text-slate-300">{h.subtitle}</p>

            {/* Tavsif */}
            <p className="text-slate-400 text-base leading-relaxed max-w-lg">{h.desc}</p>

            {/* CTA tugmalar */}
            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <a
                href="#register"
                className="inline-flex items-center justify-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold px-8 py-4 rounded-xl text-lg hover:bg-[#0FA8C8] transition-colors animate-pulse hover:animate-none"
              >
                {h.cta1}
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 border border-[#24D4F4]/40 text-white font-semibold px-8 py-4 rounded-xl text-lg hover:border-[#24D4F4] hover:bg-[#24D4F4]/5 transition-all"
              >
                {h.cta2}
              </a>
            </div>

            {/* Social proof */}
            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
              <span className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> {h.proof1}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> {h.proof2}
              </span>
              <span className="flex items-center gap-1">
                <span className="text-emerald-400">✓</span> {h.proof3}
              </span>
            </div>
          </div>

          {/* O'ng: POS Mockup */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Floating AI badge */}
            <div className="hidden sm:flex absolute -top-4 -left-4 z-10 items-center bg-[#24D4F4]/10 border border-[#24D4F4]/40 text-[#24D4F4] text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              {h.mockupAI}
            </div>

            {/* Karta — POS mockup */}
            <div className="animate-float glass glow-cyan rounded-2xl p-6 w-full max-w-sm">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <span className="text-[#24D4F4] font-bold text-lg">RAOS POS</span>
                <span className="flex items-center gap-1.5 text-emerald-400 text-sm font-semibold">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  {h.mockupOffline}
                </span>
              </div>

              {/* Tovar qatorlari */}
              <div className="flex flex-col gap-3 mb-5">
                {[
                  { name: 'Lancome La Vie Est Belle', qty: '1x', price: '320 000' },
                  { name: 'Revlon ColorStay Foundation', qty: '1x', price: '185 000' },
                  { name: "L'Oreal Elvive Shampoo", qty: '1x', price: '96 000' },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between py-2.5 border-b border-[rgba(36,212,244,0.1)]"
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{item.name}</p>
                      <p className="text-slate-400 text-xs">{item.qty}</p>
                    </div>
                    <span className="text-[#24D4F4] text-sm font-semibold">{item.price}</span>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between py-3 border-t border-[rgba(36,212,244,0.2)] mb-4">
                <span className="text-slate-300 font-semibold">{h.mockupTotal}</span>
                <span className="text-white font-bold text-xl">601 000 so&apos;m</span>
              </div>

              {/* To'lash tugmasi */}
              <button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-3 rounded-xl transition-colors text-base">
                {h.mockupPay}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
