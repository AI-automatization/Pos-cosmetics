'use client'

import { useEffect, useRef, useState } from 'react'
import { Play, Clock, ArrowRight } from 'lucide-react'
import { useLang } from '@/i18n/LangContext'
import VideoModal from '@/components/VideoModal'

const VIDEO_IDS: Record<number, string | null> = {
  0: null,
  1: null,
  2: null,
}

const DEMO_SRCS: Record<number, string | null> = {
  0: '/demos/demo-1.html',
  1: null,
  2: null,
}

export default function TutorialsPreview() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t } = useLang()
  const tr = t.tutorials
  const [modal, setModal] = useState<{ title: string; videoId: string | null; src?: string | null } | null>(null)

  const preview = tr.items.filter((item) => item.free).slice(0, 3)

  useEffect(() => {
    const elements = sectionRef.current?.querySelectorAll('.fade-up, .slide-left, .slide-right')
    if (!elements) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          } else {
            entry.target.classList.remove('visible')
          }
        })
      },
      { threshold: 0.1 },
    )
    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} className="bg-[#0E1530] py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Sarlavha */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
          <div className="fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">{tr.pageTitle}</h2>
            <p className="text-slate-400 mt-3 text-base">{tr.pageSubtitle}</p>
          </div>
          <a
            href="/tutorials"
            className="slide-right inline-flex items-center gap-2 text-[#24D4F4] font-semibold text-sm hover:gap-3 transition-all shrink-0"
            style={{ animationDelay: '0.2s' }}
          >
            {tr.all} <ArrowRight size={16} />
          </a>
        </div>

        {/* 3 ta bepul darslik */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          {preview.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setModal({ title: item.title, videoId: VIDEO_IDS[idx] ?? null, src: DEMO_SRCS[idx] ?? null })}
              className="fade-up glass rounded-2xl overflow-hidden group hover:border-[#24D4F4]/40 hover:shadow-[0_0_24px_rgba(36,212,244,0.12)] transition-all duration-300 text-left"
              style={{ animationDelay: `${0.1 + idx * 0.15}s` }}
            >
              {/* Thumbnail */}
              <div className="relative bg-gradient-to-br from-[#0d2240] via-[#112F4B] to-[#0a1228] h-44 flex items-center justify-center overflow-hidden">
                <div
                  className="absolute inset-0 opacity-25"
                  style={{
                    backgroundImage:
                      'radial-gradient(circle at 20% 50%, #24D4F4 0%, transparent 50%), radial-gradient(circle at 80% 20%, #5FEEFB 0%, transparent 40%)',
                  }}
                />
                {/* Top badges */}
                <div className="absolute top-2.5 left-3 right-3 flex justify-between items-center z-10">
                  <span className="bg-[#0E1530]/80 backdrop-blur-sm text-[#24D4F4] text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-[rgba(36,212,244,0.3)]">
                    {item.category}
                  </span>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                    {tr.free}
                  </span>
                </div>
                {/* Play button */}
                <div className="w-14 h-14 rounded-full bg-[#24D4F4]/20 border border-[#24D4F4]/40 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-[0_0_24px_rgba(36,212,244,0.3)] z-10">
                  <Play size={22} className="text-[#24D4F4] fill-[#24D4F4] ml-1" />
                </div>
                {/* Bottom overlay — title + duration */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#0a1228]/95 via-[#0a1228]/60 to-transparent px-3 pt-8 pb-2.5 z-10">
                  <p className="text-white text-xs font-semibold leading-snug line-clamp-2">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-slate-400 text-[10px]">{item.duration} {tr.duration}</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2">
                <h3 className="text-white font-bold text-sm leading-snug group-hover:text-[#24D4F4] transition-colors">
                  {item.title}
                </h3>
                <p className="text-slate-400 text-xs leading-relaxed">{item.description}</p>
                <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                  <Clock size={11} />
                  {item.duration} {tr.duration}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center fade-up" style={{ animationDelay: '0.45s' }}>
          <a
            href="/tutorials"
            className="inline-flex items-center gap-2 border border-[#24D4F4]/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:border-[#24D4F4] hover:bg-[#24D4F4]/5 transition-all text-sm"
          >
            {tr.seeAll} <ArrowRight size={16} />
          </a>
        </div>
      </div>

      {modal && (
        <VideoModal
          title={modal.title}
          videoId={modal.videoId}
          src={modal.src}
          onClose={() => setModal(null)}
        />
      )}
    </section>
  )
}
