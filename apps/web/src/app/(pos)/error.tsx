'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/i18n/i18n-context';

export default function PosError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const { t } = useTranslation();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center gap-4 bg-raos-bg-deep p-8 text-center">
      {/* Brand mark — keeps cashier oriented on dark POS error screen */}
      <div className="inline-flex h-12 w-12 overflow-hidden rounded-2xl shadow-lg shadow-raos-cyan/30 ring-1 ring-raos-cyan/30">
        <Image src="/icon.png" alt="RAOS" width={48} height={48} priority />
      </div>
      <div className="rounded-full bg-red-900/30 p-4">
        <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h2 className="text-lg font-semibold text-white">{t('common.error')}</h2>
      <p className="max-w-sm text-sm text-gray-400">{error.message || t('pos.unexpectedError')}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-raos-cyan px-4 py-2 text-sm font-semibold text-raos-bg-deep shadow-lg shadow-raos-cyan/30 hover:bg-raos-cyan-light transition"
      >
        {t('common.retry')}
      </button>
    </div>
  );
}
