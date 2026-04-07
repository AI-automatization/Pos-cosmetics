'use client';

import { useState } from 'react';
import { Package, Search, AlertTriangle, TrendingDown } from 'lucide-react';
import { useStockLevels } from '@/hooks/warehouse/useWarehouseInvoices';
import { cn } from '@/lib/utils';

export default function WarehouseInventoryPage() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const { data: items = [], isLoading } = useStockLevels();

  const filtered = items.filter((item) => {
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      (item.sku ?? '').toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'low' && item.totalQty > 0 && item.minStockLevel != null && item.totalQty <= item.minStockLevel) ||
      (filter === 'out' && item.totalQty <= 0);

    return matchSearch && matchFilter;
  });

  const outCount = items.filter((i) => i.totalQty <= 0).length;
  const lowCount = items.filter(
    (i) => i.totalQty > 0 && i.minStockLevel != null && i.totalQty <= i.minStockLevel,
  ).length;

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
          <Package className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventar</h1>
          <p className="text-sm text-gray-500">Hozirgi zaxira holati</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Package className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{items.length}</p>
              <p className="text-xs text-gray-500">Jami mahsulotlar</p>
            </div>
          </div>
        </div>
        <div className={cn('rounded-xl border p-4 shadow-sm', lowCount > 0 ? 'border-orange-200 bg-orange-50/50' : 'border-gray-200 bg-white')}>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', lowCount > 0 ? 'bg-orange-100' : 'bg-gray-50')}>
              <TrendingDown className={cn('h-5 w-5', lowCount > 0 ? 'text-orange-500' : 'text-gray-400')} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{lowCount}</p>
              <p className="text-xs text-gray-500">Kam qolgan</p>
            </div>
          </div>
        </div>
        <div className={cn('rounded-xl border p-4 shadow-sm', outCount > 0 ? 'border-red-200 bg-red-50/50' : 'border-gray-200 bg-white')}>
          <div className="flex items-center gap-3">
            <div className={cn('flex h-10 w-10 items-center justify-center rounded-lg', outCount > 0 ? 'bg-red-100' : 'bg-gray-50')}>
              <AlertTriangle className={cn('h-5 w-5', outCount > 0 ? 'text-red-500' : 'text-gray-400')} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{outCount}</p>
              <p className="text-xs text-gray-500">Tugagan</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-52 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Nomi yoki SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
          />
        </div>
        <div className="flex gap-1">
          {(['all', 'low', 'out'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-lg px-3 py-2 text-xs font-medium transition',
                filter === f
                  ? 'bg-amber-600 text-white'
                  : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50',
              )}
            >
              {f === 'all' ? 'Barchasi' : f === 'low' ? 'Kam qoldi' : 'Tugagan'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">
            <Package className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            Ma&apos;lumot topilmadi
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
                <th className="px-4 py-3 text-left font-medium">Mahsulot</th>
                <th className="px-4 py-3 text-left font-medium">SKU</th>
                <th className="px-4 py-3 text-left font-medium">Ombor</th>
                <th className="px-4 py-3 text-right font-medium">Min. zaxira</th>
                <th className="px-4 py-3 text-right font-medium">Hozirgi miqdor</th>
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
                  <tr key={`${item.productId}-${idx}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-medium text-gray-900">{item.name}</td>
                    <td className="px-4 py-2.5 text-gray-400">{item.sku ?? '—'}</td>
                    <td className="px-4 py-2.5 text-gray-500">{item.warehouseName}</td>
                    <td className="px-4 py-2.5 text-right text-gray-400">
                      {item.minStockLevel ?? '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
                          isOut
                            ? 'bg-red-100 text-red-700'
                            : isLow
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700',
                        )}
                      >
                        {isOut ? (
                          <>
                            <AlertTriangle className="h-3 w-3" /> Tugagan
                          </>
                        ) : (
                          `${item.totalQty} dona`
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
