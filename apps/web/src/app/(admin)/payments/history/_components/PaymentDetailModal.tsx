'use client';

import { CreditCard, Banknote, Smartphone, ArrowUpRight, X, Clock, Loader2 } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useOrder } from '@/hooks/sales/useOrders';
import type { OrderItem } from '@/types/order';
import { useTranslation } from '@/i18n/i18n-context';

const METHOD_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  NAQD: Banknote,
  KARTA: CreditCard,
  NASIYA: Clock,
  ARALASH: ArrowUpRight,
  CASH: Banknote,
  CARD: CreditCard,
  TERMINAL: CreditCard,
  DEBT: Clock,
  TRANSFER: ArrowUpRight,
  CLICK: Smartphone,
  PAYME: Smartphone,
};

const STATUS_STYLE: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-700',
  RETURNED: 'bg-orange-100 text-orange-700',
  VOIDED: 'bg-gray-100 text-gray-600',
};

export function PaymentDetailModal({ orderId, onClose }: { orderId: string; onClose: () => void }) {
  const { t } = useTranslation();
  const { data: order, isLoading } = useOrder(orderId);

  const METHOD_LABEL: Record<string, string> = {
    NAQD: t('payments.cash'),
    KARTA: t('payments.card'),
    NASIYA: t('payments.debt'),
    ARALASH: t('payments.mixed'),
    CASH: t('payments.cash'),
    CARD: t('payments.card'),
    TERMINAL: t('payments.card'),
    DEBT: t('payments.debt'),
    TRANSFER: t('payments.bankTransfer'),
    CLICK: 'Click',
    PAYME: 'Payme',
  };

  const STATUS_LABEL: Record<string, string> = {
    COMPLETED: t('orders.completed'),
    RETURNED: t('orders.returned'),
    VOIDED: t('orders.cancelled'),
  };

  const method = order?.paymentMethod ?? 'CASH';
  const MethodIcon = METHOD_ICON[method] ?? CreditCard;

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {t('payments.detail')}
            {order ? (
              <span className="ml-1.5 font-mono text-blue-600">— #{order.orderNumber}</span>
            ) : null}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
            </div>
          ) : order ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{t('common.date')}</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(order.createdAt).toLocaleString('uz-UZ', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{t('reports.cashier')}</p>
                  <p className="text-sm font-medium text-gray-800 truncate">
                    {order.cashierName ?? '—'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{t('payments.method')}</p>
                  <span className="flex items-center gap-1 text-sm font-medium text-gray-800">
                    <MethodIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    {METHOD_LABEL[method] ?? method}
                  </span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-400 mb-0.5">{t('common.status')}</p>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-medium',
                      STATUS_STYLE[order.status] ?? 'bg-gray-100 text-gray-600',
                    )}
                  >
                    {STATUS_LABEL[order.status] ?? order.status}
                  </span>
                </div>
              </div>

              {order.customerName && (
                <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-sm text-blue-800">
                  <span className="text-blue-400">{t('payments.customer')}</span>
                  <span className="font-medium">{order.customerName}</span>
                </div>
              )}

              {order.items && order.items.length > 0 ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">
                    {t('nav.products')}
                  </p>
                  <div className="border border-gray-100 rounded-lg overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {[t('common.product'), t('common.quantity'), t('common.price'), t('common.total')].map((h) => (
                            <th
                              key={h}
                              className="px-3 py-2 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {order.items.map((item: OrderItem) => (
                          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-3 py-2.5 text-gray-800 font-medium">
                              {item.productName}
                              {item.sku && (
                                <span className="ml-1.5 text-xs text-gray-400 font-mono">
                                  {item.sku}
                                </span>
                              )}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">{item.quantity}</td>
                            <td className="px-3 py-2.5 text-gray-600">
                              {formatPrice(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-gray-900">
                              {formatPrice(item.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : null}

              <div className="border-t border-gray-100 pt-3 space-y-1.5">
                {order.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{t('pos.discount')}</span>
                    <span className="text-orange-600">− {formatPrice(order.discountAmount)}</span>
                  </div>
                )}
                {order.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{t('payments.tax')}</span>
                    <span>{formatPrice(order.taxAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">{t('common.total')}</span>
                  <span className="text-base font-bold text-gray-900">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </div>

              {order.notes && (
                <div className="bg-yellow-50 border border-yellow-100 rounded-lg px-3 py-2 text-sm text-yellow-800">
                  <span className="font-medium">{t('common.note')}: </span>
                  {order.notes}
                </div>
              )}
            </>
          ) : (
            <p className="text-center text-gray-400 py-8">Ma&apos;lumot topilmadi</p>
          )}
        </div>
      </div>
    </div>
  );
}
