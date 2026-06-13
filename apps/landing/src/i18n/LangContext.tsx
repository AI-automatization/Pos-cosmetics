'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { translations, type Lang, type Translations } from './translations'

interface LangContextValue {
  lang: Lang
  setLang: (l: Lang) => void
  t: Translations
}

const LangContext = createContext<LangContextValue>({
  lang: 'uz',
  setLang: () => {},
  t: translations.uz,
})

export function LangProvider({ children, initialLang = 'uz' }: { children: ReactNode; initialLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)

  useEffect(() => {
    // Client-side: check if URL or localStorage has a different preference
    const pathLang = window.location.pathname.match(/^\/(ru|en)(\/|$)/)?.[1] as Lang | null
    const urlLang = pathLang ?? (new URLSearchParams(window.location.search).get('lang') as Lang | null)
    const saved = localStorage.getItem('raos_lang') as Lang | null
    const detected = urlLang && urlLang in translations ? urlLang : null

    // URL lang takes priority, then server-provided initialLang, then saved preference
    if (detected && detected !== lang) {
      setLangState(detected)
    } else if (!detected && saved && saved in translations && saved !== initialLang) {
      // Only use saved preference if we're on the default (uz) path
      // Don't override URL-based language with localStorage
      if (!pathLang) {
        setLangState(saved)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('raos_lang', l)
    document.cookie = `raos_lang=${l}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`

    // Navigate to the proper language URL for SEO
    const currentPath = window.location.pathname
    const basePath = currentPath.replace(/^\/(ru|en)(\/|$)/, '/').replace(/\/$/, '') || '/'

    if (l === 'uz') {
      window.location.href = basePath
    } else {
      window.location.href = `/${l}${basePath === '/' ? '' : basePath}`
    }
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
