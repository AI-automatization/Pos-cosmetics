'use client';

import Link from 'next/link';
import { AlertTriangle, ArrowDownToLine } from 'lucide-react';
import { useLowStock } from '@/hooks/inventory/useInventory';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types/inventory';

function StatusBadge({ status }: { status: StockStatus }) {
  if (status === 'OUT') {
    return (
      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        Tugagan
      </span>
    );
  }
  return (
    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
      Kam
    </span>
  );
}

export default function LowStockPage() {
  const { data: items, isLoading, isError, refetch } = useLowStock();

  const outCount = items?.filter((i) => i.status === 'OUT').length ?? 0;
  const lowCount = items?.filter((i) => i.status === 'LOW').length ?? 0;

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AlertTriangle className="h-6 w-6 text-yellow-500" />
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Kam zaxira</h1>
            {items && (
              <p className="text-sm text-gray-500">
                {outCount > 0 && (
                  <span className="text-red-600 font-medium">{outCount} ta tugagan</span>
                )}
                {outCount > 0 && lowCount > 0 && ', '}
                {lowCount > 0 && (
                  <span className="text-yellow-600 font-medium">{lowCount} ta kam</span>
                )}
                {outCount === 0 && lowCount === 0 && 'Hamma narsa yetarli'}
              </p>
            )}
          </div>
        </div>
        <Link
          href="/inventory/stock-in"
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <ArrowDownToLine className="h-4 w-4" />
          Kirim qilish
        </Link>
      </div>

      {/* Alert banner for OUT items */}
      {!isLoading && outCount > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{outCount} ta mahsulot</span> to&apos;liq tugagan.
            Darhol kirim qilish tavsiya etiladi.
          </p>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : isError ? (
        <ErrorState compact onRetry={refetch} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Mahsulot</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Kategoriya</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Mavjud</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Minimum</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Tanqislik</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!items || items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="h-8 w-8 text-green-400" />
                      <p className="text-gray-500">Barcha mahsulotlar yetarli zaxirada</p>
                    </div>
                  </td>
                </tr>
              ) : (
                // Sort: OUT first, then LOW
                [...items]
                  .sort((a, b) => {
                    if (a.status === 'OUT' && b.status !== 'OUT') return -1;
                    if (a.status !== 'OUT' && b.status === 'OUT') return 1;
                    return a.currentStock - b.currentStock;
                  })
                  .map((item) => {
                    const shortage = Math.max(0, item.minStock - item.currentStock);
                    return (
                      <tr
                        key={item.productId}
                        className={cn(
                          'transition',
                          item.status === 'OUT'
                            ? 'bg-red-50/50 hover:bg-red-50'
                            : 'bg-yellow-50/30 hover:bg-yellow-50/60',
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900">{item.productName}</div>
                          <div className="text-xs text-gray-400">
                            {item.sku} · {item.barcode ?? 'barcodesiz'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{item.categoryName}</td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={cn(
                              'font-semibold tabular-nums',
                              item.status === 'OUT' ? 'text-red-600' : 'text-yellow-600',
                            )}
                          >
                            {item.currentStock}
                          </span>
                          <span className="ml-1 text-xs text-gray-400">{item.unit}</span>
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                          {item.minStock}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {shortage > 0 && (
                            <span className="font-medium text-orange-600">+{shortage}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <StatusBadge status={item.status} />
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
