'use client'

import { useEffect, useState } from 'react'

export default function StickyMobileCTA() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const heroBottom = document.getElementById('main-content')?.getBoundingClientRect().top ?? 0
      const registerTop = document.getElementById('register')?.getBoundingClientRect().top ?? Infinity
      setVisible(heroBottom < -400 && registerTop > 500)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-[#0E1530]/95 backdrop-blur-md border-t border-[rgba(36,212,244,0.2)]">
      <a
        href="#register"
        className="flex items-center justify-center w-full bg-[#24D4F4] text-[#0E1530] font-bold py-3.5 rounded-xl text-sm"
      >
        Bepul boshlash →
      </a>
    </div>
  )
}
