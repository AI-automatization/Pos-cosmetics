'use client'

import { useEffect, useRef, useState } from 'react'
import { useLang } from '@/i18n/LangContext'

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false)
  const rafId = useRef(0)
  const { t } = useLang()

  useEffect(() => {
    let ticking = false
    const onScroll = () => {
      if (ticking) return
      ticking = true
      rafId.current = requestAnimationFrame(() => {
        const mainEl = document.getElementById('main-content')
        const registerEl = document.getElementById('register')
        const heroBottom = mainEl?.getBoundingClientRect().top ?? 0
        const registerTop = registerEl?.getBoundingClientRect().top ?? Infinity
        setVisible(heroBottom < -400 && registerTop > 500)
        ticking = false
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId.current)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0E1530]/95 backdrop-blur-md border-t border-[rgba(36,212,244,0.2)]"
      role="complementary"
      aria-label={t.register.stickyCta}
    >
      <a
        href="#register"
        className="flex items-center justify-center w-full bg-[#24D4F4] text-[#0E1530] font-bold py-3.5 rounded-xl text-sm"
      >
        {t.register.stickyCta}
      </a>
    </div>
  )
}
