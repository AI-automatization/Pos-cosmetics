'use client';

import { X } from 'lucide-react';
import { useDebtDetail } from '@/hooks/customers/useDebts';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { DebtPayment } from '@/types/debt';
import type { Debt } from '@/types/debt';

// Backend detail shape (includes order items and full payment history)
interface DebtDetail {
  id: string;
  customerId: string;
  orderId?: string | null;
  totalAmount: number | string;
  paidAmount: number | string;
  remaining: number | string;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  customer?: { id: string; name: string; phone: string };
  payments: DebtPayment[];
  order?: {
    id: string;
    orderNumber?: string | number | null;
    total: number | string;
    createdAt: string;
    items: {
      id: string;
      quantity: number;
      unitPrice: number | string;
      productName?: string | null;
      product?: { name: string } | null;
    }[];
  } | null;
}

function DebtStatusBadge({ status }: { status: Debt['status'] }) {
  const { t } = useTranslation();
  const configs: Record<Debt['status'], { label: string; className: string }> = {
    CURRENT: { label: t('nasiya.current'), className: 'bg-green-100 text-green-700' },
    OVERDUE_30: { label: t('nasiya.days1to30'), className: 'bg-yellow-100 text-yellow-700' },
    OVERDUE_60: { label: t('nasiya.days31to60'), className: 'bg-orange-100 text-orange-700' },
    OVERDUE_90: { label: t('nasiya.days61to90'), className: 'bg-red-100 text-red-700' },
    OVERDUE_90PLUS: { label: t('nasiya.days90plus'), className: 'bg-red-200 text-red-800 font-semibold' },
  };
  const { label, className } = configs[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${className}`}>
      {label}
    </span>
  );
}

interface Props {
  debtId: string;
  onClose: () => void;
}

export function NasiyaDetailModal({ debtId, onClose }: Props) {
  const { t } = useTranslation();
  const { data, isLoading } = useDebtDetail(debtId);
  const detail = data as DebtDetail | undefined;

  const METHOD_LABELS: Record<string, string> = {
    CASH: t('payments.cash'),
    CARD: t('payments.card'),
    TERMINAL: t('payments.card'),
    TRANSFER: t('payments.bankTransfer'),
  };

  const overdueDays = detail?.dueDate
    ? Math.max(0, Math.floor((Date.now() - new Date(detail.dueDate).getTime()) / 86400000))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl max-h-[85vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">{t('nasiya.debtDetail')}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <LoadingSkeleton variant="table" rows={4} />
          ) : detail ? (
            <>
              {/* Customer info */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('nasiya.customer')}</p>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{detail.customer?.name ?? '—'}</p>
                    <p className="mt-0.5 font-mono text-sm text-gray-500">+{detail.customer?.phone ?? '—'}</p>
                  </div>
                  <DebtStatusBadge
                    status={
                      detail.status === 'OVERDUE' && overdueDays > 90
                        ? 'OVERDUE_90PLUS'
                        : detail.status === 'OVERDUE' && overdueDays > 60
                        ? 'OVERDUE_90'
                        : detail.status === 'OVERDUE' && overdueDays > 30
                        ? 'OVERDUE_60'
                        : detail.status === 'OVERDUE'
                        ? 'OVERDUE_30'
                        : 'CURRENT'
                    }
                  />
                </div>
              </div>

              {/* Debt amounts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
                  <p className="text-xs text-gray-400">{t('nasiya.originalAmount')}</p>
                  <p className="mt-1 font-bold text-gray-900">{formatPrice(Number(detail.totalAmount))}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
                  <p className="text-xs text-green-600">{t('nasiya.paidAmount')}</p>
                  <p className="mt-1 font-bold text-green-700">{formatPrice(Number(detail.paidAmount))}</p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-center">
                  <p className="text-xs text-orange-600">{t('nasiya.remainingDebt')}</p>
                  <p className="mt-1 font-bold text-orange-700">{formatPrice(Number(detail.remaining))}</p>
                </div>
              </div>

              {/* Due date + overdue */}
              {detail.dueDate && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{t('nasiya.dueDate')}</span>
                  <span className="font-medium text-gray-900">
                    {new Date(detail.dueDate).toLocaleDateString('uz-UZ')}
                  </span>
                  {overdueDays > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                      {overdueDays} {t('nasiya.daysLate')}
                    </span>
                  )}
                </div>
              )}

              {/* Order info */}
              {detail.order && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">{t('nasiya.order')}</p>
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        #{detail.order.orderNumber ?? detail.order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(detail.order.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    {detail.order.items.length > 0 && (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left">
                            <th className="pb-2 font-medium text-gray-500">{t('common.product')}</th>
                            <th className="pb-2 text-center font-medium text-gray-500">{t('common.quantity')}</th>
                            <th className="pb-2 text-right font-medium text-gray-500">{t('common.price')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {detail.order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-1.5 text-gray-900">
                                {item.productName ?? item.product?.name ?? '—'}
                              </td>
                              <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                              <td className="py-1.5 text-right text-gray-900">
                                {formatPrice(Number(item.unitPrice))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Payment history */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {t('nasiya.paymentHistory')} ({detail.payments.length})
                </p>
                {detail.payments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                    {t('nasiya.noPayments')}
                  </p>
                ) : (
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100 text-left">
                          <th className="px-4 py-2 font-medium text-gray-500">{t('common.date')}</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-500">{t('common.type')}</th>
                          <th className="px-4 py-2 text-right font-medium text-gray-500">{t('common.quantity')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {detail.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-2 text-gray-600">
                              {new Date(p.createdAt).toLocaleDateString('uz-UZ')}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                {METHOD_LABELS[p.method] ?? p.method}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-green-700">
                              +{formatPrice(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">{t('common.noData')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
