'use client';

import Link from 'next/link';
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
  ShoppingCart,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownToLine,
} from 'lucide-react';
import { useDashboard } from '@/hooks/reports/useReports';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

function StatCard({
  title,
  value,
  sub,
  icon: Icon,
  accent = 'blue',
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
  };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}

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

export default function DashboardPage() {
  const { data, isLoading, isError } = useDashboard();

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
            Reports API (T-024) bajarilgach bu yerda real ma&apos;lumotlar ko&apos;rinadi.
          </p>
        </div>
        <DemoContent />
      </div>
    );
  }

  const { today, weeklyRevenue, topProducts, lowStockCount } = data;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-400">
          {new Date().toLocaleDateString('uz-UZ', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Bugungi savdo"
          value={formatPrice(today.totalRevenue)}
          sub={`${today.ordersCount} ta buyurtma`}
          icon={TrendingUp}
          accent="blue"
        />
        <StatCard
          title="Sof daromad"
          value={formatPrice(today.netRevenue)}
          sub={`Chegirma: −${formatPrice(today.discountAmount)}`}
          icon={ArrowUpRight}
          accent="green"
        />
        <StatCard
          title="O'rtacha chek"
          value={formatPrice(today.averageOrderValue)}
          sub="Bugungi o'rtacha"
          icon={ShoppingCart}
          accent="blue"
        />
        <StatCard
          title="Kam zaxira"
          value={`${lowStockCount} ta`}
          sub="Mahsulot kam yoki tugagan"
          icon={AlertTriangle}
          accent={lowStockCount > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Weekly chart + Top products */}
      <div className="grid grid-cols-3 gap-4">
        {/* Bar chart */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-700">
            Haftalik savdo (so&apos;m)
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={weeklyRevenue.map((d) => ({
                ...d,
                label: fmtDate(d.date),
              }))}
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

        {/* Top products */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Top mahsulotlar</h2>
            <Link
              href="/reports/top-products"
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Barchasi →
            </Link>
          </div>
          <div className="flex flex-col gap-3">
            {topProducts.slice(0, 5).map((p, idx) => (
              <div key={p.productId} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                  {idx + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-800">
                    {p.productName}
                  </p>
                  <p className="text-xs text-gray-400">{p.quantity} ta</p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-gray-700">
                  {formatPrice(p.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

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
        <p className="mb-1 text-sm font-semibold text-gray-700">
          Haftalik savdo (demo)
        </p>
        <p className="mb-4 text-xs text-gray-400">Backend tayyor bo'lgach real ma'lumot ko'rinadi</p>
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
