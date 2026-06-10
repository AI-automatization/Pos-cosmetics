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

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('uz')

  useEffect(() => {
    const pathLang = window.location.pathname.match(/^\/(ru|en)(\/|$)/)?.[1] as Lang | null
    const urlLang = pathLang ?? (new URLSearchParams(window.location.search).get('lang') as Lang | null)
    const saved = localStorage.getItem('raos_lang') as Lang | null
    const detected = urlLang && urlLang in translations ? urlLang : saved
    if (detected) setLangState(detected as Lang)
  }, [])

  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('raos_lang', l)
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  )
}

export const useLang = () => useContext(LangContext)
