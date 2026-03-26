'use client';

import { AlertTriangle, Clock, RefreshCw, CalendarX } from 'lucide-react';
import { useWarehouseAlerts } from '@/hooks/warehouse/useWarehouseInvoices';
import { cn } from '@/lib/utils';

function daysUntil(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const exp = new Date(dateStr);
  exp.setHours(0, 0, 0, 0);
  return Math.round((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function ExpiryPage() {
  const { data, isLoading, refetch } = useWarehouseAlerts();

  const alerts = data?.alerts ?? [];
  const expiredItems = alerts.filter((a) => daysUntil(a.expiryDate) < 0);
  const soonItems = alerts.filter((a) => {
    const d = daysUntil(a.expiryDate);
    return d >= 0 && d <= 30;
  });

  return (
    <div className="p-6 space-y-5">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Muddati o'tayotgan tovarlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Muddati o'tgan yoki yaqin tovarlar</p>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </button>
      </div>

      {/* Umumiy holat */}
      {!isLoading && (
        <div className="flex gap-3 flex-wrap">
          {(data?.expired ?? 0) > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm">
              <CalendarX className="h-4 w-4 text-red-500" />
              <span className="text-red-700 font-medium">{data!.expired} ta mahsulot muddati o'tib ketgan!</span>
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
              <span className="text-green-700 font-medium">Muddati o'tayotgan tovar yo'q ✓</span>
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
      ) : alerts.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl py-16 flex flex-col items-center gap-2 text-gray-400">
          <AlertTriangle className="h-10 w-10 text-gray-300" />
          <p className="text-sm">Muddati o'tayotgan tovar yo'q</p>
        </div>
      ) : (
        <>
          {/* Muddati o'tib ketganlar */}
          {expiredItems.length > 0 && (
            <div className="bg-white border border-red-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-red-100 bg-red-50">
                <CalendarX className="h-4 w-4 text-red-600" />
                <h2 className="text-sm font-semibold text-red-800">Muddati o'tib ketgan ({expiredItems.length} ta)</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Mahsulot ID</th>
                    <th className="px-4 py-3 text-left">Partiya</th>
                    <th className="px-4 py-3 text-left">Muddati</th>
                    <th className="px-4 py-3 text-right">Qancha kechikdi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expiredItems.map((item, idx) => {
                    const days = daysUntil(item.expiryDate);
                    return (
                      <tr key={idx} className="hover:bg-red-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">{item.productId.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-gray-500">{item.type ?? '—'}</td>
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
          {soonItems.length > 0 && (
            <div className="bg-white border border-orange-200 rounded-xl overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-orange-100 bg-orange-50">
                <Clock className="h-4 w-4 text-orange-600" />
                <h2 className="text-sm font-semibold text-orange-800">30 kun ichida muddati tugaydi ({soonItems.length} ta)</h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                    <th className="px-4 py-3 text-left">Mahsulot ID</th>
                    <th className="px-4 py-3 text-left">Partiya</th>
                    <th className="px-4 py-3 text-left">Muddati</th>
                    <th className="px-4 py-3 text-right">Qancha qoldi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {soonItems.map((item, idx) => {
                    const days = daysUntil(item.expiryDate);
                    return (
                      <tr key={idx} className={cn('hover:bg-orange-50 transition-colors', days <= 7 && 'bg-orange-50/50')}>
                        <td className="px-4 py-3 font-medium text-gray-900 font-mono text-xs">{item.productId.slice(0, 8)}...</td>
                        <td className="px-4 py-3 text-gray-500">{item.type ?? '—'}</td>
                        <td className="px-4 py-3 text-orange-600 font-medium">
                          {new Date(item.expiryDate).toLocaleDateString('uz-UZ')}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold',
                              days <= 7
                                ? 'bg-red-100 text-red-700'
                                : 'bg-orange-100 text-orange-700',
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
        </>
      )}
    </div>
  );
}
