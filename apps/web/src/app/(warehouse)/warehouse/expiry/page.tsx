'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw, CalendarX, Search, ChevronUp, ChevronDown } from 'lucide-react';
import { useWarehouseAlerts } from '@/hooks/warehouse/useWarehouseInvoices';
import { cn } from '@/lib/utils';

const PAGE_SIZE = 15;

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ExpiryPage() {
  const { data, isLoading, refetch } = useWarehouseAlerts();
  const [search, setSearch] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  const alerts = data?.alerts ?? [];

  const searchFiltered = alerts.filter((a) =>
    !search || (a.product?.name ?? a.productId).toLowerCase().includes(search.toLowerCase()),
  );

  const expiredItems = searchFiltered
    .filter((a) => daysUntil(a.expiryDate) < 0)
    .sort((a, b) => {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      return sortDir === 'asc' ? diff : -diff;
    });

  const soonItems = searchFiltered
    .filter((a) => {
      const d = daysUntil(a.expiryDate);
      return d >= 0 && d <= 30;
    })
    .sort((a, b) => {
      const diff = new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
      return sortDir === 'asc' ? diff : -diff;
    });

  const allItems = [...expiredItems, ...soonItems];
  const totalPages = Math.ceil(allItems.length / PAGE_SIZE);
  const pageItems = allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageExpired = pageItems.filter((a) => daysUntil(a.expiryDate) < 0);
  const pageSoon = pageItems.filter((a) => {
    const d = daysUntil(a.expiryDate);
    return d >= 0 && d <= 30;
  });

  useEffect(() => { setPage(1); }, [search, sortDir]);

  return (
    <div className="p-6 space-y-5">
      {/* Sarlavha */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Muddati o&apos;tayotgan tovarlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Muddati o&apos;tgan yoki yaqin tovarlar</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            title="Sana bo'yicha saralash"
          >
            {sortDir === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Sana
          </button>
          <button
            onClick={() => void refetch()}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <RefreshCw className="h-4 w-4" />
            Yangilash
          </button>
        </div>
      </div>

      {/* Qidirish */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Mahsulot nomi..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Umumiy holat */}
      {!isLoading && (
        <div className="flex gap-3 flex-wrap">
          {(data?.expired ?? 0) > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm">
              <CalendarX className="h-4 w-4 text-red-500" />
              <span className="text-red-700 font-medium">{data!.expired} ta mahsulot muddati o&apos;tib ketgan!</span>
            </div>
          )}
          {(data?.soonExpiring ?? 0) > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm">
              <Clock className="h-4 w-4 text-orange-500" />
              <span className="text-orange-700 font-medium">{data!.soonExpiring} ta mahsulot 30 kun ichida muddati tugaydi</span>
            </div>
          )}
          {(data?.expired ?? 0) === 0 && (data?.soonExpiring ?? 0) === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm">
              <span className="text-green-700 font-medium">Muddati o&apos;tayotgan tovar yo&apos;q ✓</span>
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      ) : allItems.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-2 text-gray-400">
          <AlertTriangle className="h-10 w-10 text-gray-300" />
          <p className="text-sm">
            {search ? "Qidiruv bo'yicha hech narsa topilmadi" : "Muddati o'tayotgan tovar yo'q"}
          </p>
        </div>
      ) : (
        <>
          {/* Muddati o'tib ketganlar */}
          {pageExpired.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-red-100 bg-red-50">
                <CalendarX className="h-4 w-4 text-red-600" />
                <h2 className="text-sm font-semibold text-red-800">Muddati o&apos;tib ketgan ({expiredItems.length} ta)</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Mahsulot</th>
                    <th className="px-4 py-3 text-left">Partiya №</th>
                    <th className="px-4 py-3 text-left">Muddati</th>
                    <th className="px-4 py-3 text-right">Qancha kechikdi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageExpired.map((item, idx) => {
                    const days = daysUntil(item.expiryDate);
                    return (
                      <tr key={idx} className="hover:bg-red-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.product?.name ?? item.productId}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.batchNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-red-600 font-medium">
                          {new Date(item.expiryDate).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">
                            {Math.abs(days)} kun
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Tez orada muddati tugaydigan */}
          {pageSoon.length > 0 && (
            <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-orange-100 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <h2 className="text-sm font-semibold text-orange-800">30 kun ichida muddati tugaydi ({soonItems.length} ta)</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Mahsulot</th>
                    <th className="px-4 py-3 text-left">Partiya №</th>
                    <th className="px-4 py-3 text-left">Muddati</th>
                    <th className="px-4 py-3 text-right">Qancha qoldi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageSoon.map((item, idx) => {
                    const days = daysUntil(item.expiryDate);
                    return (
                      <tr key={idx} className={cn('hover:bg-orange-50 transition-colors', days <= 7 && 'bg-orange-50/50')}>
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {item.product?.name ?? item.productId}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.batchNumber ?? '—'}</td>
                        <td className="px-4 py-3 text-orange-600 font-medium">
                          {new Date(item.expiryDate).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                              days <= 7 ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700',
                            )}
                          >
                            {days} kun
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500 bg-white border border-gray-200 rounded-xl px-4 py-3">
              <span>{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, allItems.length)} / {allItems.length} ta</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >‹</button>
                <span className="px-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >›</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
