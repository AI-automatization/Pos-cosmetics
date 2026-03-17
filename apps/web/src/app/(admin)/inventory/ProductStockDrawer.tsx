'use client';

import { X, PackageOpen, User } from 'lucide-react';
import { useMovementsWithUsers } from '@/hooks/inventory/useInventory';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { StockLevel, StockStatus } from '@/types/inventory';

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
  product: StockLevel | null;  // To'liq product ob'ekti page dan uzatiladi
  onClose: () => void;
}

export function ProductStockDrawer({ product, onClose }: ProductStockDrawerProps) {
  const { data: movements, isLoading: movLoading } = useMovementsWithUsers(
    product?.productId ?? undefined,
  );

  if (!product) return null;

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-40 bg-black/30" onClick={onClose} aria-hidden="true" />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{product.productName}</h2>
            <p className="mt-0.5 text-xs text-gray-400">
              {[product.sku, product.unit, product.categoryName].filter(Boolean).join(' · ')}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Section 1 — Umumiy ma'lumot */}
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
                <div className="mt-1.5">
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
                <p className="text-xs text-gray-500">Narx (tannarx)</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-700">
                  {product.costPrice > 0
                    ? new Intl.NumberFormat('uz-UZ').format(product.costPrice) + " so'm"
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2 — Harakatlar tarixi */}
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
              <div className="flex flex-col gap-3">
                {movements.map((m) => {
                  const isIn = m.type === 'IN';
                  const supplierText = isIn
                    ? (m.notes?.split(' | ')[0] ?? m.notes ?? null)
                    : null;
                  const extraNote = isIn && m.notes?.includes(' | ')
                    ? m.notes.split(' | ').slice(1).join(' | ')
                    : (!isIn ? m.notes : null);

                  return (
                    <div
                      key={m.id}
                      className={cn(
                        'rounded-xl border p-3',
                        isIn ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/50',
                      )}
                    >
                      {/* Top row: type badge + quantity + date */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                            )}
                          >
                            {isIn ? 'Kirim' : 'Chiqim'}
                          </span>
                          <span
                            className={cn(
                              'text-sm font-bold tabular-nums',
                              isIn ? 'text-green-700' : 'text-red-700',
                            )}
                          >
                            {isIn ? '+' : '-'}{m.quantity} {product.unit}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">{formatDate(m.createdAt)}</span>
                      </div>

                      {/* Details */}
                      <div className="mt-2 flex flex-col gap-1">
                        {/* Kim kiritgan */}
                        <div className="flex items-center gap-1.5 text-xs text-gray-600">
                          <User className="h-3.5 w-3.5 text-gray-400" />
                          <span className="font-medium">{m.userName}</span>
                        </div>

                        {/* Supplier */}
                        {supplierText && (
                          <div className="text-xs text-gray-500">
                            <span className="text-gray-400">Yetkazib beruvchi: </span>
                            {supplierText}
                          </div>
                        )}

                        {/* Extra note */}
                        {extraNote && (
                          <div className="text-xs text-gray-500">
                            <span className="text-gray-400">Izoh: </span>
                            {extraNote}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
