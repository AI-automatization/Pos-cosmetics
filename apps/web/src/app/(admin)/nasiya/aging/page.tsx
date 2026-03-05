'use client';

import Link from 'next/link';
import { ArrowLeft, AlertTriangle } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAgingReport, useNasiyaSummary } from '@/hooks/customers/useDebts';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';

const BUCKET_COLORS = ['#22c55e', '#eab308', '#f97316', '#ef4444'];

const BUCKET_META: Record<
  string,
  { color: string; bg: string; border: string; text: string }
> = {
  '0-30': { color: '#22c55e', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  '31-60': { color: '#eab308', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  '61-90': { color: '#f97316', bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  '90+': { color: '#ef4444', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
};

export default function AgingReportPage() {
  const { data: aging, isLoading: loadingAging } = useAgingReport();
  const { data: summary } = useNasiyaSummary();

  const pieData =
    aging?.buckets
      .filter((b) => b.totalAmount > 0)
      .map((b) => ({ name: b.label, value: b.totalAmount })) ?? [];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/nasiya"
            className="flex items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Nasiya boshqaruv
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-semibold text-gray-900">Aging hisobot</h1>
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4">
            <p className="text-xs text-gray-500">Jami nasiya qarz</p>
            <p className="mt-1 text-xl font-bold text-gray-900">{formatPrice(summary.totalDebt)}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-1">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs text-red-600">Muddati o'tgan</p>
            </div>
            <p className="mt-1 text-xl font-bold text-red-700">{formatPrice(summary.overdueDebt)}</p>
            <p className="mt-0.5 text-xs text-red-500">
              {summary.totalDebt > 0
                ? `${Math.round((summary.overdueDebt / summary.totalDebt) * 100)}%`
                : '0%'}{' '}
              jami qarzdan
            </p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs text-green-600">Sog'lom qarz (0–30 kun)</p>
            <p className="mt-1 text-xl font-bold text-green-700">
              {formatPrice(aging?.buckets.find((b) => b.range === '0-30')?.totalAmount ?? 0)}
            </p>
          </div>
        </div>
      )}

      {loadingAging ? (
        <LoadingSkeleton variant="table" rows={4} />
      ) : aging ? (
        <div className="grid grid-cols-2 gap-6">
          {/* Pie chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <h2 className="mb-4 font-semibold text-gray-900">Taqsimot diagrammasi</h2>
            {pieData.length === 0 ? (
              <div className="flex h-48 items-center justify-center text-sm text-gray-400">
                Ma'lumot yo'q
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ percent }: { percent?: number }) =>
                      `${((percent ?? 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={BUCKET_COLORS[i % BUCKET_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: string | number | undefined) =>
                      typeof value === 'number' ? formatPrice(value) : (value ?? '')
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bucket cards */}
          <div className="flex flex-col gap-4">
            <h2 className="font-semibold text-gray-900">Bucket tafsiloti</h2>
            {aging.buckets.map((bucket) => {
              const meta = BUCKET_META[bucket.range] ?? {
                bg: 'bg-gray-50',
                border: 'border-gray-200',
                text: 'text-gray-700',
                color: '#6b7280',
              };
              const pct =
                aging.grandTotal > 0
                  ? (bucket.totalAmount / aging.grandTotal) * 100
                  : 0;

              return (
                <div
                  key={bucket.range}
                  className={cn('rounded-xl border p-4', meta.bg, meta.border)}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <p className={cn('font-semibold', meta.text)}>{bucket.label}</p>
                      <p className="text-xs text-gray-500">{bucket.count} ta qarz</p>
                    </div>
                    <div className="text-right">
                      <p className={cn('text-lg font-bold', meta.text)}>
                        {formatPrice(bucket.totalAmount)}
                      </p>
                      <p className="text-xs text-gray-400">{pct.toFixed(1)}%</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-2 overflow-hidden rounded-full bg-white/70">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: meta.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Total */}
            <div className="rounded-xl border border-gray-300 bg-gray-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-700">JAMI</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatPrice(aging.grandTotal)}
                </p>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{aging.totalCount} ta faol qarz</p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
