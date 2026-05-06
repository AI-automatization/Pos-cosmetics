'use client';

import { useState, useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useTopProducts } from '@/hooks/reports/useReports';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function TopProductsPage() {
  const { t } = useTranslation();
  const [range, setRange] = useState(getDefaultRange);
  const [tablePage, setTablePage] = useState(1);
  const PAGE_SIZE = 10;
  const { data, isLoading, isError } = useTopProducts({ ...range, limit: 100 });

  const maxRevenue = data?.[0]?.revenue ?? 1;
  const totalPages = Math.ceil((data?.length ?? 0) / PAGE_SIZE);
  const paged = useMemo(() => data?.slice((tablePage - 1) * PAGE_SIZE, tablePage * PAGE_SIZE) ?? [], [data, tablePage]);

  return (
    <div className="flex flex-col gap-6 h-full overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/reports" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('nav.topProducts')}</h1>
          <p className="text-sm text-gray-500">{t('reports.topProductsSubtitle')}</p>
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">{t('reports.from')}</label>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">{t('reports.to')}</label>
          <input
            type="date"
            value={range.to}
            min={range.from}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="ml-auto flex gap-2">
          {[
            { key: 'reports.days7', days: 7 },
            { key: 'reports.days30', days: 30 },
            { key: 'reports.days90', days: 90 },
          ].map(({ key, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(from.getDate() - (days - 1));
                setRange({
                  from: from.toISOString().slice(0, 10),
                  to: to.toISOString().slice(0, 10),
                });
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={8} />
      ) : isError ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Backend API (T-024) hali tayyor emas
        </div>
      ) : !data || data.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-400">
          {t('reports.noData')}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="overflow-y-auto max-h-[calc(100vh-380px)]">
            <table className="w-full text-sm">
              <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-8 px-4 py-3 text-left font-medium text-gray-500">#</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">{t('reports.product')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('reports.sold')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('reports.orders')}</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">{t('reports.revenue')}</th>
                  <th className="w-40 px-4 py-3 font-medium text-gray-600" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paged.map((p, idx) => {
                  const barWidth = Math.round((p.revenue / maxRevenue) * 100);
                  const globalIdx = (tablePage - 1) * PAGE_SIZE + idx;
                  return (
                    <tr key={p.productId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-center text-xs font-medium text-gray-400">
                        {globalIdx + 1}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {p.productName}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-700">
                        {p.quantity} ta
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                        {p.ordersCount}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                        {formatPrice(p.revenue)}
                      </td>
                      {/* Mini bar */}
                      <td className="px-4 py-3">
                        <div className="h-2 w-full rounded-full bg-gray-100">
                          <div
                            className="h-2 rounded-full bg-blue-400"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-4 py-2">
            <p className="text-xs text-gray-500">{t('reports.totalProducts', { count: data?.length ?? 0 })}</p>
            <div className="flex items-center gap-1">
              <button type="button" onClick={() => setTablePage(p => Math.max(1, p - 1))} disabled={tablePage === 1} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40">{t('reports.prev')}</button>
              <span className="px-2 text-xs text-gray-500">{tablePage} / {Math.max(1, totalPages)}</span>
              <button type="button" onClick={() => setTablePage(p => Math.min(totalPages, p + 1))} disabled={tablePage >= totalPages} className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 disabled:opacity-40">{t('reports.next')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
