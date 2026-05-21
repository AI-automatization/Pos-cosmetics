'use client'

import { useLang } from '@/i18n/LangContext'

export default function Footer() {
  const { t } = useLang()
  const f = t.footer

  return (
    <footer className="bg-[#0A0F22] border-t border-[rgba(36,212,244,0.1)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Chap: logo + tagline */}
          <div className="flex flex-col gap-3">
            <span className="text-[#24D4F4] font-bold text-2xl tracking-tight">RAOS</span>
            <p className="text-slate-400 text-sm leading-relaxed">{f.tagline}</p>
            <p className="text-slate-500 text-xs mt-2">{f.madeBy}</p>
            <p className="text-slate-500 text-xs">&copy; {new Date().getFullYear()} {f.rights}</p>
          </div>

          {/* O'rta: Navigatsiya */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-white font-semibold text-sm mb-3">{f.product}</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="#features" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {t.nav.features}
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {t.nav.pricing}
                  </a>
                </li>
                <li>
                  <a href="#comparison" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {t.nav.comparison}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">{f.help}</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="#faq" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {f.tutorials}
                  </a>
                </li>
                <li>
                  <a href="#register" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {f.contactLink}
                  </a>
                </li>
              </ul>
              <p className="text-white font-semibold text-sm mb-3 mt-5">{f.legal}</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="#" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {f.privacy}
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {f.terms}
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* O'ng: Aloqa */}
          <div>
            <p className="text-white font-semibold text-sm mb-3">{f.contact}</p>
            <ul className="flex flex-col gap-3">
              <li>
                <a
                  href="https://t.me/raos_support"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <span className="text-[#24D4F4]">TG</span>
                  @raos_support
                </a>
              </li>
              <li>
                <a
                  href="https://instagram.com/raos.uz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <span className="text-[#24D4F4]">IG</span>
                  @raos.uz
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@raos.uz"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <span className="text-[#24D4F4]">@</span>
                  info@raos.uz
                </a>
              </li>
              <li>
                <a
                  href="tel:+998917776609"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <span className="text-[#24D4F4]">Tel</span>
                  +998 91 777 66 09
                </a>
              </li>
              <li>
                <a
                  href="tel:+998993151516"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <span className="text-[#24D4F4]">Tel</span>
                  +998 99 315 15 16
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
