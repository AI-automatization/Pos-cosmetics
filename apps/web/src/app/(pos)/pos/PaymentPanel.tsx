'use client';

import { useState, useEffect } from 'react';
import { Banknote, CreditCard, SplitSquareVertical, Check, Tag } from 'lucide-react';
import { usePOSStore } from '@/store/pos.store';
import { useCompleteSale } from '@/hooks/pos/useCompleteSale';
import { formatPrice, cn } from '@/lib/utils';
import type { Order } from '@/types/sales';
import type { PaymentMethod, DiscountType } from '@/types/sales';

interface PaymentPanelProps {
  onSaleComplete: (order: Order, change: number) => void;
}

const QUICK_CASH = [5000, 10000, 20000, 50000, 100000];

export function PaymentPanel({ onSaleComplete }: PaymentPanelProps) {
  const {
    items,
    paymentMethod, setPaymentMethod,
    cashAmount, setCashAmount,
    cardAmount, setCardAmount,
    orderDiscount, orderDiscountType, setOrderDiscount,
    totals,
  } = usePOSStore();

  const { subtotal, discountAmount, total, change } = totals();
  const { mutate: completeSale, isPending, canComplete } = useCompleteSale(
    (order) => onSaleComplete(order, change),
  );

  const [discountInput, setDiscountInput] = useState(String(orderDiscount));
  const [discountType, setDiscountType] = useState<DiscountType>(orderDiscountType);

  // Sync local state when store resets after clearCart()
  useEffect(() => {
    setDiscountInput(String(orderDiscount));
    setDiscountType(orderDiscountType);
  }, [orderDiscount, orderDiscountType]);

  const handleDiscountApply = () => {
    const val = parseFloat(discountInput) || 0;
    setOrderDiscount(val, discountType);
  };

  const METHODS: { key: PaymentMethod; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { key: 'cash', label: 'Naqd', icon: <Banknote className="h-4 w-4" />, shortcut: 'F5' },
    { key: 'card', label: 'Karta', icon: <CreditCard className="h-4 w-4" />, shortcut: 'F6' },
    { key: 'split', label: 'Aralash', icon: <SplitSquareVertical className="h-4 w-4" />, shortcut: 'F7' },
  ];

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-400">Savatcha bo'sh</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Totals */}
      <div className="shrink-0 space-y-1 border-b border-gray-100 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Jami ({items.reduce((s, i) => s + i.quantity, 0)} ta)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>Chegirma</span>
            <span>− {formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">
          <span>TO'LOV</span>
          <span className="text-blue-600">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Discount */}
      <div className="shrink-0 border-b border-gray-100 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
          <Tag className="h-3 w-3" /> Chegirma
        </p>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={cn(
                'px-2.5 py-1.5 transition',
                discountType === 'percent' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={cn(
                'px-2.5 py-1.5 transition',
                discountType === 'fixed' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              So'm
            </button>
          </div>
          <input
            type="number"
            value={discountInput}
            min={0}
            onChange={(e) => setDiscountInput(e.target.value)}
            onBlur={handleDiscountApply}
            onKeyDown={(e) => e.key === 'Enter' && handleDiscountApply()}
            placeholder="0"
            className="flex-1 rounded-lg border border-gray-200 px-2 py-1.5 text-sm outline-none focus:border-blue-400"
          />
        </div>
      </div>

      {/* Payment method */}
      <div className="shrink-0 border-b border-gray-100 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">To'lov turi</p>
        <div className="grid grid-cols-3 gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setPaymentMethod(m.key)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition',
                paymentMethod === m.key
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {m.icon}
              <span>{m.label}</span>
              <span className="text-gray-400">{m.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cash input */}
      {(paymentMethod === 'cash' || paymentMethod === 'split') && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">
            {paymentMethod === 'split' ? 'Naqd miqdori' : 'Mijoz berdi'}
          </p>
          <input
            type="number"
            value={cashAmount || ''}
            onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
            placeholder={formatPrice(total)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right text-base font-bold text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
          {/* Quick cash buttons */}
          <div className="mt-2 flex flex-wrap gap-1">
            {QUICK_CASH.filter((v) => v >= total * 0.5).slice(0, 4).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setCashAmount(v)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
              >
                {(v / 1000).toFixed(0)}K
              </button>
            ))}
            <button
              type="button"
              onClick={() => setCashAmount(total)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
            >
              Teng
            </button>
          </div>

          {/* Change */}
          {change > 0 && (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Qaytim:</span>
                <span className="font-bold text-green-700">{formatPrice(change)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card input for split */}
      {paymentMethod === 'split' && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Karta miqdori</p>
          <input
            type="number"
            value={cardAmount || ''}
            onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
            placeholder={formatPrice(Math.max(0, total - cashAmount))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right text-base font-bold text-gray-900 outline-none transition focus:border-blue-400"
          />
        </div>
      )}

      {/* Complete button */}
      <div className="mt-auto shrink-0 p-3">
        <button
          type="button"
          onClick={() => completeSale()}
          disabled={!canComplete || isPending}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition',
            canComplete && !isPending
              ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-lg shadow-blue-200'
              : 'cursor-not-allowed bg-gray-100 text-gray-400',
          )}
        >
          {isPending ? (
            'Saqlanmoqda...'
          ) : (
            <>
              <Check className="h-5 w-5" />
              Sotuv yakunlash
              <span className="ml-1 rounded bg-blue-500 px-1.5 py-0.5 text-xs font-normal">
                F10
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
