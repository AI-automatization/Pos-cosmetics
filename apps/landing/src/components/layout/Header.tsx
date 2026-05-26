'use client'

import { useState, useEffect, useRef } from 'react'
import { Menu, X, ChevronDown, Globe } from 'lucide-react'
import { clsx } from 'clsx'
import { useLang } from '@/i18n/LangContext'
import type { Lang } from '@/i18n/translations'

const LANGS: { value: Lang; label: string }[] = [
  { value: 'uz', label: 'UZ' },
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
]

function LangDropdown({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGS.find((l) => l.value === lang)!
  const isSmall = size === 'sm'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          'flex items-center gap-1.5 bg-[#112F4B] border border-[rgba(36,212,244,0.2)] text-[#24D4F4] font-bold uppercase rounded-lg transition-all hover:border-[#24D4F4]/60 hover:bg-[#1a3f60]',
          isSmall ? 'px-2 py-1 text-[10px] gap-1' : 'px-3 py-1.5 text-xs',
        )}
      >
        <Globe size={isSmall ? 10 : 12} className="shrink-0" />
        {current.label}
        <ChevronDown
          size={isSmall ? 10 : 12}
          className={clsx('shrink-0 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-20 rounded-xl bg-[#0E1530] border border-[rgba(36,212,244,0.2)] shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden z-50">
          {LANGS.map((l) => (
            <button
              key={l.value}
              onClick={() => { setLang(l.value); setOpen(false) }}
              className={clsx(
                'w-full flex items-center gap-2 px-3 py-2 text-xs font-bold uppercase transition-colors',
                lang === l.value
                  ? 'bg-[#24D4F4]/15 text-[#24D4F4]'
                  : 'text-slate-400 hover:bg-[#112F4B] hover:text-white',
              )}
            >
              {lang === l.value && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#24D4F4] shrink-0" />
              )}
              {lang !== l.value && <span className="w-1.5 h-1.5 shrink-0" />}
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: t.nav.features, href: '#features' },
    { label: t.nav.pricing, href: '#pricing' },
    { label: t.nav.comparison, href: '#comparison' },
    { label: t.nav.faq, href: '#faq' },
  ]

  const handleNavClick = () => setMenuOpen(false)

  return (
    <header
      className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-[#0E1530]/95 backdrop-blur-md border-b border-[rgba(36,212,244,0.2)]'
          : 'bg-transparent',
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="text-[#24D4F4] font-bold text-2xl tracking-tight" aria-label="RAOS — POS tizimi">
            RAOS
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-slate-300 hover:text-[#24D4F4] transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop right: login + CTA + lang */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={process.env.NEXT_PUBLIC_LOGIN_URL || 'https://app.raos.uz/login'}
              className="text-slate-300 hover:text-[#24D4F4] transition-colors text-sm font-medium"
            >
              {t.nav.login}
            </a>
            <a
              href="#register"
              className="inline-flex items-center bg-[#24D4F4] text-[#0E1530] font-bold px-5 py-2 rounded-lg hover:bg-[#0FA8C8] transition-colors text-sm"
            >
              {t.nav.cta}
            </a>
            <LangDropdown />
          </div>

          {/* Mobile right: lang + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <LangDropdown size="sm" />
            <button
              className="text-slate-300 hover:text-[#24D4F4] transition-colors p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={t.nav.menu}
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-in nav */}
      <div
        className={clsx(
          'md:hidden overflow-hidden transition-all duration-300 bg-[#0E1530]/98 backdrop-blur-md border-b border-[rgba(36,212,244,0.2)]',
          menuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <nav className="px-4 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleNavClick}
              className="text-slate-300 hover:text-[#24D4F4] transition-colors text-base font-medium py-1"
            >
              {link.label}
            </a>
          ))}
          <a
            href={process.env.NEXT_PUBLIC_LOGIN_URL || 'https://app.raos.uz/login'}
            onClick={handleNavClick}
            className="text-slate-300 hover:text-[#24D4F4] transition-colors text-base font-medium py-1"
          >
            {t.nav.login}
          </a>
          <a
            href="#register"
            onClick={handleNavClick}
            className="inline-flex justify-center items-center bg-[#24D4F4] text-[#0E1530] font-bold px-5 py-2.5 rounded-lg hover:bg-[#0FA8C8] transition-colors mt-2"
          >
            {t.nav.cta}
          </a>
        </nav>
      </div>
    </header>
  )
}
