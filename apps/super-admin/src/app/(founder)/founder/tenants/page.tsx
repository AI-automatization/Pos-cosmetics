'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, AlertOctagon, PlusCircle } from 'lucide-react';
import { useFounderTenants } from '@/hooks/founder/useFounder';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { TenantSummary } from '@/types/founder';

type StatusFilter = 'ALL' | 'ACTIVE' | 'INACTIVE' | 'ERROR';

/** Traffic light badge */
function TrafficLight({ tenant }: { tenant: TenantSummary }) {
  if (tenant.status === 'INACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Неактивный
      </span>
    );
  }
  if (tenant.errorsLast24h > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-medium text-yellow-700">
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        Ошибки ({tenant.errorsLast24h})
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      Активный
    </span>
  );
}

function formatActivity(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins} мин назад`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} ч назад`;
  return `${Math.floor(hours / 24)} дн назад`;
}

export default function FounderTenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data: tenants, isLoading } = useFounderTenants({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'Все' },
    { key: 'ACTIVE', label: 'Активные' },
    { key: 'INACTIVE', label: 'Неактивные' },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Магазины</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {tenants ? `${tenants.length} магазинов` : 'Загрузка...'}
          </p>
        </div>
        <Link
          href="/founder/tenants/new"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <PlusCircle className="h-4 w-4" />
          Новый магазин
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                statusFilter === f.key
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Название или slug..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Магазин</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Продажи (сегодня)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Выручка (сегодня)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Ошибки (24ч)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Активность</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Действие</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!tenants || tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    Магазины не найдены
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className={cn(
                      'transition hover:bg-gray-50',
                      tenant.status === 'INACTIVE' && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{tenant.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{tenant.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TrafficLight tenant={tenant} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-700">
                      {tenant.salesToday > 0 ? tenant.salesToday : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {tenant.revenueToday > 0 ? formatPrice(tenant.revenueToday) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tenant.errorsLast24h > 0 ? (
                        <span className="flex items-center justify-end gap-1 text-yellow-600">
                          <AlertOctagon className="h-3.5 w-3.5" />
                          {tenant.errorsLast24h}
                        </span>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatActivity(tenant.lastActivityAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/founder/tenants/${tenant.id}`}
                        className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:border-violet-400 hover:text-violet-600"
                      >
                        Детали
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
