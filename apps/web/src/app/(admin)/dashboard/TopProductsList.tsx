'use client';

import Link from 'next/link';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

export interface TopProduct {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

interface TopProductsListProps {
  products: TopProduct[];
}

export function TopProductsList({ products }: TopProductsListProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.topProducts')}</h2>
        <Link href="/reports/top-products" className="text-xs text-blue-600 hover:text-blue-700">
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {products.slice(0, 5).map((p, idx) => (
          <div key={p.productId} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-800">{p.productName}</p>
              <p className="text-xs text-gray-400">{p.quantity} {t('common.unit')}</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-gray-700">
              {formatPrice(p.revenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface TopProductsGridProps {
  products: TopProduct[];
}

export function TopProductsGrid({ products }: TopProductsGridProps) {
  const { t } = useTranslation();
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">{t('dashboard.topProductsWeekly')}</h2>
        <Link href="/reports/top-products" className="text-xs text-blue-600 hover:text-blue-700">
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {products.slice(0, 5).map((p, idx) => (
          <div key={p.productId} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-800">{p.productName}</p>
              <p className="text-xs text-gray-400">{p.quantity} {t('common.unit')} · {formatPrice(p.revenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
