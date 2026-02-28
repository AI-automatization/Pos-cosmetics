'use client';

import { Printer, X, CheckCircle } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import type { Order } from '@/types/sales';

interface ReceiptPreviewProps {
  order: Order;
  onClose: () => void;
}

export function ReceiptPreview({ order, onClose }: ReceiptPreviewProps) {
  const handlePrint = () => window.print();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-gray-900">Sotuv yakunlandi!</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Receipt content — 80mm thermal style */}
        <div className="max-h-[60vh] overflow-y-auto p-5">
          {/* Shop info */}
          <div className="mb-4 text-center">
            <p className="text-base font-bold text-gray-900">KOSMETIKA DO'KONI</p>
            <p className="text-xs text-gray-500">Toshkent, Chilonzor</p>
            <p className="mt-1 text-xs text-gray-400">
              #{order.orderNumber ?? order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
          </div>

          <div className="my-3 border-t border-dashed border-gray-200" />

          {/* Items */}
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-gray-900">{item.productName}</p>
                  <p className="text-xs text-gray-400">
                    {item.quantity} × {formatPrice(item.sellPrice)}
                    {item.lineDiscount > 0 && ` (−${item.lineDiscount}%)`}
                  </p>
                </div>
                <p className="shrink-0 text-xs font-semibold text-gray-900">
                  {formatPrice(item.lineTotal)}
                </p>
              </div>
            ))}
          </div>

          <div className="my-3 border-t border-dashed border-gray-200" />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Jami:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-xs text-green-600">
                <span>Chegirma:</span>
                <span>− {formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-gray-900">
              <span>TO'LOV:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Payments */}
          <div className="my-3 border-t border-dashed border-gray-200" />
          <div className="space-y-1">
            {order.payments.map((p, i) => (
              <div key={i} className="flex justify-between text-xs text-gray-600">
                <span>{p.method === 'CASH' ? 'Naqd' : 'Karta'}:</span>
                <span>{formatPrice(p.amount)}</span>
              </div>
            ))}
          </div>

          <div className="my-3 border-t border-dashed border-gray-200" />
          <p className="text-center text-xs text-gray-400">Xarid uchun rahmat!</p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-gray-100 p-4">
          <button
            type="button"
            onClick={handlePrint}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            <Printer className="h-4 w-4" />
            Chop etish
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
