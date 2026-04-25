'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  TrendingUp,
  ArrowUpRight,
  ShoppingCart,
  PackageCheck,
} from 'lucide-react';
import { useDashboard } from '@/hooks/reports/useReports';
import { useProfitReport } from '@/hooks/finance/useFinance';
import { useBranches } from '@/hooks/settings/useBranches';
import { useAnalyticsSalesTrend } from '@/hooks/analytics/useAnalytics';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatCard, TrendBadge } from './StatCards';
import { ProfitBreakdown } from './ProfitBreakdown';
import { TopProductsList, TopProductsGrid } from './TopProductsList';
import { LowStockBanner } from './LowStockBanner';
import { DemoContent } from './DemoContent';
import { ExchangeRateWidget } from './ExchangeRateWidget';
import { useRealtimeEvents } from '@/hooks/realtime/useRealtimeEvents';
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

// Monthly financial summary card
interface FinSummaryCardProps {
  label: string;
  value: number;
  positive?: boolean; // green if positive, red if negative (for profit cards)
  neutral?: boolean;  // gray — always neutral (e.g. daromad)
}

function FinSummaryCard({ label, value, positive, neutral }: FinSummaryCardProps) {
  let valueColor = 'text-gray-900';
  if (!neutral) {
    valueColor = positive ? 'text-green-600' : 'text-red-500';
  }
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-sm font-semibold ${valueColor}`}>{formatPrice(value)}</p>
    </div>
  );
}

// Per-branch revenue row — each branch fetches its own 30-day trend
function BranchRevenueRow({ branch, maxRevenue }: { branch: Branch; maxRevenue: number }) {
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
        <span className="w-28 text-right text-sm text-gray-400">Yuklanmoqda…</span>
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
        <h1 className="text-xl font-semibold text-gray-900">Bosh sahifa</h1>
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
        <h1 className="text-xl font-semibold text-gray-900">Bosh sahifa</h1>
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-5 text-sm text-yellow-700">
          <p className="font-medium">Backend hali tayyor emas</p>
          <p className="mt-1 text-yellow-600">
            Reports API bajarilgach bu yerda real ma&apos;lumotlar ko&apos;rinadi.
          </p>
        </div>
        <DemoContent />
      </div>
    );
  }

  const { today, profit, profitYesterday, weeklyRevenue, topProducts, lowStockCount } = data;
  if (!today || !weeklyRevenue || !topProducts) {
    return (
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">Bosh sahifa</h1>
        <DemoContent />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Bosh sahifa</h1>
          {/* Real-time ulanish holati */}
          <span
            className={[
              'inline-flex h-2 w-2 rounded-full',
              connected ? 'bg-green-400' : 'bg-gray-300',
            ].join(' ')}
            title={connected ? 'Real-time ulangan' : 'Ulanmagan'}
          />
        </div>
        <div className="flex items-center gap-3">
          {/* Yangi savdo badge — faqat newSaleCount > 0 bo'lsa ko'rinadi */}
          {newSaleCount > 0 && (
            <button
              type="button"
              onClick={clearNewSaleCount}
              className="flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700 ring-1 ring-green-200 transition hover:bg-green-100"
              title={lastSale ? `Oxirgi savdo: ${formatPrice(lastSale.total)}` : undefined}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
              </span>
              {newSaleCount} yangi savdo
            </button>
          )}
          <p className="text-sm text-gray-400">{todayStr}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Link
          href="/analytics"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <StatCard
            title="Bugungi tushum"
            tooltip="Barcha buyurtmalar jami summasi (chegirmadan oldin)"
            value={formatPrice(today.totalRevenue)}
            sub={today.ordersCount === 0 ? "Bugun savdo yo'q" : `${today.ordersCount} ta buyurtma`}
            trend={
              <TrendBadge current={today.totalRevenue} previous={profitYesterday?.revenue} />
            }
            icon={TrendingUp}
            accent="blue"
          />
        </Link>
        <Link
          href="/sales/orders"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <StatCard
            title="Yalpi foyda"
            tooltip="Tushum − Tannarx (COGS) − Qaytarishlar. Xarajatlar hisobga olinmaydi."
            value={profit ? formatPrice(profit.grossProfit) : '—'}
            sub={profit ? `Marja: ${profit.grossMarginPct}%` : 'Ma\'lumot yo\'q'}
            trend={
              profit && profitYesterday ? (
                <TrendBadge current={profit.grossProfit} previous={profitYesterday.grossProfit} />
              ) : undefined
            }
            icon={ArrowUpRight}
            accent={profit && profit.grossProfit >= 0 ? 'green' : 'red'}
          />
        </Link>
        <Link
          href="/analytics"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <StatCard
            title="O'rtacha chek"
            tooltip="Bugungi barcha buyurtmalar summasi / buyurtmalar soni"
            value={formatPrice(today.averageOrderValue)}
            sub="Bugungi o'rtacha"
            icon={ShoppingCart}
            accent="blue"
          />
        </Link>
        <Link
          href="/inventory/low-stock"
          className="cursor-pointer transition-all hover:scale-[1.01] hover:shadow-md"
        >
          <StatCard
            title="Kam zaxira"
            tooltip="Minimal zaxira darajasidan past mahsulotlar soni"
            value={`${lowStockCount} ta`}
            sub="Mahsulot kam yoki tugagan"
            icon={PackageCheck}
            accent={lowStockCount > 0 ? 'yellow' : 'green'}
          />
        </Link>
      </div>

      {/* USD/UZS valyuta kursi widget */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExchangeRateWidget />
      </div>

      {/* Oylik moliyaviy xulosa */}
      {!isProfitLoading && profitReport && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              So&apos;nggi 30 kun — Moliyaviy xulosa
            </h2>
            <Link
              href="/finance/expenses"
              className="text-xs text-blue-600 hover:underline"
            >
              Batafsil →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            <FinSummaryCard
              label="Daromad"
              value={profitReport.revenue}
              neutral
            />
            <FinSummaryCard
              label="Tannarx (COGS)"
              value={profitReport.cogs}
              neutral
            />
            <FinSummaryCard
              label="Yalpi foyda"
              value={profitReport.grossProfit}
              positive={profitReport.grossProfit >= 0}
            />
            <FinSummaryCard
              label="Xarajatlar"
              value={profitReport.totalExpenses}
              neutral
            />
            <FinSummaryCard
              label="Sof foyda"
              value={profitReport.netProfit}
              positive={profitReport.netProfit >= 0}
            />
          </div>
        </div>
      )}
      {isProfitLoading && (
        <div>
          <LoadingSkeleton variant="line" className="mb-3 h-4 w-56" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[...Array(5)].map((_, i) => (
              <LoadingSkeleton key={i} variant="card" rows={1} />
            ))}
          </div>
        </div>
      )}

      {/* Filiallar daromadi */}
      {!isBranchesLoading && branches && branches.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Filiallar daromadi
              <span className="ml-1.5 text-xs font-normal text-gray-400">(30 kun)</span>
            </h2>
            <Link
              href="/analytics"
              className="text-xs text-blue-600 hover:underline"
            >
              Batafsil →
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
                Faol filiallar mavjud emas
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
