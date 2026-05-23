'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/i18n/i18n-context';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      {/* Brand mark — preserves identity on 404 screens */}
      <div className="inline-flex h-14 w-14 overflow-hidden rounded-2xl shadow-md shadow-raos-cyan/30 ring-1 ring-raos-cyan/20">
        <Image src="/icon.png" alt="RAOS" width={56} height={56} priority />
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-10 shadow-sm">
        <p className="text-7xl font-black text-gray-200">404</p>
        <h1 className="mt-4 text-xl font-semibold text-gray-900">
          {t('errors.pageNotFound')}
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          {t('errors.pageNotFoundDesc')}
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center rounded-lg bg-raos-cyan px-5 py-2.5 text-sm font-semibold text-raos-bg-deep shadow-md shadow-raos-cyan/30 hover:bg-raos-cyan-light transition"
        >
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  );
}
