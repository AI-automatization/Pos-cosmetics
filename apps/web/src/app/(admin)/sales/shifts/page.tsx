'use client';

import { useState, useMemo } from 'react';
import { Clock, CheckCircle, Lock, AlertCircle, ChevronUp, ChevronDown } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { ErrorState } from '@/components/common/ErrorState';
import { useShifts } from '@/hooks/sales/useShifts';
import { formatPrice, formatDateTime, cn } from '@/lib/utils';

function formatDuration(openedAt: string, closedAt?: string | null): string {
  const end = closedAt ? new Date(closedAt) : new Date();
  const totalMin = Math.floor((end.getTime() - new Date(openedAt).getTime()) / 60000);
  const hours = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  if (hours === 0) return `${mins}d`;
  return `${hours}s ${mins}d`;
}
import type { ShiftStatus } from '@/types/shift';

const STATUS_CONFIG: Record<ShiftStatus, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  OPEN: { label: 'Ochiq', icon: Clock, className: 'bg-green-100 text-green-700' },
  CLOSED: { label: 'Yopilgan', icon: Lock, className: 'bg-gray-100 text-gray-600' },
};

function StatusBadge({ status }: { status: ShiftStatus }) {
  const config = STATUS_CONFIG[status as ShiftStatus] ?? {
    label: status ?? "Noma'lum",
    icon: AlertCircle,
    className: 'bg-gray-100 text-gray-500',
  };
  const { label, icon: Icon, className } = config;
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
  const [pageSize, setPageSize] = useState(20);
  const [statusFilter, setStatusFilter] = useState<ShiftStatus | 'ALL'>('ALL');
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const LIMIT = pageSize;

  const { data, isLoading, isError, refetch } = useShifts({
    page,
    limit: LIMIT,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const shifts = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / LIMIT) || 1;

  const filteredShifts = useMemo(() => {
    if (!shifts) return [];
    if (!searchQuery.trim()) return shifts;
    const q = searchQuery.toLowerCase();
    return shifts.filter(s => s.cashierName?.toLowerCase().includes(q));
  }, [shifts, searchQuery]);

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedShifts = useMemo(() => {
    if (!sortField) return filteredShifts;
    return [...filteredShifts].sort((a, b) => {
      let aVal: string | number | null | undefined;
      let bVal: string | number | null | undefined;
      if (sortField === 'duration') {
        aVal = new Date(a.openedAt).getTime();
        bVal = new Date(b.openedAt).getTime();
      } else {
        aVal = (a as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
        bVal = (b as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      }
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === 'string'
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) > (bVal as number)
          ? 1
          : (aVal as number) < (bVal as number)
          ? -1
          : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filteredShifts, sortField, sortDir]);

  function SortHeader({ field, label }: { field: string; label: string }) {
    const active = sortField === field;
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 hover:text-gray-900 group"
      >
        {label}
        <span
          className={cn(
            'transition-colors',
            active ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500',
          )}
        >
          {active && sortDir === 'desc' ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </span>
      </button>
    );
  }

  return (
    <PageLayout
      title="Smenalar"
      subtitle={`Jami: ${total} ta smena`}
    >
      {/* Filter tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
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
        <input
          type="text"
          placeholder="Kassir bo'yicha qidirish..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm w-52 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {isError && <ErrorState compact onRetry={refetch} />}

      {!isError && (
        <ScrollableTable
          totalCount={total}
          isLoading={isLoading}
          pagination={totalPages > 1 ? {
            page,
            pageSize,
            total,
            onPageChange: setPage,
            onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
          } : undefined}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Kassir</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <SortHeader field="openedAt" label="Ochildi" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Yopildi</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <SortHeader field="duration" label="Davomiylik" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Holat</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Sotuvlar</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Naqd</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Karta</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  <SortHeader field="revenue" label="Jami daromad" />
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedShifts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <Clock className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    <p className="text-sm text-gray-500">Smenalar mavjud emas</p>
                  </td>
                </tr>
              ) : (
                sortedShifts.map((s) => (
                  <tr key={s.id} className="transition hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{s.cashierName}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{formatDateTime(s.openedAt)}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {s.closedAt ? formatDateTime(s.closedAt) : <span className="text-green-600 font-medium">Ochiq</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">{formatDuration(s.openedAt, s.closedAt)}</td>
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
                ))
              )}
            </tbody>
          </table>
        </ScrollableTable>
      )}
    </PageLayout>
  );
}
