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

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();
  const [todayStr, setTodayStr] = useState('');
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
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">{todayStr}</p>
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
