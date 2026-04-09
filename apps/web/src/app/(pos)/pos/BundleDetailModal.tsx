'use client';

import { useQuery } from '@tanstack/react-query';
import { Package, X, ShoppingCart } from 'lucide-react';
import { catalogApi } from '@/api/catalog.api';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface BundleDetailModalProps {
  product: Product;
  onConfirm: () => void;
  onClose: () => void;
}

export function BundleDetailModal({ product, onConfirm, onClose }: BundleDetailModalProps) {
  const { data: components = [], isLoading } = useQuery({
    queryKey: ['bundle-components', product.id],
    queryFn: () => catalogApi.getBundleComponents(product.id),
    staleTime: 60_000,
  });

  const componentTotal = components.reduce(
    (sum, c) => sum + (c.component?.sellPrice ?? 0) * c.quantity,
    0,
  );
  const bundlePrice = Number(product.sellPrice);
  const savings = componentTotal - bundlePrice;
  const discountPercent = componentTotal > 0
    ? Math.round((savings / componentTotal) * 100)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{product.name}</p>
              <p className="text-xs text-blue-600">To&apos;plam mahsulot</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Components list */}
        <div className="px-4 py-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Tarkib:</p>

          {isLoading ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : components.length === 0 ? (
            <p className="py-3 text-center text-xs text-gray-400">Tarkib aniqlanmagan</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {components.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.component?.name ?? item.componentId}
                    </p>
                    {item.component?.sku && (
                      <p className="text-xs text-gray-400">{item.component.sku}</p>
                    )}
                  </div>
                  <div className="ml-3 text-right">
                    <p className="text-xs text-gray-500">{item.quantity} dona</p>
                    {item.component && (
                      <p className="text-xs font-medium text-gray-700">
                        {formatPrice(item.component.sellPrice * item.quantity)}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price breakdown */}
        <div className="border-t border-gray-100 px-4 py-3">
          {componentTotal > 0 && (
            <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
              <span>Alohida narxi:</span>
              <span className="line-through">{formatPrice(componentTotal)}</span>
            </div>
          )}
          {savings > 0 && (
            <div className="mb-2 flex items-center justify-between text-xs text-green-600">
              <span>Tejash ({discountPercent}%):</span>
              <span>-{formatPrice(savings)}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">To&apos;plam narxi:</span>
            <span className="text-lg font-bold text-blue-600">{formatPrice(bundlePrice)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-gray-100 px-4 pb-4 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={() => { onConfirm(); onClose(); }}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ShoppingCart className="h-4 w-4" />
            Savatga qo&apos;sh
          </button>
        </div>
      </div>
    </div>
  );
}
