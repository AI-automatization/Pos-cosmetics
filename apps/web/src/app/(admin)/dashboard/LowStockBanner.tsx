'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowDownToLine } from 'lucide-react';
import { useTranslation } from '@/i18n/i18n-context';

interface LowStockBannerProps {
  count: number;
}

export function LowStockBanner({ count }: LowStockBannerProps) {
  const { t } = useTranslation();
  if (count === 0) return null;
  return (
    <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3">
      <div className="flex items-center gap-2 text-sm text-yellow-800">
        <AlertTriangle className="h-4 w-4 text-yellow-500" />
        <span>
          <span className="font-semibold">{count} {t('common.unit')}</span>{' '}
          {t('dashboard.lowStockBannerText')}
        </span>
      </div>
      <Link
        href="/inventory/low-stock"
        className="flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-700"
      >
        <ArrowDownToLine className="h-3.5 w-3.5" />
        {t('warehouse.stockIn')}
      </Link>
    </div>
  );
}
