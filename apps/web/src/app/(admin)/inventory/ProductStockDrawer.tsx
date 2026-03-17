'use client';

import { X, PackageOpen } from 'lucide-react';
import { useMovementsWithUsers, useStock } from '@/hooks/inventory/useInventory';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { StockStatus } from '@/types/inventory';

const STATUS_CONFIG: Record<StockStatus, { label: string; className: string }> = {
  OK: { label: 'OK', className: 'bg-green-100 text-green-700' },
  LOW: { label: 'Kam', className: 'bg-yellow-100 text-yellow-700' },
  OUT: { label: 'Tugagan', className: 'bg-red-100 text-red-700' },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface ProductStockDrawerProps {
  productId: string | null;
  onClose: () => void;
}

export function ProductStockDrawer({ productId, onClose }: ProductStockDrawerProps) {
  const { data: stock } = useStock();
  const { data: movements, isLoading: movLoading } = useMovementsWithUsers(
    productId ?? undefined,
  );

  const product = stock?.find((s) => s.productId === productId);

  if (!productId) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              {product?.productName ?? 'Mahsulot'}
            </h2>
            <p className="text-xs text-gray-400">{product?.sku} · {product?.unit}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Section 1 — General info */}
          {product && (
            <div className="border-b border-gray-100 px-6 py-5">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Umumiy ma&apos;lumot
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Joriy zaxira</p>
                  <p
                    className={cn(
                      'mt-0.5 text-2xl font-bold tabular-nums',
                      product.status === 'OUT'
                        ? 'text-red-600'
                        : product.status === 'LOW'
                          ? 'text-yellow-600'
                          : 'text-gray-900',
                    )}
                  >
                    {product.currentStock}
                    <span className="ml-1 text-sm font-normal text-gray-400">{product.unit}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Minimum zaxira</p>
                  <p className="mt-0.5 text-2xl font-bold tabular-nums text-gray-700">
                    {product.minStock}
                    <span className="ml-1 text-sm font-normal text-gray-400">{product.unit}</span>
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Holat</p>
                  <div className="mt-1">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-1 text-xs font-semibold',
                        STATUS_CONFIG[product.status].className,
                      )}
                    >
                      {STATUS_CONFIG[product.status].label}
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-xs text-gray-500">Kategoriya</p>
                  <p className="mt-0.5 text-sm font-medium text-gray-700">
                    {product.categoryName || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Section 2 — Movements history */}
          <div className="px-6 py-5">
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
              Harakatlar tarixi
            </h3>

            {movLoading ? (
              <LoadingSkeleton variant="table" rows={4} />
            ) : !movements || movements.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-10 text-center text-gray-400">
                <PackageOpen className="h-10 w-10 opacity-40" />
                <p className="text-sm">Harakatlar tarixi yo&apos;q</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-xs">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th className="px-3 py-2.5 text-left font-medium text-gray-500">Sana</th>
                      <th className="px-3 py-2.5 text-left font-medium text-gray-500">Tur</th>
                      <th className="px-3 py-2.5 text-right font-medium text-gray-500">Miqdor</th>
                      <th className="px-3 py-2.5 text-left font-medium text-gray-500">Yetkazib beruvchi</th>
                      <th className="px-3 py-2.5 text-left font-medium text-gray-500">Kim kiritgan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {movements.map((m) => {
                      const isIn = m.type === 'IN';
                      // Parse supplier from note: "SupplierName | extra notes"
                      const noteSupplier = m.notes?.split(' | ')[0] ?? m.notes ?? '—';
                      return (
                        <tr key={m.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">
                            {formatDate(m.createdAt)}
                          </td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                'rounded-full px-2 py-0.5 font-medium',
                                isIn
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-red-100 text-red-700',
                              )}
                            >
                              {isIn ? 'Kirim' : 'Chiqim'}
                            </span>
                          </td>
                          <td
                            className={cn(
                              'px-3 py-2.5 text-right font-semibold tabular-nums',
                              isIn ? 'text-green-600' : 'text-red-600',
                            )}
                          >
                            {isIn ? '+' : '-'}{m.quantity}
                          </td>
                          <td className="max-w-[120px] truncate px-3 py-2.5 text-gray-600">
                            {isIn ? noteSupplier : '—'}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600">{m.userName}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
