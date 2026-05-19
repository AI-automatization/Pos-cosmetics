'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateReturn } from '@/hooks/sales/useReturns';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { CreateReturnDto } from '@/types/returns';

interface BackendOrderItem {
  id: string;
  productId: string;
  product?: { id: string; name: string };
  quantity: number | string;
  unitPrice: number | string;
}

export interface BackendOrder {
  id: string;
  orderNumber: number | string;
  total: number | string;
  createdAt: string;
  status: string;
  user?: { firstName?: string; lastName?: string };
  customer?: { id: string; name: string; phone: string } | null;
  items: BackendOrderItem[];
}

export function ReturnModal({ order, onClose }: { order: BackendOrder; onClose: () => void }) {
  const { t } = useTranslation();
  const [reason, setReason] = useState('');
  const [selected, setSelected] = useState<Record<string, { qty: number; max: number }>>({});
  const { mutate: createReturn, isPending } = useCreateReturn();

  const toggle = (item: BackendOrderItem) => {
    setSelected((prev) => {
      if (prev[item.id]) {
        const next = { ...prev };
        delete next[item.id];
        return next;
      }
      return { ...prev, [item.id]: { qty: Number(item.quantity), max: Number(item.quantity) } };
    });
  };

  const setQty = (itemId: string, qty: number) => {
    setSelected((prev) => ({
      ...prev,
      [itemId]: { ...prev[itemId], qty: Math.max(0.001, Math.min(qty, prev[itemId].max)) },
    }));
  };

  const handleSubmit = () => {
    const items: CreateReturnDto['items'] = Object.entries(selected).map(([orderItemId, { qty }]) => {
      const oi = order.items.find((i) => i.id === orderItemId)!;
      return { orderItemId, productId: oi.productId, quantity: qty };
    });
    createReturn({ orderId: order.id, items, reason: reason || undefined }, { onSuccess: onClose });
  };

  const total = Object.entries(selected).reduce((s, [id, { qty }]) => {
    const item = order.items.find((i) => i.id === id);
    return s + Number(item?.unitPrice ?? 0) * qty;
  }, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{t('returns.returnTitle')} — #{order.orderNumber}</h2>
            <p className="text-xs text-gray-500">
              {formatPrice(Number(order.total))} •{' '}
              {new Date(order.createdAt).toLocaleString('uz-UZ')}
            </p>
          </div>
          <button type="button" onClick={onClose}>
            <X className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        <div className="space-y-2 mb-4">
          {order.items.map((item) => {
            const isSelected = !!selected[item.id];
            const productName = item.product?.name ?? item.productId.slice(0, 8);
            return (
              <div
                key={item.id}
                className={cn(
                  'flex items-center gap-3 rounded-xl border p-3 cursor-pointer transition',
                  isSelected ? 'border-blue-400 bg-blue-50' : 'border-gray-200 hover:border-gray-300',
                )}
                onClick={() => toggle(item)}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  readOnly
                  className="h-4 w-4 rounded border-gray-300 accent-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{productName}</p>
                  <p className="text-xs text-gray-500">
                    {Number(item.quantity)} × {formatPrice(Number(item.unitPrice))}
                  </p>
                </div>
                {isSelected && (
                  <input
                    type="number"
                    value={selected[item.id].qty}
                    min={0.001}
                    max={Number(item.quantity)}
                    step={0.001}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => setQty(item.id, parseFloat(e.target.value) || 0)}
                    className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm text-center outline-none focus:border-blue-400"
                  />
                )}
              </div>
            );
          })}
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">{t('returns.reasonOptional')}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
            placeholder={t('returns.reasonPlaceholder')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
          />
        </div>

        {Object.keys(selected).length > 0 && (
          <div className="mb-4 rounded-lg bg-gray-50 px-3 py-2 text-sm flex justify-between">
            <span className="text-gray-600">{t('returns.returnTotal')}:</span>
            <span className="font-semibold text-gray-900">{formatPrice(total)}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || Object.keys(selected).length === 0}
          className="w-full rounded-xl bg-orange-600 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:opacity-60"
        >
          {isPending ? t('common.loading') : t('returns.submitReturn')}
        </button>
      </div>
    </div>
  );
}
