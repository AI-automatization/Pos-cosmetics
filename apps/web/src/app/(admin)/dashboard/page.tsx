'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  ShoppingCart,
  PackageCheck,
} from 'lucide-react';
import { useDashboard } from '@/hooks/reports/useReports';
import { useProfitReport } from '@/hooks/finance/useFinance';
import { useBranches } from '@/hooks/settings/useBranches';
import { useAnalyticsSalesTrend } from '@/hooks/analytics/useAnalytics';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatCard } from './StatCards';
import { ProfitBreakdown } from './ProfitBreakdown';
import { TopProductsList, TopProductsGrid } from './TopProductsList';
import { LowStockBanner } from './LowStockBanner';
import { DemoContent } from './DemoContent';
import { useRealtimeEvents } from '@/hooks/realtime/useRealtimeEvents';
import { useTranslation } from '@/i18n/i18n-context';
import type { Branch } from '@/api/branches.api';

// Code-split chart component — recharts bundle loaded only when dashboard data is ready
const WeeklyRevenueChart = dynamic(
  () => import('./WeeklyRevenueChart').then((m) => ({ default: m.WeeklyRevenueChart })),
  {
    ssr: false,
    loading: () => (
      <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
        <LoadingSkeleton variant="line" className="mb-4 h-4 w-40" />
        <LoadingSkeleton variant="line" className="h-[220px]" />
      </div>
    ),
  },
);

// Returns YYYY-MM-DD for today
function todayIso(): string {
  return new Date().toISOString().split('T')[0];
}

// Returns YYYY-MM-DD for N days ago
function daysAgoIso(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().split('T')[0];
}

// Per-branch revenue row — each branch fetches its own 30-day trend
function BranchRevenueRow({ branch, maxRevenue }: { branch: Branch; maxRevenue: number }) {
  const { t } = useTranslation();
  const { data: trend, isLoading } = useAnalyticsSalesTrend('daily', 30, branch.id);

  const revenue = trend
    ? trend.reduce((sum, point) => sum + (point.revenue ?? 0), 0)
    : 0;

  const pct = maxRevenue > 0 ? Math.min((revenue / maxRevenue) * 100, 100) : 0;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2">
        <span className="w-32 text-sm text-gray-500 truncate">{branch.name}</span>
        <div className="flex-1 h-2 bg-gray-100 rounded-full animate-pulse" />
        <span className="w-28 text-right text-sm text-gray-400">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
      <span className="w-32 text-sm text-gray-700 truncate" title={branch.name}>
        {branch.name}
      </span>
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="w-28 text-right text-sm font-medium text-gray-900">
        {formatPrice(revenue)}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, isError } = useDashboard();
  const [todayStr, setTodayStr] = useState('');
  const { connected, newSaleCount, lastSale, clearNewSaleCount } = useRealtimeEvents();

  // Oylik moliyaviy xulosa
  const from30 = daysAgoIso(30);
  const to30 = todayIso();
  const { data: profitReport, isLoading: isProfitLoading } = useProfitReport(from30, to30);

  // Filiallar ro'yxati — har biri o'z daromadini BranchRevenueRow da oladi
  const { data: branches, isLoading: isBranchesLoading } = useBranches();

  useEffect(() => {
    setTodayStr(
      new Date().toLocaleDateString('uz-UZ', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
    );
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <LoadingSkeleton key={i} variant="card" rows={1} />
          ))}
        </div>
        <LoadingSkeleton variant="table" rows={5} />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-700">
          <p className="font-medium">{t('dashboard.backendNotReady')}</p>
          <p className="mt-1 text-yellow-600">{t('dashboard.backendNotReadyDesc')}</p>
        </div>
        <DemoContent />
      </div>
    );
  }

  const { today, profit, weeklyRevenue, topProducts, lowStockCount } = data;
  if (!today || !weeklyRevenue || !topProducts) {
    return (
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
        <DemoContent />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">{t('dashboard.title')}</h1>
          {/* Real-time ulanish holati */}
          <span
            className={[
              'inline-flex h-2 w-2 rounded-full',
              connected ? 'bg-green-400' : 'bg-gray-300',
            ].join(' ')}
            title={connected ? t('dashboard.realtimeConnected') : t('dashboard.realtimeDisconnected')}
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Yangi savdo badge — faqat newSaleCount > 0 bo'lsa ko'rinadi */}
          {newSaleCount > 0 && (
            <button
              type="button"
              onClick={clearNewSaleCount}
              className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200 transition hover:bg-green-100"
              title={lastSale ? `${t('dashboard.todaySales')}: ${formatPrice(lastSale.total)}` : undefined}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {t('dashboard.newSale', { count: newSaleCount })}
            </button>
          )}
          <p className="text-sm text-gray-400">{todayStr}</p>
        </div>
      </div>

      {/* Asosiy metrikalar — 3 ta */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Sof foyda — bosh metrika */}
        <Link
          href="/finance/pnl"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md sm:col-span-1"
        >
          <StatCard
            title={t('dashboard.netProfit30d')}
            tooltip={t('dashboard.netProfitTooltip')}
            value={isProfitLoading ? '…' : profitReport ? formatPrice(profitReport.netProfit) : profit ? formatPrice(profit.grossProfit) : '—'}
            sub={profitReport ? `${t('dashboard.revenue')}: ${formatPrice(profitReport.revenue)}` : t('common.noData')}
            icon={TrendingUp}
            accent={profitReport && profitReport.netProfit >= 0 ? 'green' : 'red'}
          />
        </Link>
        <Link
          href="/sales/orders"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <StatCard
            title={t('dashboard.todayOrders')}
            tooltip={t('dashboard.todayOrdersTooltip')}
            value={`${today.ordersCount} ${t('common.unit')}`}
            sub={today.ordersCount === 0 ? t('dashboard.noSalesToday') : `${formatPrice(today.totalRevenue)}`}
            icon={ShoppingCart}
            accent="blue"
          />
        </Link>
        <Link
          href="/inventory/low-stock"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <StatCard
            title={t('dashboard.lowStockItems')}
            tooltip={t('dashboard.lowStockTooltip')}
            value={`${lowStockCount} ${t('common.unit')}`}
            sub={t('dashboard.lowStockSub')}
            icon={PackageCheck}
            accent={lowStockCount > 0 ? 'yellow' : 'green'}
          />
        </Link>
      </div>

      {/* Filiallar daromadi */}
      {!isBranchesLoading && branches && branches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              {t('dashboard.branchRevenue')}
              <span className="ml-1.5 text-xs font-normal text-gray-400">({t('reports.days30')})</span>
            </h2>
            <Link
              href="/analytics"
              className="text-xs text-blue-600 hover:underline"
            >
              {t('dashboard.details')}
            </Link>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white px-5 py-3">
            {branches
              .filter((b) => b.isActive)
              .map((branch) => (
                <BranchRevenueRow
                  key={branch.id}
                  branch={branch}
                  maxRevenue={profitReport?.revenue ?? 0}
                />
              ))}
            {branches.filter((b) => b.isActive).length === 0 && (
              <p className="py-4 text-center text-sm text-gray-400">
                {t('dashboard.noBranches')}
              </p>
            )}
          </div>
        </div>
      )}
      {isBranchesLoading && (
        <div>
          <LoadingSkeleton variant="line" className="mb-3 h-4 w-40" />
          <LoadingSkeleton variant="card" rows={3} />
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <WeeklyRevenueChart data={weeklyRevenue} />
        {profit ? (
          <ProfitBreakdown profit={profit} />
        ) : (
          <TopProductsList products={topProducts} />
        )}
      </div>

      {profit && <TopProductsGrid products={topProducts} />}

      <LowStockBanner count={lowStockCount} />
    </div>
  );
}
