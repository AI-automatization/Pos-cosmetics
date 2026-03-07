'use client';

import { useState } from 'react';
import { CreditCard, ChevronLeft, ChevronRight, Banknote, Landmark, Smartphone } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { useOrders } from '@/hooks/sales/useOrders';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { PaymentMethod } from '@/types/order';

const PAYMENT_CONFIG: Record<PaymentMethod, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  CASH: { label: 'Naqd', icon: Banknote, className: 'bg-green-100 text-green-700' },
  CARD: { label: 'Karta', icon: Landmark, className: 'bg-blue-100 text-blue-700' },
  NASIYA: { label: 'Nasiya', icon: Smartphone, className: 'bg-yellow-100 text-yellow-700' },
};

const PAYMENT_FILTERS: Array<{ value: PaymentMethod | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'CASH', label: 'Naqd' },
  { value: 'CARD', label: 'Karta' },
  { value: 'NASIYA', label: 'Nasiya' },
];

function PaymentBadge({ method }: { method: PaymentMethod }) {
  const { label, icon: Icon, className } = PAYMENT_CONFIG[method];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export default function PaymentsHistoryPage() {
  const [page, setPage] = useState(1);
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'ALL'>('ALL');
  const LIMIT = 20;

  const { data, isLoading, isError } = useOrders({
    page,
    limit: LIMIT,
    status: 'COMPLETED',
  });

  const orders = (data?.items ?? []).filter(
    (o) => methodFilter === 'ALL' || o.paymentMethod === methodFilter,
  );
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  const totalAmount = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <PageLayout
      title="To'lovlar tarixi"
      subtitle={`Bajarilgan to'lovlar — Jami: ${total} ta`}
    >
      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        {(['CASH', 'CARD', 'NASIYA'] as PaymentMethod[]).map((method) => {
          const cfg = PAYMENT_CONFIG[method];
          const Icon = cfg.icon;
          const count = orders.filter((o) => o.paymentMethod === method).length;
          const amount = orders.filter((o) => o.paymentMethod === method).reduce((s, o) => s + o.total, 0);
          return (
            <div key={method} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className={cn('flex h-8 w-8 items-center justify-center rounded-lg', cfg.className)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-gray-700">{cfg.label}</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{formatPrice(amount)}</p>
              <p className="text-xs text-gray-500">{count} ta to'lov</p>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {PAYMENT_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setMethodFilter(f.value as PaymentMethod | 'ALL'); setPage(1); }}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              methodFilter === f.value
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <LoadingSkeleton variant="table" rows={8} />}

      {isError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Ma&apos;lumotlarni yuklashda xatolik yuz berdi.
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 py-16 text-center">
              <CreditCard className="mb-3 h-10 w-10 text-gray-300" />
              <p className="text-sm text-gray-500">To&apos;lovlar mavjud emas</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                      <span className="flex items-center gap-1">
                        <CreditCard className="h-3.5 w-3.5" />
                        Chek №
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Sana</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kassir</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Xaridor</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">To&apos;lov turi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Summa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{o.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(o.createdAt)}</td>
                      <td className="px-4 py-3 text-gray-700">{o.cashierName ?? '—'}</td>
                      <td className="px-4 py-3 text-gray-500">{o.customerName ?? '—'}</td>
                      <td className="px-4 py-3">
                        {o.paymentMethod ? <PaymentBadge method={o.paymentMethod} /> : <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">
                        {formatPrice(o.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200 bg-gray-50">
                    <td colSpan={5} className="px-4 py-3 text-sm font-semibold text-gray-700">Jami</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-gray-900">{formatPrice(totalAmount)}</td>
                  </tr>
                </tfoot>
              </table>
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
