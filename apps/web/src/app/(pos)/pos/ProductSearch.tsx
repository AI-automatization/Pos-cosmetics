'use client';

import { useCallback, useState, useEffect, useRef } from 'react';
import { Search, Barcode, Plus, Package } from 'lucide-react';
import { useProducts } from '@/hooks/catalog/useProducts';
import { usePOSStore } from '@/store/pos.store';
import { useShallow } from 'zustand/react/shallow';
import { useBarcodeScanner } from '@/hooks/pos/useBarcodeScanner';
import { usePromoMap } from '@/hooks/promotions/usePromotions';
import { formatPrice, cn } from '@/lib/utils';
import type { Product } from '@/types/catalog';
import { BundleDetailModal } from './BundleDetailModal';

interface ProductSearchProps {
  search: string;
  onSearchChange: (v: string) => void;
  searchRef: React.RefObject<HTMLInputElement | null>;
}

function ProductCard({
  product,
  onAdd,
  promoDiscount,
}: {
  product: Product;
  onAdd: () => void;
  promoDiscount?: number;
}) {
  const stock = Math.max(0, product.currentStock ?? 0);
  const minStock = product.minStockLevel ?? 0;
  const isLowStock = stock > 0 && stock <= minStock;
  const isOutOfStock = stock === 0;
  const unitLabel = product.unit?.shortName ?? product.unit?.name ?? '';
  const discountedPrice = promoDiscount
    ? product.sellPrice * (1 - promoDiscount / 100)
    : null;

  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={isOutOfStock}
      className={cn(
        'group relative flex flex-col rounded-xl border bg-white p-3 text-left transition',
        isOutOfStock
          ? 'cursor-not-allowed border-gray-200 opacity-50'
          : promoDiscount
            ? 'cursor-pointer border-red-200 hover:border-red-400 hover:shadow-md active:scale-95'
            : 'cursor-pointer border-gray-200 hover:border-blue-300 hover:shadow-md active:scale-95',
      )}
    >
      {promoDiscount && (
        <span className="absolute right-1.5 top-1.5 rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          -{promoDiscount}%
        </span>
      )}
      <div className="mb-1 flex items-start justify-between gap-1">
        <div className="min-w-0">
          <p className="line-clamp-2 text-xs font-medium leading-snug text-gray-900">
            {product.name}
          </p>
          {product.isBundle && (
            <span className="mt-0.5 inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
              <Package className="h-2.5 w-2.5" />
              Bundle
            </span>
          )}
        </div>
        <Plus className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-blue-500" />
      </div>
      <div className="mt-auto">
        {discountedPrice !== null ? (
          <div>
            <p className="text-xs text-gray-400 line-through">{formatPrice(product.sellPrice)}</p>
            <p className="text-sm font-bold text-red-600">{formatPrice(discountedPrice)}</p>
          </div>
        ) : (
          <p className="text-sm font-bold text-blue-600">{formatPrice(product.sellPrice)}</p>
        )}
      </div>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-gray-400">{product.sku ?? '—'}</span>
        <span
          className={cn(
            'text-xs',
            isOutOfStock ? 'text-red-500' : isLowStock ? 'text-yellow-600' : 'text-green-600',
          )}
        >
          {stock} {unitLabel}
        </span>
      </div>
    </button>
  );
}

export function ProductSearch({ search, onSearchChange, searchRef }: ProductSearchProps) {
  // useShallow: prevents new object reference on every render → stops Zustand tearing-detection re-renders
  const { addItem, setLineDiscount } = usePOSStore(
    useShallow((s) => ({ addItem: s.addItem, setLineDiscount: s.setLineDiscount })),
  );
  const [bundleProduct, setBundleProduct] = useState<Product | null>(null);
  const promoMap = usePromoMap();
  // Track whether the last search was triggered by barcode scan (for auto-add)
  const barcodeTriggeredRef = useRef(false);

  // Debounce: avoid API call on every keystroke — fire 200ms after user stops typing
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const { data, isFetching } = useProducts({
    search: debouncedSearch || undefined,
    limit: 24,
    isActive: true,
  });

  const doAddItem = useCallback(
    (product: Product) => {
      addItem({
        productId: product.id,
        name: product.name,
        barcode: product.barcode,
        sku: product.sku ?? '',
        sellPrice: Number(product.sellPrice),
        unit: (product.unit?.shortName ?? product.unit?.name ?? 'dona') as import('@/types/catalog').ProductUnit,
        isBundle: product.isBundle,
        currentStock: Math.max(0, product.currentStock ?? 0),
      });
      // Auto-apply promo discount if active
      const promoPct = promoMap[product.id];
      if (promoPct) {
        setLineDiscount(product.id, promoPct);
      }
    },
    [addItem, setLineDiscount, promoMap],
  );

  const handleAdd = useCallback(
    (product: Product) => {
      if (product.isBundle) {
        setBundleProduct(product);
      } else {
        doAddItem(product);
      }
    },
    [doAddItem],
  );

  const handleBarcodeScan = useCallback(
    (barcode: string) => {
      onSearchChange(barcode);
      // Bypass debounce for barcode scan — triggers API call immediately (-200ms delay)
      barcodeTriggeredRef.current = true;
      setDebouncedSearch(barcode);
    },
    [onSearchChange],
  );

  useBarcodeScanner(handleBarcodeScan);

  // Auto-add when barcode scan returns exactly 1 result
  useEffect(() => {
    if (!barcodeTriggeredRef.current || isFetching || !data) return;
    if (data.items.length === 1) {
      barcodeTriggeredRef.current = false;
      handleAdd(data.items[0]);
      onSearchChange('');
      setDebouncedSearch('');
    } else if (!isFetching) {
      barcodeTriggeredRef.current = false;
    }
  }, [data, isFetching, handleAdd, onSearchChange]);

  return (
    <div className="flex h-full flex-col">
      {/* Search input */}
      <div className="shrink-0 p-3 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            ref={searchRef as React.RefObject<HTMLInputElement>}
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
                promoDiscount={promoMap[product.id]}
              />
            ))}
          </div>
        )}
      </div>

      {/* Bundle detail modal */}
      {bundleProduct && (
        <BundleDetailModal
          product={bundleProduct}
          onConfirm={() => doAddItem(bundleProduct)}
          onClose={() => setBundleProduct(null)}
        />
      )}
    </div>
  );
}
