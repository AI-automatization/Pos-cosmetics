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
  // qizil: inactive > 24h OR kritik xato
  if (tenant.status === 'INACTIVE') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-900/50 px-2.5 py-1 text-xs font-medium text-red-400">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        Nofaol
      </span>
    );
  }
  // sariq: faol lekin xatolar bor
  if (tenant.errorsLast24h > 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-900/50 px-2.5 py-1 text-xs font-medium text-yellow-400">
        <span className="h-2 w-2 rounded-full bg-yellow-500" />
        Xato ({tenant.errorsLast24h})
      </span>
    );
  }
  // yashil: faol, xato yo'q
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-900/50 px-2.5 py-1 text-xs font-medium text-emerald-400">
      <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
      Faol
    </span>
  );
}

function formatActivity(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins} daqiqa oldin`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} soat oldin`;
  return `${Math.floor(hours / 24)} kun oldin`;
}

export default function FounderTenantsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data: tenants, isLoading } = useFounderTenants({
    search: search || undefined,
    status: statusFilter !== 'ALL' ? statusFilter : undefined,
  });

  const FILTERS: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'ACTIVE', label: 'Faol' },
    { key: 'INACTIVE', label: 'Nofaol' },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">Tenantlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {tenants ? `${tenants.length} ta tenant` : 'Yuklanmoqda...'}
          </p>
        </div>
        <Link
          href="/founder/tenants/new"
          className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <PlusCircle className="h-4 w-4" />
          Yangi do'kon
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex gap-1 rounded-lg border border-gray-700 bg-gray-900 p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setStatusFilter(f.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                statusFilter === f.key
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-400 hover:text-gray-200',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tenant nomi yoki slug..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-2 pl-9 pr-3 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-violet-500"
          />
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-800">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Tenant</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Holat</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Savdo (bugun)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Daromad (bugun)</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500">Xatolar (24h)</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">So'nggi faollik</th>
                <th className="px-4 py-3 text-center font-medium text-gray-500">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {!tenants || tenants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-600">
                    Tenant topilmadi
                  </td>
                </tr>
              ) : (
                tenants.map((tenant) => (
                  <tr
                    key={tenant.id}
                    className={cn(
                      'transition hover:bg-gray-800/50',
                      tenant.status === 'INACTIVE' && 'opacity-60',
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-200">{tenant.name}</p>
                      <p className="text-xs text-gray-600 font-mono">{tenant.slug}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <TrafficLight tenant={tenant} />
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-300">
                      {tenant.salesToday > 0 ? tenant.salesToday : '—'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-400">
                      {tenant.revenueToday > 0 ? formatPrice(tenant.revenueToday) : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {tenant.errorsLast24h > 0 ? (
                        <span className="flex items-center justify-end gap-1 text-yellow-400">
                          <AlertOctagon className="h-3.5 w-3.5" />
                          {tenant.errorsLast24h}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {formatActivity(tenant.lastActivityAt)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Link
                        href={`/founder/tenants/${tenant.id}`}
                        className="rounded-lg border border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-400 transition hover:border-violet-500 hover:text-violet-400"
                      >
                        Detail
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
