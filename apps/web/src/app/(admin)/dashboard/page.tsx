'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownToLine,
  Info,
  PackageCheck,
} from 'lucide-react';
import { useDashboard } from '@/hooks/reports/useReports';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import type { ProfitSummary } from '@/types/reports';

// ─── Trend badge ──────────────────────────────────────────────

function TrendBadge({ current, previous }: { current: number; previous: number | undefined }) {
  if (previous === undefined || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
        up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

// ─── Stat card ────────────────────────────────────────────────

function StatCard({
  title,
  value,
  sub,
  tooltip,
  trend,
  icon: Icon,
  accent = 'blue',
}: {
  title: string;
  value: string;
  sub?: string;
  tooltip?: string;
  trend?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-gray-500">{title}</p>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-gray-300 hover:text-gray-400">
              <Info className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend}
        </div>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Chart tooltip ────────────────────────────────────────────

function ChartTooltipContent({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// ─── Profit breakdown card ────────────────────────────────────

function ProfitBreakdown({ profit }: { profit: ProfitSummary }) {
  const margin = parseFloat(profit.grossMarginPct);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold text-gray-700">Foyda tahlili (bugun)</h2>
      <div className="flex flex-col gap-2">
        <Row
          label="Tushum"
          value={profit.revenue}
          tooltip="Barcha buyurtmalar jami summasi (chegirmadan oldin)"
          color="text-gray-900"
        />
        <Row
          label="Tannarx (COGS)"
          value={-profit.cogs}
          tooltip="Sotilgan mahsulotlarning kelish narxi summasi"
          color="text-red-600"
          prefix="−"
        />
        <Row
          label="Qaytarishlar"
          value={-profit.returns}
          tooltip="Tasdiqlangan qaytarishlar summasi"
          color="text-orange-600"
          prefix="−"
        />
        <div className="my-1 border-t border-dashed border-gray-200" />
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Yalpi foyda</span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm font-bold ${profit.grossProfit >= 0 ? 'text-green-700' : 'text-red-600'}`}
            >
              {formatPrice(Math.abs(profit.grossProfit))}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                margin >= 20
                  ? 'bg-green-50 text-green-700'
                  : margin >= 10
                    ? 'bg-yellow-50 text-yellow-700'
                    : 'bg-red-50 text-red-600'
              }`}
            >
              {profit.grossMarginPct}%
            </span>
          </div>
        </div>
        <p className="text-xs text-gray-400">
          * Sof foyda uchun xarajatlarni ham hisobga olish kerak
        </p>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  tooltip,
  color,
  prefix = '',
}: {
  label: string;
  value: number;
  tooltip: string;
  color: string;
  prefix?: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600">{label}</span>
        <span title={tooltip} className="cursor-help text-gray-300 hover:text-gray-400">
          <Info className="h-3 w-3" />
        </span>
      </div>
      <span className={`text-sm font-medium ${color}`}>
        {prefix}
        {formatPrice(Math.abs(value))}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────

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

      {/* Stat cards */}
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

      {/* Chart + top products + profit breakdown */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Haftalik savdo (so&apos;m)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={weeklyRevenue.map((d) => ({ ...d, label: fmtDate(d.date) }))}
              margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip content={<ChartTooltipContent />} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Profit breakdown or top products */}
        {profit ? (
          <ProfitBreakdown profit={profit} />
        ) : (
          <TopProductsList products={topProducts} />
        )}
      </div>

      {/* Top products (full row) when profit is shown */}
      {profit && (
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Top mahsulotlar (haftalik)</h2>
            <Link href="/reports/top-products" className="text-xs text-blue-600 hover:text-blue-700">
              Barchasi →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {topProducts.slice(0, 5).map((p, idx) => (
              <div key={p.productId} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800">{p.productName}</p>
                  <p className="text-xs text-gray-400">{p.quantity} ta · {formatPrice(p.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Low stock warning */}
      {lowStockCount > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <span>
              <span className="font-semibold">{lowStockCount} ta mahsulot</span> kam yoki
              tugagan zaxirada
            </span>
          </div>
          <Link
            href="/inventory/low-stock"
            className="flex items-center gap-1.5 rounded-lg bg-yellow-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-yellow-700"
          >
            <ArrowDownToLine className="h-3.5 w-3.5" />
            Kirim qilish
          </Link>
        </div>
      )}
    </div>
  );
}

// ─── Subcomponents ────────────────────────────────────────────

function TopProductsList({ products }: { products: { productId: string; productName: string; quantity: number; revenue: number }[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-700">Top mahsulotlar</h2>
        <Link href="/reports/top-products" className="text-xs text-blue-600 hover:text-blue-700">
          Barchasi →
        </Link>
      </div>
      <div className="flex flex-col gap-3">
        {products.slice(0, 5).map((p, idx) => (
          <div key={p.productId} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
              {idx + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-gray-800">{p.productName}</p>
              <p className="text-xs text-gray-400">{p.quantity} ta</p>
            </div>
            <span className="shrink-0 text-xs font-semibold text-gray-700">
              {formatPrice(p.revenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Shown when backend API is not ready yet */
function DemoContent() {
  const DEMO_WEEKLY = [
    { label: '22.02', revenue: 1_250_000 },
    { label: '23.02', revenue: 980_000 },
    { label: '24.02', revenue: 1_600_000 },
    { label: '25.02', revenue: 1_120_000 },
    { label: '26.02', revenue: 2_050_000 },
    { label: '27.02', revenue: 1_780_000 },
    { label: '28.02', revenue: 950_000 },
  ];

  const DEMO_TOP = [
    { name: 'Nivea Day Cream', qty: 24, revenue: 960_000 },
    { name: 'Garnier Micellar Water', qty: 18, revenue: 720_000 },
    { name: "L'Oreal Shampoo", qty: 32, revenue: 640_000 },
    { name: 'Maybelline Mascara', qty: 12, revenue: 600_000 },
    { name: 'Dove Soap', qty: 48, revenue: 480_000 },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-sm font-semibold text-gray-700">Haftalik savdo (demo)</p>
        <p className="mb-4 text-xs text-gray-400">
          Backend tayyor bo&apos;lgach real ma&apos;lumot ko&apos;rinadi
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={DEMO_WEEKLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <Bar dataKey="revenue" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-gray-700">Top mahsulotlar (demo)</p>
        <div className="flex flex-col gap-3">
          {DEMO_TOP.map((p, idx) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.qty} ta</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gray-700">
                {formatPrice(p.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
