'use client';

import { useState } from 'react';
import {
  Building2,
  Home,
  Warehouse,
  Store,
  DollarSign,
  Users,
  AlertTriangle,
  TrendingUp,
} from 'lucide-react';
import { useProperties, useRealEstateStats, useRentalPayments } from '@/hooks/realestate/useRealestate';
import { SearchInput } from '@/components/common/SearchInput';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';
import type { PropertyStatus, PropertyType, PaymentStatus } from '@/types/realestate';

/* ─── Helpers ─── */

const STATUS_CONFIG: Record<PropertyStatus, { label: string; className: string }> = {
  RENTED: { label: 'Ijaraga berilgan', className: 'bg-green-100 text-green-700' },
  VACANT: { label: "Bo'sh", className: 'bg-yellow-100 text-yellow-700' },
  MAINTENANCE: { label: "Ta'mirda", className: 'bg-red-100 text-red-700' },
};

const TYPE_ICONS: Record<PropertyType, React.ComponentType<{ className?: string }>> = {
  OFFICE: Building2,
  WAREHOUSE: Warehouse,
  RETAIL: Store,
  APARTMENT: Home,
};

const TYPE_LABELS: Record<PropertyType, string> = {
  OFFICE: 'Ofis',
  WAREHOUSE: 'Ombor',
  RETAIL: "Do'kon",
  APARTMENT: 'Kvartira',
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  PAID: { label: "To'langan", className: 'bg-green-100 text-green-700' },
  PENDING: { label: 'Kutilmoqda', className: 'bg-yellow-100 text-yellow-700' },
  OVERDUE: { label: "Muddati o'tgan", className: 'bg-red-100 text-red-700' },
};

function fmtPrice(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(amount)) + " so'm";
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/* ─── Stat Card ─── */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

/* ─── Page ─── */

export default function RealEstatePage() {
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'properties' | 'payments'>('properties');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'ALL'>('ALL');
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | 'ALL'>('ALL');

  const { data: stats, isLoading: statsLoading } = useRealEstateStats();
  const { data: properties, isLoading: propsLoading, isError: propsError, refetch: propsRefetch } = useProperties();
  const { data: payments, isLoading: paysLoading } = useRentalPayments(
    paymentFilter !== 'ALL' ? { status: paymentFilter } : undefined,
  );

  const filteredProps = (properties ?? []).filter((p) => {
    if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.address.toLowerCase().includes(q) ||
        (p.tenantName?.toLowerCase().includes(q) ?? false)
      );
    }
    return true;
  });

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Ko&apos;chmas mulk</h1>
        <p className="mt-0.5 text-sm text-gray-500">Mulk, ijara va to&apos;lovlar</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="Jami mulk" value={stats.totalProperties} icon={Building2} color="bg-blue-600" />
          <StatCard label="Ijarada" value={stats.rented} icon={Users} color="bg-green-600" />
          <StatCard label="Oylik ijara" value={fmtPrice(stats.totalMonthlyRent)} icon={DollarSign} color="bg-violet-600" />
          <StatCard
            label="Muddati o'tgan"
            value={stats.overduePayments}
            icon={AlertTriangle}
            color={stats.overduePayments > 0 ? 'bg-red-600' : 'bg-gray-400'}
          />
        </div>
      ) : null}

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-gray-200">
        <button
          type="button"
          onClick={() => setTab('properties')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'properties'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          Mulklar
        </button>
        <button
          type="button"
          onClick={() => setTab('payments')}
          className={cn(
            '-mb-px border-b-2 px-4 py-2 text-sm font-medium transition',
            tab === 'payments'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700',
          )}
        >
          To&apos;lovlar
        </button>
      </div>

      {/* Properties Tab */}
      {tab === 'properties' && (
        <>
          <div className="flex flex-wrap items-center gap-3">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Mulk nomi, manzil yoki ijarachi..."
              className="max-w-sm"
            />
            <div className="flex gap-1">
              {(['ALL', 'RENTED', 'VACANT', 'MAINTENANCE'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                    statusFilter === s
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
                  )}
                >
                  {s === 'ALL' ? 'Barchasi' : STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          </div>

          {propsLoading ? (
            <LoadingSkeleton variant="table" rows={6} />
          ) : propsError ? (
            <ErrorState
              compact
              onRetry={propsRefetch}
              title="Backend hali tayyor emas (T-140)"
              description="Real Estate API hali ishlab chiqilmoqda"
            />
          ) : filteredProps.length === 0 ? (
            <EmptyState
              icon={Building2}
              title="Mulklar topilmadi"
              description={search ? "Qidiruv bo'yicha natija yo'q" : "Hali mulk qo'shilmagan"}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredProps.map((p) => {
                const TypeIcon = TYPE_ICONS[p.type] ?? Building2;
                const statusCfg = STATUS_CONFIG[p.status];
                return (
                  <div
                    key={p.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 transition hover:shadow-md"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                          <TypeIcon className="h-4.5 w-4.5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{p.name}</p>
                          <p className="text-xs text-gray-500">{TYPE_LABELS[p.type]}</p>
                        </div>
                      </div>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusCfg.className)}>
                        {statusCfg.label}
                      </span>
                    </div>

                    <p className="mt-3 text-sm text-gray-600">{p.address}</p>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-xs text-gray-400">Ijara narxi</p>
                        <p className="font-semibold text-gray-900">{fmtPrice(p.rentAmount)}</p>
                      </div>
                      {p.area && (
                        <div>
                          <p className="text-xs text-gray-400">Maydon</p>
                          <p className="font-semibold text-gray-900">{p.area} m²</p>
                        </div>
                      )}
                    </div>

                    {p.tenantName && (
                      <div className="mt-3 flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                        <Users className="h-3.5 w-3.5 text-gray-400" />
                        <span className="text-sm text-gray-700">{p.tenantName}</span>
                      </div>
                    )}

                    {p.roi !== undefined && p.roi !== null && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                        <TrendingUp className="h-3 w-3" />
                        ROI: <span className="font-medium text-gray-700">{p.roi.toFixed(1)}%</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Payments Tab */}
      {tab === 'payments' && (
        <>
          <div className="flex gap-1">
            {(['ALL', 'PENDING', 'OVERDUE', 'PAID'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setPaymentFilter(s)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition',
                  paymentFilter === s
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50',
                )}
              >
                {s === 'ALL' ? 'Barchasi' : PAYMENT_STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          {paysLoading ? (
            <LoadingSkeleton variant="table" rows={6} />
          ) : !payments || payments.length === 0 ? (
            <EmptyState
              icon={DollarSign}
              title="To'lovlar topilmadi"
              description="Hali ijara to'lovlari yo'q"
            />
          ) : (
            <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Mulk</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Ijarachi</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Oy</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Summa</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Muddat</th>
                    <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.map((pay) => {
                    const statusCfg = PAYMENT_STATUS_CONFIG[pay.status];
                    return (
                      <tr key={pay.id} className="transition hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">{pay.propertyName}</td>
                        <td className="px-4 py-3 text-gray-600">{pay.tenantName}</td>
                        <td className="px-4 py-3 text-gray-600">{pay.month}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                          {fmtPrice(pay.amount)}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{fmtDate(pay.dueDate)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', statusCfg.className)}>
                            {statusCfg.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
