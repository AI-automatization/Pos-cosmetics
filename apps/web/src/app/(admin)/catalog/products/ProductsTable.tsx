'use client';

import { Pencil, Trash2, AlertCircle, Printer } from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface ProductsTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onPrint?: (product: Product) => void;
}

function StockBadge({ current, min }: { current: number; min: number }) {
  const isLow = current <= min;
  const isEmpty = current === 0;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        isEmpty
          ? 'bg-red-100 text-red-700'
          : isLow
            ? 'bg-yellow-100 text-yellow-700'
            : 'bg-green-100 text-green-700',
      )}
    >
      {(isEmpty || isLow) && <AlertCircle className="h-3 w-3" />}
      {current} {isEmpty ? '(tugagan)' : isLow ? '(kam)' : ''}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
      )}
    >
      {isActive ? 'Faol' : 'Nofaol'}
    </span>
  );
}

export function ProductsTable({ products, onEdit, onDelete, onPrint }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
        <p className="text-sm text-gray-500">Mahsulotlar topilmadi</p>
        <p className="mt-1 text-xs text-gray-400">Yangi mahsulot qo\'shing</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Mahsulot
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                SKU / Barcode
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                Kategoriya
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Sotuv narxi
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Zaxira
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                Amallar
              </th>
              {onPrint && (
                <th className="px-2 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Chop
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {products.map((product) => (
              <tr key={product.id} className="transition hover:bg-gray-50">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-400">{product.unit}</p>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">
                  <p>{product.sku}</p>
                  {product.barcode && (
                    <p className="text-gray-400">{product.barcode}</p>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
                <td className="px-4 py-3 text-right font-medium text-gray-900">
                  {formatPrice(product.sellPrice)}
                </td>
                <td className="px-4 py-3 text-center">
                  <StockBadge current={product.currentStock} min={product.minStock} />
                </td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge isActive={product.isActive} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(product)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-blue-50 hover:text-blue-600"
                      aria-label="Tahrirlash"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(product)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      aria-label="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
                {onPrint && (
                  <td className="px-2 py-3">
                    <button
                      type="button"
                      onClick={() => onPrint(product)}
                      className="rounded-lg p-1.5 text-gray-400 transition hover:bg-purple-50 hover:text-purple-600"
                      aria-label="Yorliq chop etish"
                      title="Yorliq chop etish"
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
