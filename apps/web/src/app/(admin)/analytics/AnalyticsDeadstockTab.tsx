'use client';

import { useState } from 'react';
import { Search, Package, AlertTriangle } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useTranslation } from '@/i18n/i18n-context';

interface DeadStockItem {
  productId: string;
  productName: string;
  sku?: string | null;
  totalStock: number | string;
  lastSoldAt?: string | null;
  daysIdle: number;
  carryingCost: number;
}

interface Props {
  deadStock: DeadStockItem[];
  isLoading: boolean;
}

export function AnalyticsDeadstockTab({ deadStock, isLoading }: Props) {
  const { t } = useTranslation();
  const [deadstockSearch, setDeadstockSearch] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{t('analytics.deadstockTitle')}</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={deadstockSearch}
            onChange={(e) => setDeadstockSearch(e.target.value)}
            placeholder="Qidirish..."
            className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition w-48"
          />
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : deadStock.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <Package className="h-8 w-8 text-emerald-400" />
          </div>
          <p className="text-sm font-semibold text-emerald-600">{t('analytics.allProductsActive')}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-3.5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {t('analytics.deadstockAlert', { count: deadStock.length })}
              </p>
              <p className="text-xs text-amber-600">
                Umumiy zarar: {formatPrice(deadStock.reduce((s, d) => s + d.carryingCost, 0))}
              </p>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr>
                  {[
                    { key: 'product', label: t('analytics.colProduct') },
                    { key: 'sku', label: t('analytics.colSku') },
                    { key: 'stock', label: t('analytics.colStock') },
                    { key: 'lastSale', label: t('analytics.colLastSale') },
                    { key: 'idleDays', label: t('analytics.colIdleDays') },
                    { key: 'loss', label: t('analytics.colLoss') },
                  ].map((h) => (
                    <th key={h.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deadStock
                  .filter((d) =>
                    !deadstockSearch || d.productName.toLowerCase().includes(deadstockSearch.toLowerCase())
                  )
                  .map((d) => (
                    <tr key={d.productId} className="transition hover:bg-gray-50/80">
                      <td className="px-4 py-3 font-medium text-gray-900">{d.productName}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-400">{d.sku ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-600">{Number(d.totalStock).toFixed(0)}</td>
                      <td className="px-4 py-3 text-xs text-gray-400">
                        {d.lastSoldAt ? new Date(d.lastSoldAt).toLocaleDateString('uz-UZ') : 'Hech qachon'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                            d.daysIdle >= 180 ? 'bg-red-50 text-red-600'
                              : d.daysIdle >= 90 ? 'bg-amber-50 text-amber-600'
                              : 'bg-gray-100 text-gray-600',
                          )}
                        >
                          {d.daysIdle} kun
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-red-600">{formatPrice(d.carryingCost)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
