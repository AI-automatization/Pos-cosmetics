'use client'

import { useEffect } from 'react'
import { X } from 'lucide-react'

interface Props {
  title: string
  videoId: string | null
  src?: string | null
  onClose: () => void
}

export default function VideoModal({ title, videoId, src, onClose }: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full max-w-3xl bg-[#0E1530] border border-[rgba(36,212,244,0.2)] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(36,212,244,0.15)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[rgba(36,212,244,0.1)]">
          <h3 className="text-white font-bold text-base">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video */}
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          {videoId ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : src ? (
            <iframe
              className="absolute inset-0 w-full h-full"
              src={src}
              title={title}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#112F4B]">
              <div className="w-16 h-16 rounded-full bg-[#24D4F4]/10 border border-[#24D4F4]/30 flex items-center justify-center">
                <span className="text-[#24D4F4] text-3xl">🎬</span>
              </div>
              <p className="text-slate-400 text-sm">Video tez orada qo&apos;shiladi</p>
              <p className="text-slate-600 text-xs">Coming soon</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
