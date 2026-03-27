'use client';

import { useState, useEffect } from 'react';
import {
  TrendingUp,
  ArrowUpRight,
  ShoppingCart,
  PackageCheck,
} from 'lucide-react';
import { useDashboard } from '@/hooks/reports/useReports';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { StatCard, TrendBadge } from './StatCards';
import { WeeklyRevenueChart } from './WeeklyRevenueChart';
import { ProfitBreakdown } from './ProfitBreakdown';
import { TopProductsList, TopProductsGrid } from './TopProductsList';
import { LowStockBanner } from './LowStockBanner';
import { DemoContent } from './DemoContent';
import { ExchangeRateWidget } from './ExchangeRateWidget';
import { useRealtimeEvents } from '@/hooks/realtime/useRealtimeEvents';

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const [todayStr, setTodayStr] = useState('');
  const { connected, newSaleCount, lastSale, clearNewSaleCount } = useRealtimeEvents();

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
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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
      <div className="flex flex-col gap-6 overflow-y-auto p-6">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <DemoContent />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
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
        <StatCard
          title="Bugungi tushum"
          tooltip="Barcha buyurtmalar jami summasi (chegirmadan oldin)"
          value={formatPrice(today.totalRevenue)}
          sub={`${today.ordersCount} ta buyurtma`}
          trend={
            <TrendBadge current={today.totalRevenue} previous={profitYesterday?.revenue} />
          }
          icon={TrendingUp}
          accent="blue"
        />
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
        <StatCard
          title="O'rtacha chek"
          tooltip="Bugungi barcha buyurtmalar summasi / buyurtmalar soni"
          value={formatPrice(today.averageOrderValue)}
          sub="Bugungi o'rtacha"
          icon={ShoppingCart}
          accent="blue"
        />
        <StatCard
          title="Kam zaxira"
          tooltip="Minimal zaxira darajasidan past mahsulotlar soni"
          value={`${lowStockCount} ta`}
          sub="Mahsulot kam yoki tugagan"
          icon={PackageCheck}
          accent={lowStockCount > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* USD/UZS valyuta kursi widget */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ExchangeRateWidget />
      </div>

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
