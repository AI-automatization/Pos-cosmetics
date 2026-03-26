'use client';

import { useState } from 'react';
import { TrendingDown, Search, AlertTriangle, RefreshCw } from 'lucide-react';
import { useStockLevels } from '@/hooks/warehouse/useWarehouseInvoices';
import { cn } from '@/lib/utils';

export default function LowStockPage() {
  const [search, setSearch] = useState('');

  const { data: items = [], isLoading, refetch } = useStockLevels({ lowStock: true });

  const filtered = search
    ? items.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          (item.sku ?? '').toLowerCase().includes(search.toLowerCase()),
      )
    : items;

  const outCount = filtered.filter((i) => i.totalQty <= 0).length;
  const criticalCount = filtered.filter(
    (i) => i.totalQty > 0 && i.minStockLevel != null && i.totalQty <= i.minStockLevel,
  ).length;

  return (
    <div className="p-6 space-y-5">
      {/* Sarlavha */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kam qolgan tovarlar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Minimal zaxiradan kam yoki tugagan mahsulotlar</p>
        </div>
        <button
          onClick={() => void refetch()}
          className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Yangilash
        </button>
      </div>

      {/* Statistika */}
      {!isLoading && (
        <div className="flex gap-3 flex-wrap">
          {outCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-red-700 font-medium">{outCount} ta mahsulot tugagan</span>
            </div>
          )}
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm">
              <TrendingDown className="h-4 w-4 text-orange-500" />
              <span className="text-orange-700 font-medium">{criticalCount} ta kam qoldi</span>
            </div>
          )}
          {outCount === 0 && criticalCount === 0 && items.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-2 text-sm">
              <span className="text-green-700 font-medium">Barcha tovarlar yetarli ✓</span>
            </div>
          )}
        </div>
      )}

      {/* Qidirish */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Nomi yoki SKU..."
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </div>

      {/* Jadval */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-gray-400">
            <TrendingDown className="h-10 w-10 text-gray-300" />
            <p className="text-sm">
              {search ? "Qidiruv bo'yicha hech narsa topilmadi" : 'Hamma tovarlar yetarli miqdorda ✓'}
            </p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Mahsulot</th>
                <th className="px-4 py-3 text-left">SKU</th>
                <th className="px-4 py-3 text-left">Ombor</th>
                <th className="px-4 py-3 text-right">Min. zaxira</th>
                <th className="px-4 py-3 text-right">Hozirgi miqdor</th>
                <th className="px-4 py-3 text-right">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((item, idx) => {
                const isOut = item.totalQty <= 0;
                const isLow =
                  !isOut &&
                  item.minStockLevel != null &&
                  item.totalQty <= item.minStockLevel;

                return (
                  <tr key={`${item.productId}-${idx}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-3 text-gray-400">{item.sku ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{item.warehouseName}</td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {item.minStockLevel != null ? `${item.minStockLevel} dona` : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold tabular-nums">
                      <span className={cn(isOut ? 'text-red-600' : 'text-orange-600')}>
                        {item.totalQty} dona
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                          isOut ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700',
                        )}
                      >
                        {isOut ? (
                          <><AlertTriangle className="h-3 w-3" /> Tugagan</>
                        ) : (
                          <><TrendingDown className="h-3 w-3" /> Kam qoldi</>
                        )}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
