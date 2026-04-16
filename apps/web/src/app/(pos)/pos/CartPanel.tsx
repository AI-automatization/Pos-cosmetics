'use client';

import { Minus, Plus, Trash2, Tag, ShoppingCart, Package } from 'lucide-react';
import { useState } from 'react';
import { usePOSStore } from '@/store/pos.store';
import { usePromoMap } from '@/hooks/promotions/usePromotions';
import { formatPrice, cn } from '@/lib/utils';
import type { CartItem } from '@/types/sales';

function CartItemRow({ item }: { item: CartItem }) {
  const { updateQuantity, removeItem, setLineDiscount } = usePOSStore();
  const [showDiscount, setShowDiscount] = useState(false);
  const promoMap = usePromoMap();
  const hasPromo = !!promoMap[item.productId] && item.lineDiscount > 0;

  const lineTotal = item.sellPrice * item.quantity * (1 - item.lineDiscount / 100);

  return (
    <div className="group rounded-xl border border-gray-100 bg-white p-3 transition hover:border-gray-200 hover:shadow-sm">
      {/* Product name + remove */}
      <div className="mb-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
          <div className="flex items-center gap-1.5">
            <p className="text-xs text-gray-400">{item.sku}</p>
            {hasPromo && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
                AKSIYA
              </span>
            )}
            {item.isBundle && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-700">
                <Package className="h-2.5 w-2.5" />
                Bundle
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => removeItem(item.productId)}
          className="shrink-0 rounded-lg p-1 text-gray-300 transition hover:bg-red-50 hover:text-red-500"
          aria-label="O'chirish"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Qty controls + total */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 active:scale-95"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <input
            type="number"
            value={item.quantity}
            min={1}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) updateQuantity(item.productId, v);
            }}
            className="h-7 w-12 rounded-lg border border-gray-200 text-center text-sm font-medium text-gray-900 outline-none focus:border-blue-400"
          />
          <button
            type="button"
            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition hover:bg-gray-50 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
          <span className="ml-1 text-xs text-gray-400">{item.unit}</span>
        </div>

        <div className="text-right">
          {item.lineDiscount > 0 && (
            <p className="text-xs text-gray-400 line-through">
              {formatPrice(item.sellPrice * item.quantity)}
            </p>
          )}
          <p className="text-sm font-bold text-gray-900">{formatPrice(lineTotal)}</p>
        </div>
      </div>

      {/* Line discount toggle */}
      <div className="mt-2 border-t border-gray-50 pt-2">
        {!showDiscount ? (
          <button
            type="button"
            onClick={() => setShowDiscount(true)}
            className="flex items-center gap-1 text-xs text-gray-400 transition hover:text-blue-600"
          >
            <Tag className="h-3 w-3" />
            {item.lineDiscount > 0 ? `${item.lineDiscount}% chegirma` : 'Chegirma qo\'shish'}
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <Tag className="h-3 w-3 text-gray-400" />
            <input
              type="number"
              value={item.lineDiscount}
              min={0}
              max={100}
              autoFocus
              onChange={(e) =>
                setLineDiscount(item.productId, parseFloat(e.target.value) || 0)
              }
              onBlur={() => setShowDiscount(false)}
              className="h-6 w-16 rounded border border-gray-200 px-1.5 text-center text-xs outline-none focus:border-blue-400"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function CartPanel() {
  const store = usePOSStore();
  const { items } = store.carts[store.activeCartId];
  const { clearCart } = store;

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <ShoppingCart className="mb-3 h-12 w-12 text-gray-200" />
        <p className="text-sm text-gray-400">Savatcha bo'sh</p>
        <p className="mt-1 text-xs text-gray-300">
          Mahsulot qo'shish uchun chap paneldan tanlang
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-3 py-2">
        <span className="text-sm font-semibold text-gray-700">
          Savatcha{' '}
          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-xs text-blue-700">
            {items.length}
          </span>
        </span>
        <button
          type="button"
          onClick={clearCart}
          className="text-xs text-gray-400 transition hover:text-red-500"
        >
          Tozalash
        </button>
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className={cn('flex flex-col gap-2')}>
          {items.map((item) => (
            <CartItemRow key={item.productId} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
