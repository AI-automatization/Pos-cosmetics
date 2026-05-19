'use client';

import { X, Banknote, CreditCard, Clock } from 'lucide-react';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useOrder } from '@/hooks/sales/useOrders';
import { formatPrice, formatDateTime } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { StatusBadge } from './StatusBadge';

const PAYMENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  CASH: Banknote,
  NAQD: Banknote,
  CARD: CreditCard,
  KARTA: CreditCard,
  TERMINAL: CreditCard,
  NASIYA: Clock,
  DEBT: Clock,
  ARALASH: Banknote,
};

interface OrderDetailModalProps {
  orderId: string;
  onClose: () => void;
}

export function OrderDetailModal({ orderId, onClose }: OrderDetailModalProps) {
  const { data: order, isLoading } = useOrder(orderId);
  const { t } = useTranslation();

  const PAYMENT_LABELS: Record<string, string> = {
    CASH: t('payments.cash'), NAQD: t('payments.cash'),
    CARD: t('payments.card'), KARTA: t('payments.card'), TERMINAL: t('payments.card'),
    NASIYA: t('payments.debt'), DEBT: t('payments.debt'),
    ARALASH: t('payments.mixed'),
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="flex w-full max-w-2xl max-h-[85vh] flex-col rounded-xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-gray-900">
            {order ? `${t('orders.orderNumber')} #${order.orderNumber}` : t('orders.detail')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 h-full overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <LoadingSkeleton variant="table" rows={4} />
          ) : order ? (
            <>
              {/* Order meta info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">{t('common.date')}</p>
                  <p className="text-sm font-semibold text-gray-900">{formatDateTime(order.createdAt)}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">{t('reports.cashier')}</p>
                  <p className="text-sm font-semibold text-gray-900">{order.cashierName ?? '—'}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">{t('payments.method')}</p>
                  {order.paymentMethod ? (
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                      {(() => {
                        const Icon = PAYMENT_ICONS[order.paymentMethod] ?? Banknote;
                        return <Icon className="h-3.5 w-3.5 text-blue-500" />;
                      })()}
                      {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                    </span>
                  ) : (
                    <p className="text-sm font-semibold text-gray-900">—</p>
                  )}
                </div>
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="mb-0.5 text-xs font-medium text-gray-500">{t('common.status')}</p>
                  <StatusBadge status={order.status} />
                </div>
              </div>

              {order.customerName && (
                <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5">
                  <span className="text-xs font-medium text-blue-500">{t('payments.customer')} </span>
                  <span className="text-sm font-semibold text-blue-800">{order.customerName}</span>
                </div>
              )}

              {order.notes && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5">
                  <span className="text-xs font-medium text-gray-500">{t('common.note')}: </span>
                  <span className="text-sm text-gray-700">{order.notes}</span>
                </div>
              )}

              {/* Order items table */}
              <div>
                <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('nav.products')}</h3>
                <div className="overflow-hidden rounded-lg border border-gray-200">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{t('common.product')}</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">{t('common.quantity')}</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t('common.price')}</th>
                        <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">{t('common.total')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {order.items.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-3 py-4 text-center text-sm text-gray-400">
                            {t('common.noData')}
                          </td>
                        </tr>
                      ) : (
                        order.items.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-3 py-2.5">
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              {item.sku && <p className="text-xs text-gray-400">{item.sku}</p>}
                            </td>
                            <td className="px-3 py-2.5 text-center text-gray-700">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-right text-gray-700">{formatPrice(item.unitPrice)}</td>
                            <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{formatPrice(item.total)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment intents detail */}
              {order.paymentIntents && order.paymentIntents.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-semibold text-gray-700">{t('nav.payments')}</h3>
                  <div className="space-y-1.5">
                    {order.paymentIntents.map((pi, idx) => {
                      const Icon = PAYMENT_ICONS[pi.method] ?? Banknote;
                      return (
                        <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-2.5">
                          <span className="inline-flex items-center gap-2 text-sm text-gray-700">
                            <Icon className="h-4 w-4 text-blue-500" />
                            {PAYMENT_LABELS[pi.method] ?? pi.method}
                          </span>
                          <span className="text-sm font-semibold text-gray-900">{formatPrice(Number(pi.amount))}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Totals footer */}
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 space-y-1.5">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{t('receipt.subtotal')}</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-green-600">
                    <span>{t('pos.discount')}</span>
                    <span>- {formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{t('payments.tax')}</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900">
                  <span>{t('common.total')}</span>
                  <span>{formatPrice(order.total)}</span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-sm text-gray-400">{t('common.noData')}</div>
          )}
        </div>
      </div>
    </div>
  );
}

