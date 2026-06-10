'use client'

import { Mail, Phone } from 'lucide-react'
import { useLang } from '@/i18n/LangContext'

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.96 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  )
}

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
              </ul>
            </div>
            <div>
              <p className="text-white font-semibold text-sm mb-3">{f.help}</p>
              <ul className="flex flex-col gap-2">
                <li>
                  <a href="#faq" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {t.nav.faq}
                  </a>
                </li>
                <li>
                  <a href="/tutorials" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
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
                  <a href="/privacy" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
                    {f.privacy}
                  </a>
                </li>
                <li>
                  <a href="/terms" className="text-slate-400 hover:text-[#24D4F4] text-sm transition-colors">
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
                  <span className="text-[#24D4F4]"><TelegramIcon /></span>
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
                  <span className="text-[#24D4F4]"><InstagramIcon /></span>
                  @raos.uz
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@raos.uz"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <Mail size={14} className="text-[#24D4F4] shrink-0" />
                  info@raos.uz
                </a>
              </li>
              <li>
                <a
                  href="tel:+998917776609"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <Phone size={14} className="text-[#24D4F4] shrink-0" />
                  +998 91 777 66 09
                </a>
              </li>
              <li>
                <a
                  href="tel:+998993151516"
                  className="flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors"
                >
                  <Phone size={14} className="text-[#24D4F4] shrink-0" />
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
