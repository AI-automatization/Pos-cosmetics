'use client';

// /finance/exchange-rates — Valyuta kursi tarixi sahifasi
// CBU dan olingan USD/UZS kursi + line chart + qo'lda yangilash

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RefreshCw, TrendingUp, TrendingDown, Minus, DollarSign } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useExchangeRate, useExchangeRateHistory, useSyncExchangeRate } from '@/hooks/finance/useExchangeRate';
import { cn } from '@/lib/utils';

/* ─── Types ─── */

type Period = '7' | '30' | '90';

const PERIOD_LABELS: Record<Period, string> = {
  '7': '7 kun',
  '30': '30 kun',
  '90': '90 kun',
};

/* ─── Helpers ─── */

function formatRate(rate: number): string {
  return new Intl.NumberFormat('uz-UZ').format(Math.round(rate));
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/* ─── Chart Tooltip ─── */

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function RateTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{formatRate(payload[0].value)} so&apos;m</p>
    </div>
  );
}

/* ─── Stat Card ─── */

interface RateStatCardProps {
  label: string;
  value: string;
  sub?: string;
  color?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

function RateStatCard({ label, value, sub, color = 'bg-blue-50 text-blue-600', icon: Icon = DollarSign }: RateStatCardProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-xl', color)}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

/* ─── History Table ─── */

interface HistoryTableProps {
  items: { date: string; usdUzs: number; source: string }[];
}

function HistoryTable({ items }: HistoryTableProps) {
  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-gray-400">
        Tarix ma&apos;lumotlari mavjud emas
      </div>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-100 bg-gray-50">
          {['Sana', 'USD/UZS kursi', "O'zgarish", 'Manba'].map((h) => (
            <th
              key={h}
              className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-50">
        {items.map((row, idx) => {
          const prev = items[idx + 1];
          const diff = prev ? row.usdUzs - prev.usdUzs : null;
          return (
            <tr key={row.date} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-500">{row.date}</td>
              <td className="px-4 py-3 font-semibold text-gray-900">
                {formatRate(row.usdUzs)} so&apos;m
              </td>
              <td className="px-4 py-3">
                {diff === null ? (
                  <span className="text-gray-300">—</span>
                ) : diff > 0 ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <TrendingUp className="h-3.5 w-3.5" />+{formatRate(diff)}
                  </span>
                ) : diff < 0 ? (
                  <span className="flex items-center gap-1 text-red-500">
                    <TrendingDown className="h-3.5 w-3.5" />{formatRate(diff)}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-400">
                    <Minus className="h-3.5 w-3.5" />0
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    row.source === 'CBU'
                      ? 'bg-green-100 text-green-700'
                      : row.source === 'CACHED'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {row.source}
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

/* ─── Main Page ─── */

export default function ExchangeRatesPage() {
  const [period, setPeriod] = useState<Period>('30');

  const { data: latest, isLoading: loadingLatest } = useExchangeRate();
  const { data: history = [], isLoading: loadingHistory, isError, refetch } = useExchangeRateHistory(Number(period));
  const { mutate: sync, isPending: syncing } = useSyncExchangeRate();

  // Eng yuqori va eng past kurs hisoblash
  const minRate = history.length ? Math.min(...history.map((h) => h.usdUzs)) : null;
  const maxRate = history.length ? Math.max(...history.map((h) => h.usdUzs)) : null;

  // Chart uchun: tarixi chronological tartibda
  const chartData = [...history]
    .reverse()
    .map((h) => ({ ...h, label: fmtDate(h.date) }));

  return (
    <PageLayout
      title="Valyuta kurslari"
      subtitle="Markaziy bank (CBU) USD/UZS kursi"
      actions={
        <button
          type="button"
          onClick={() => sync()}
          disabled={syncing}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          <RefreshCw className={cn('h-4 w-4', syncing && 'animate-spin')} />
          {syncing ? 'Yangilanmoqda...' : 'CBU dan yangilash'}
        </button>
      }
    >
      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {loadingLatest ? (
          <>
            <LoadingSkeleton variant="card" rows={1} />
            <LoadingSkeleton variant="card" rows={1} />
            <LoadingSkeleton variant="card" rows={1} />
          </>
        ) : (
          <>
            <RateStatCard
              label="Bugungi kurs"
              value={latest ? `${formatRate(latest.usdUzs)} so'm` : '—'}
              sub={latest ? `${latest.date} · ${latest.source}` : undefined}
              color="bg-blue-50 text-blue-600"
              icon={DollarSign}
            />
            <RateStatCard
              label={`${period} kunlik minimum`}
              value={minRate !== null ? `${formatRate(minRate)} so'm` : '—'}
              color="bg-green-50 text-green-600"
              icon={TrendingDown}
            />
            <RateStatCard
              label={`${period} kunlik maksimum`}
              value={maxRate !== null ? `${formatRate(maxRate)} so'm` : '—'}
              color="bg-red-50 text-red-600"
              icon={TrendingUp}
            />
          </>
        )}
      </div>

      {/* Period filter */}
      <div className="mb-4 flex items-center gap-2">
        {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium transition',
              period === p
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-700">
          USD/UZS kursi dinamikasi
        </h2>

        {loadingHistory && <LoadingSkeleton variant="card" rows={3} />}
        {isError && <ErrorState compact onRetry={refetch} />}

        {!loadingHistory && !isError && chartData.length > 0 && (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart
              data={chartData}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<RateTooltip />} />
              <Line
                type="monotone"
                dataKey="usdUzs"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {!loadingHistory && !isError && chartData.length === 0 && (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            Tarix ma&apos;lumotlari mavjud emas
          </div>
        )}
      </div>

      {/* History table */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">
            Kurs tarixi ({history.length} ta yozuv)
          </h2>
        </div>
        {loadingHistory ? (
          <div className="p-4">
            <LoadingSkeleton variant="table" rows={5} />
          </div>
        ) : (
          <HistoryTable items={history} />
        )}
      </div>
    </PageLayout>
  );
}
