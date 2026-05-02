'use client';

import { useState, useMemo } from 'react';
import { DollarSign, TrendingUp, TrendingDown, ShoppingCart, Receipt, PieChart } from 'lucide-react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useProfitReport } from '@/hooks/finance/useFinance';
import { cn, formatPrice } from '@/lib/utils';
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_COLORS,
  type ExpenseCategory,
  type ExpenseSummary,
} from '@/types/finance';

/* ─── Period helpers ─── */

type Period = '7d' | '30d' | '90d' | '365d' | 'custom';

const PERIOD_LABELS: Record<Period, string> = {
  '7d': 'Hafta',
  '30d': 'Oy',
  '90d': '3 oy',
  '365d': 'Yil',
  custom: 'Maxsus',
};

function getDateRange(period: Period, customFrom?: string, customTo?: string) {
  if (period === 'custom' && customFrom && customTo) {
    return { from: customFrom, to: customTo };
  }
  const to = new Date();
  const from = new Date();
  const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
  from.setDate(from.getDate() - days);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

/* ─── KPI Card ─── */

interface KpiCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  subtitle?: string;
}

function KpiCard({ label, value, icon: Icon, color, subtitle }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={cn('flex h-9 w-9 items-center justify-center rounded-lg', color)}>
          <Icon className="h-4.5 w-4.5 text-white" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{formatPrice(value)}</p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  );
}

/* ─── Expense Breakdown ─── */

function ExpenseBreakdown({ items }: { items: ExpenseSummary[] }) {
  const total = items.reduce((s, i) => s + i.total, 0) || 1;

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-8 text-center text-sm text-gray-400">
        <PieChart className="mb-2 h-8 w-8" />
        Bu davrda xarajat mavjud emas
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {items.map((item) => {
        const pct = ((item.total / total) * 100).toFixed(1);
        const cat = item.category as ExpenseCategory;
        return (
          <div key={cat}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {EXPENSE_CATEGORY_LABELS[cat] ?? cat}
              </span>
              <span className="text-gray-500">
                {formatPrice(item.total)} ({pct}%)
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${pct}%`,
                  backgroundColor: EXPENSE_CATEGORY_COLORS[cat] ?? '#6b7280',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Page ─── */

export default function PnlPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  const { from, to } = useMemo(
    () => getDateRange(period, customFrom, customTo),
    [period, customFrom, customTo],
  );

  const { data, isLoading, isError, refetch } = useProfitReport(from, to);

  const grossMargin =
    data && data.revenue > 0
      ? ((data.grossProfit / data.revenue) * 100).toFixed(1)
      : '0.0';

  return (
    <PageLayout>
      {/* Period filter */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
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

        {period === 'custom' && (
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
            <span className="text-gray-400">—</span>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm"
            />
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading && <LoadingSkeleton variant="card" rows={5} />}

      {isError && <ErrorState compact onRetry={refetch} />}

      {data && (
        <>
          {/* KPI Cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
            <KpiCard
              label="Tushum"
              value={data.revenue}
              icon={DollarSign}
              color="bg-blue-500"
            />
            <KpiCard
              label="Tannarx (COGS)"
              value={data.cogs}
              icon={ShoppingCart}
              color="bg-orange-500"
            />
            <KpiCard
              label="Yalpi foyda"
              value={data.grossProfit}
              icon={TrendingUp}
              color="bg-emerald-500"
              subtitle={`Margin: ${grossMargin}%`}
            />
            <KpiCard
              label="Xarajatlar"
              value={data.totalExpenses}
              icon={Receipt}
              color="bg-purple-500"
            />
            <KpiCard
              label="Sof foyda"
              value={data.netProfit}
              icon={data.netProfit >= 0 ? TrendingUp : TrendingDown}
              color={data.netProfit >= 0 ? 'bg-green-600' : 'bg-red-500'}
            />
          </div>

          {/* P&L Summary + Expense Breakdown */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* P&L waterfall */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">P&L Xulosa</h3>
              <div className="flex flex-col gap-3">
                <Row label="Tushum (Revenue)" value={data.revenue} />
                <Row label="Tannarx (COGS)" value={-data.cogs} negative />
                <Divider />
                <Row label="Yalpi foyda" value={data.grossProfit} bold />
                <Row label="Xarajatlar" value={-data.totalExpenses} negative />
                <Divider />
                <Row
                  label="Sof foyda"
                  value={data.netProfit}
                  bold
                  highlight={data.netProfit >= 0 ? 'green' : 'red'}
                />
              </div>
            </div>

            {/* Expense breakdown */}
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <h3 className="mb-4 text-sm font-semibold text-gray-900">Xarajatlar taqsimoti</h3>
              <ExpenseBreakdown items={data.expensesByCategory} />
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}

/* ─── Small helpers ─── */

function Row({
  label,
  value,
  bold,
  negative,
  highlight,
}: {
  label: string;
  value: number;
  bold?: boolean;
  negative?: boolean;
  highlight?: 'green' | 'red';
}) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm', bold ? 'font-semibold text-gray-900' : 'text-gray-600')}>
        {label}
      </span>
      <span
        className={cn(
          'text-sm font-medium',
          highlight === 'green' && 'text-green-600',
          highlight === 'red' && 'text-red-600',
          negative && !highlight && 'text-red-500',
          !negative && !highlight && 'text-gray-900',
        )}
      >
        {negative && value !== 0 ? '- ' : ''}
        {formatPrice(Math.abs(value))}
      </span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-dashed border-gray-200" />;
}
