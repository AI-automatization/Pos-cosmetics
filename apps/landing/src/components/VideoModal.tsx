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
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      {/* Modal */}
      <div
        className="relative w-full h-[92vh] max-w-[98vw] bg-[#0E1530] border border-[rgba(36,212,244,0.2)] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(36,212,244,0.15)] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[rgba(36,212,244,0.1)] shrink-0">
          <h3 className="text-white font-bold text-base">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Video — fills remaining height */}
        <div className="flex-1 min-h-0">
          {videoId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : src ? (
            <iframe
              className="w-full h-full"
              src={src}
              title={title}
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-[#112F4B]">
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
