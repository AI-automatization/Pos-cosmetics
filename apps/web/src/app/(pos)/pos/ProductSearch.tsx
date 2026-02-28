'use client';

import { useRef, useCallback } from 'react';
import { Search, Barcode, Plus } from 'lucide-react';
import { useProducts } from '@/hooks/catalog/useProducts';
import { usePOSStore } from '@/store/pos.store';
import { useBarcodeScanner } from '@/hooks/pos/useBarcodeScanner';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';

interface ProductSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const isLowStock = product.currentStock <= product.minStock;
  const isOutOfStock = product.currentStock === 0;

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isOutOfStock}
      className={cn(
        'group flex flex-col rounded-xl border bg-white p-3 text-left transition',
        isOutOfStock
          ? 'cursor-not-allowed border-gray-200 opacity-50'
          : 'cursor-pointer border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95',
      )}
    >
      <div className="mb-1 flex items-start justify-between gap-1">
        <p className="line-clamp-2 text-xs font-medium leading-snug text-gray-900">
          {product.name}
        </p>
        <Plus className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-blue-500" />
      </div>
      <p className="mt-auto text-sm font-bold text-blue-600">
        {formatPrice(product.sellPrice)}
      </p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">{product.sku}</span>
        <span
          className={cn(
            'text-xs',
            isOutOfStock
              ? 'text-red-500'
              : isLowStock
                ? 'text-yellow-600'
                : 'text-green-600',
          )}
        >
          {product.currentStock} {product.unit}
        </span>
      </div>
    </button>
  );
}

export function ProductSearch({ search, onSearchChange, searchRef }: ProductSearchProps) {
  const addItem = usePOSStore((s) => s.addItem);

  const { data, isFetching } = useProducts({
    search: search || undefined,
    limit: 24,
    isActive: true,
  });

  const handleAdd = useCallback(
    (product: Product) => {
      addItem({
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        sku: product.sku,
        sellPrice: product.sellPrice,
        unit: product.unit,
      });
    },
    [addItem],
  );

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      onSearchChange(barcode);
      // Auto-add if single match
      if (data?.items.length === 1) {
        handleAdd(data.items[0]);
        onSearchChange('');
      }
    },
    [data, handleAdd, onSearchChange],
  );

  useBarcodeScanner(handleBarcodeScan);

  return (
    <div className="flex h-full flex-col">
      {/* Search input */}
      <div className="shrink-0 p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchRef}
            data-barcode="true"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="F1 — Nom, SKU yoki barcode..."
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-10 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
          <Barcode className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
        </div>
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        {isFetching && (
          <div className="py-4 text-center text-xs text-gray-400">Qidirilmoqda...</div>
        )}

        {!isFetching && data?.items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Search className="mb-2 h-8 w-8 text-gray-200" />
            <p className="text-sm text-gray-400">Mahsulot topilmadi</p>
          </div>
        )}

        {data && data.items.length > 0 && (
          <div className="grid grid-cols-2 gap-2 xl:grid-cols-3">
            {data.items.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdd={() => handleAdd(product)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
