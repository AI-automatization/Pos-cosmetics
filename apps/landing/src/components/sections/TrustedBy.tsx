'use client'

import { useLang } from '@/i18n/LangContext'

const CLIENTS = [
  { name: 'Beauty House', city: 'Toshkent' },
  { name: 'Parfum Palace', city: 'Samarqand' },
  { name: 'Style Boutique', city: 'Namangan' },
  { name: 'Fresh Market', city: 'Toshkent' },
  { name: 'Optika Plus', city: 'Andijon' },
  { name: 'Auto Parts UZ', city: "Farg'ona" },
  { name: 'Phone City', city: 'Buxoro' },
  { name: 'Elegant Dress', city: 'Toshkent' },
]

const LABEL: Record<string, string> = {
  uz: "Bizga ishonishadi",
  ru: "Нам доверяют",
  en: "Trusted by businesses",
}

export default function TrustedBy() {
  const { lang } = useLang()

  return (
    <section className="bg-[#0E1530] py-12 border-t border-b border-[rgba(36,212,244,0.08)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-slate-500 text-sm font-medium uppercase tracking-wider mb-8">
          {LABEL[lang]}
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-4">
          {CLIENTS.map((client) => (
            <div
              key={client.name}
              className="flex items-center gap-2 text-slate-400 hover:text-slate-300 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#112F4B] border border-[rgba(36,212,244,0.15)] flex items-center justify-center text-[#24D4F4] text-xs font-bold shrink-0">
                {client.name[0]}
              </div>
              <div>
                <p className="text-sm font-medium leading-tight">{client.name}</p>
                <p className="text-xs text-slate-500">{client.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
