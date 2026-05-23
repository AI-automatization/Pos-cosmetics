'use client';

import { useEffect } from 'react';
import Image from 'next/image';

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      {/* Brand mark — anchors user to RAOS even when admin shell crashes */}
      <div className="inline-flex h-12 w-12 overflow-hidden rounded-2xl shadow-md shadow-raos-cyan/30 ring-1 ring-raos-cyan/20">
        <Image src="/icon.png" alt="RAOS" width={48} height={48} priority />
      </div>
      <div className="rounded-full bg-red-100 p-4">
        <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-gray-900">Xatolik yuz berdi</h2>
      <p className="max-w-sm text-sm text-gray-500">{error.message || 'Kutilmagan xatolik yuz berdi.'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-raos-cyan px-4 py-2 text-sm font-semibold text-raos-bg-deep shadow-md shadow-raos-cyan/30 hover:bg-raos-cyan-light transition"
      >
        Qayta urinish
      </button>
    </div>
  );
}
