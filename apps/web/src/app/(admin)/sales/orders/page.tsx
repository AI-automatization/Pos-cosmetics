'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, RotateCcw, XCircle, Receipt, ShoppingCart } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useOrders } from '@/hooks/sales/useOrders';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { OrderStatus, PaymentMethod } from '@/types/order';

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  COMPLETED: { label: 'Bajarildi', icon: CheckCircle, className: 'bg-green-100 text-green-700' },
  RETURNED: { label: 'Qaytarildi', icon: RotateCcw, className: 'bg-yellow-100 text-yellow-700' },
  VOIDED: { label: 'Bekor qilindi', icon: XCircle, className: 'bg-red-100 text-red-700' },
};

const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  NASIYA: 'Nasiya',
};

function StatusBadge({ status }: { status: OrderStatus }) {
  const config = STATUS_CONFIG[status];
  if (!config) return <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">{status}</span>;
  const { label, icon: Icon, className } = config;
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

const STATUS_FILTERS: Array<{ value: OrderStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'COMPLETED', label: 'Bajarildi' },
  { value: 'RETURNED', label: 'Qaytarildi' },
  { value: 'VOIDED', label: 'Bekor qilindi' },
];

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const LIMIT = 20;

  const { data, isLoading, isError, refetch } = useOrders({
    page,
    limit: LIMIT,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const orders = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <PageLayout
      title="Buyurtmalar"
      subtitle={`Jami: ${total} ta buyurtma`}
    >
      {/* Status filter tabs */}
      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setStatusFilter(f.value as OrderStatus | 'ALL'); setPage(1); }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              statusFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSkeleton variant="table" rows={8} />}

      {isError && <ErrorState compact onRetry={refetch} />}

      {!isLoading && !isError && (
        <>
          {orders.length === 0 ? (
            <EmptyState icon={ShoppingCart} title="Buyurtmalar mavjud emas" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <span className="flex items-center gap-1">
                        <Receipt className="h-3.5 w-3.5" />
                        Buyurtma №
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Sana</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kassir</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">To&apos;lov</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Holat</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700">{o.cashierName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {o.paymentMethod ? PAYMENT_LABELS[o.paymentMethod] : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={o.status} />
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatPrice(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Oldingi
                </button>
                <span className="flex items-center px-3 text-sm text-gray-500">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Keyingi
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
