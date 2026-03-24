'use client';

import { useState } from 'react';
import { Clock, ChevronLeft, ChevronRight, CheckCircle, Lock } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { useShifts } from '@/hooks/sales/useShifts';
import { formatPrice, formatDate, cn } from '@/lib/utils';
import type { ShiftStatus } from '@/types/shift';

const STATUS_CONFIG: Record<ShiftStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  OPEN: { label: 'Ochiq', icon: Clock, className: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Yopilgan', icon: Lock, className: 'bg-gray-100 text-gray-600' },
};

function StatusBadge({ status }: { status: ShiftStatus }) {
  const { label, icon: Icon, className } = STATUS_CONFIG[status];
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

const STATUS_FILTERS: Array<{ value: ShiftStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Barchasi' },
  { value: 'OPEN', label: 'Ochiq' },
  { value: 'CLOSED', label: 'Yopilgan' },
];

export default function ShiftsPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ShiftStatus | 'ALL'>('ALL');
  const LIMIT = 20;

  const { data, isLoading, isError, refetch } = useShifts({
    page,
    limit: LIMIT,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const shifts = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  return (
    <PageLayout
      title="Smenalar"
      subtitle={`Jami: ${total} ta smena`}
    >
      {/* Filter tabs */}
      <div className="mb-4 flex gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => { setStatusFilter(f.value as ShiftStatus | 'ALL'); setPage(1); }}
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
          {shifts.length === 0 ? (
            <EmptyState icon={Clock} title="Smenalar mavjud emas" />
          ) : (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kassir</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Ochildi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Yopildi</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Holat</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Sotuvlar</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Naqd</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Karta</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Jami daromad</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {shifts.map((s) => (
                    <tr key={s.id} className="transition hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{s.cashierName}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(s.openedAt)}</td>
                      <td className="px-4 py-3 text-gray-500">
                        {s.closedAt ? formatDate(s.closedAt) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={s.status} />
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        <span className="inline-flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5 text-green-500" />
                          {s.salesCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatPrice(s.cashRevenue)}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{formatPrice(s.cardRevenue)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{formatPrice(s.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
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
