'use client'

import { useState } from 'react'
import { ArrowLeft, Clock, List, Play, Lock, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useLang } from '@/i18n/LangContext'
import type { Translations } from '@/i18n/translations'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import VideoModal from '@/components/VideoModal'

type TutorialItem = Translations['tutorials']['items'][number]

const DIFFICULTY_COLOR = {
  easy: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  medium: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  hard: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const DEMO_SRCS: Record<number, string | null> = {
  0: '/demos/demo-1.html',
  1: '/demos/demo-2.html',
  2: '/demos/demo-3.html',
  3: '/demos/demo-4.html',
  4: '/demos/demo-5.html',
  5: '/demos/demo-6.html',
  6: '/demos/demo-7.html',
  7: '/demos/demo-8.html',
  8: '/demos/demo-9.html',
}

export default function TutorialsClient() {
  const { t } = useLang()
  const [modal, setModal] = useState<{ title: string; videoId: string | null; src?: string | null } | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const tr = t.tutorials

  const allCategories = [tr.all, ...tr.categories]
  const isAll = activeCategory === null || !tr.categories.includes(activeCategory)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0E1530] pt-16">

        {/* Hero */}
        <section className="bg-gradient-to-b from-[#112F4B] to-[#0E1530] py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <a
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-[#24D4F4] text-sm transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              {tr.backHome}
            </a>

            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                {tr.pageTitle}
              </h1>
              <p className="text-slate-400 text-lg">{tr.pageSubtitle}</p>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-6 mt-10">
              {[
                { value: tr.items.length, label: tr.all },
                { value: tr.items.filter((i) => i.free).length, label: tr.free },
                { value: tr.categories.length, label: tr.categoriesLabel },
              ].map((stat, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-[#24D4F4] font-bold text-2xl">{stat.value}</span>
                  <span className="text-slate-400 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-10">
              {allCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat === tr.all ? null : cat)}
                  className={clsx(
                    'px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200',
                    (cat === tr.all ? isAll : activeCategory === cat)
                      ? 'bg-[#24D4F4] text-[#0E1530] border-[#24D4F4] shadow-[0_0_16px_rgba(36,212,244,0.3)]'
                      : 'bg-transparent text-slate-400 border-[rgba(36,212,244,0.2)] hover:border-[#24D4F4]/50 hover:text-white',
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Tutorial grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tr.items
                .filter((item) =>
                  isAll ? true : item.category === activeCategory,
                )
                .map((item) => {
                  const globalIdx = tr.items.indexOf(item)
                  const demoSrc = DEMO_SRCS[globalIdx] ?? null
                  return (
                    <TutorialCard
                      key={globalIdx}
                      item={item}
                      tr={tr}
                      idx={globalIdx}
                      demoSrc={demoSrc}
                      onPlay={() => setModal({ title: item.title, videoId: null, src: demoSrc })}
                    />
                  )
                })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#112F4B]">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              {t.cta.title}
            </h2>
            <p className="text-slate-400 mb-8">{t.cta.desc}</p>
            <a
              href="/#register"
              className="inline-flex items-center gap-2 bg-[#24D4F4] text-[#0E1530] font-bold px-8 py-4 rounded-xl hover:bg-[#0FA8C8] transition-colors"
            >
              {t.cta.button}
            </a>
          </div>
        </section>

      </main>
      <Footer />

      {modal && (
        <VideoModal
          title={modal.title}
          videoId={modal.videoId}
          src={modal.src}
          onClose={() => setModal(null)}
        />
      )}
    </>
  )
}

function TutorialCard({
  item,
  tr,
  idx,
  demoSrc,
  onPlay,
}: {
  item: TutorialItem
  tr: Translations['tutorials']
  idx: number
  demoSrc: string | null
  onPlay: () => void
}) {
  return (
    <div className="glass rounded-2xl overflow-hidden flex flex-col group hover:border-[#24D4F4]/40 hover:shadow-[0_0_24px_rgba(36,212,244,0.12)] transition-all duration-300">

      {/* Thumbnail */}
      <div
        className="relative h-44 flex items-center justify-center overflow-hidden cursor-pointer bg-[#0a1228]"
        onClick={item.free ? onPlay : undefined}
      >
        {demoSrc ? (
          /* iframe preview — scaled down, dimmed */
          <div className="absolute inset-0 overflow-hidden">
            <iframe
              src={demoSrc}
              className="absolute top-0 left-0 border-0 pointer-events-none"
              style={{ width: 900, height: 520, transform: 'scale(0.6)', transformOrigin: 'top left' }}
              tabIndex={-1}
              aria-hidden="true"
            />
          </div>
        ) : (
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 50%, #24D4F4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #5FEEFB 0%, transparent 40%)',
            }}
          />
        )}

        {/* Dark dimming overlay */}
        <div className="absolute inset-0 bg-[#0a1228]/65 backdrop-blur-[1px]" />

        {/* Step number */}
        <div className="absolute top-3 left-3 w-7 h-7 rounded-full bg-[#24D4F4]/10 border border-[#24D4F4]/30 flex items-center justify-center z-10">
          <span className="text-[#24D4F4] text-xs font-bold">{idx + 1}</span>
        </div>

        {/* Free / Lock badge */}
        {item.free ? (
          <div className="absolute top-3 right-3 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/30 z-10">
            {tr.free}
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-slate-700/60 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 z-10">
            <Lock size={9} />
            Pro
          </div>
        )}

        {/* Play button */}
        <div className="w-14 h-14 rounded-full bg-[#24D4F4]/20 border border-[#24D4F4]/40 flex items-center justify-center group-hover:bg-[#24D4F4]/30 group-hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(36,212,244,0.2)] z-10">
          <Play size={22} className="text-[#24D4F4] fill-[#24D4F4] ml-1" />
        </div>

        {/* Category pill */}
        <div className="absolute bottom-3 left-3 bg-[#0E1530]/70 backdrop-blur-sm text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-[rgba(36,212,244,0.15)] z-10">
          {item.category}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-3 p-5 flex-1">
        <h3 className="text-white font-bold text-base leading-snug group-hover:text-[#24D4F4] transition-colors">
          {item.title}
        </h3>
        <p className="text-slate-400 text-sm leading-relaxed flex-1">{item.description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock size={12} />
            {item.duration} {tr.duration}
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <List size={12} />
            {item.steps} {tr.steps}
          </span>
          <span
            className={clsx(
              'ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full border',
              DIFFICULTY_COLOR[item.difficulty],
            )}
          >
            {tr.difficulty[item.difficulty]}
          </span>
        </div>

        {/* Watch button */}
        <button
          onClick={item.free ? onPlay : undefined}
          className={clsx(
            'mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-colors',
            item.free
              ? 'bg-[#24D4F4]/10 text-[#24D4F4] border border-[#24D4F4]/30 hover:bg-[#24D4F4]/20'
              : 'bg-slate-700/40 text-slate-500 border border-slate-600/40 cursor-not-allowed',
          )}
          disabled={!item.free}
        >
          {item.free ? (
            <>
              <Play size={14} className="fill-[#24D4F4]" />
              {tr.watch}
              <ChevronRight size={14} />
            </>
          ) : (
            <>
              <Lock size={14} />
              Pro
            </>
          )}
        </button>
      </div>
    </div>
  )
}
