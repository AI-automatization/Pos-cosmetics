'use client';

import Link from 'next/link';
import { useTranslation } from '@/i18n/i18n-context';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
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
          className="mt-6 inline-flex items-center rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
        >
          {t('errors.goHome')}
        </Link>
      </div>
    </div>
  );
}
