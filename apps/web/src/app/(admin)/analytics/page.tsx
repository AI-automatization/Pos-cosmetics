'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import { TrendingUp, TrendingDown, Package, Users, AlertTriangle, Clock } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { useDailyRevenue, useTopProducts, today, daysAgo } from '@/hooks/reports/useReports';
import { useProfitReport } from '@/hooks/finance/useFinance';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

// ─── Static reference data (no random) ────────────────────────────────────────

const CATEGORY_MARGIN = [
  { category: 'Makiyaj', margin: 41, revenue: 4_200_000 },
  { category: 'Kremlar', margin: 36, revenue: 3_600_000 },
  { category: 'Atir', margin: 45, revenue: 2_800_000 },
  { category: 'Gigiyena', margin: 28, revenue: 1_900_000 },
  { category: 'Teri parvarishi', margin: 38, revenue: 2_100_000 },
];

const MARGIN_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444'];

// ─── Components ───────────────────────────────────────────────────────────────

type Tab = 'trend' | 'products' | 'margin' | 'cashiers' | 'heatmap' | 'deadstock';

const TABS: { key: Tab; label: string }[] = [
  { key: 'trend', label: 'Sotuv trendi' },
  { key: 'products', label: 'Top mahsulotlar' },
  { key: 'margin', label: 'Marja tahlili' },
  { key: 'cashiers', label: 'Kassirlar' },
  { key: 'heatmap', label: 'Soatlik faollik' },
  { key: 'deadstock', label: 'Harakatsiz tovar' },
];

function ComingSoonTab({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Clock className="h-10 w-10 text-gray-300" />
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-xs text-gray-400">Backend endpoint qo'shilishi kutilmoqda</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('trend');
  const weekAgo = daysAgo(29);
  const todayStr = today();

  const { data: dailyRevenue, isLoading: loadingTrend } = useDailyRevenue({ from: weekAgo, to: todayStr });
  const { data: topProducts, isLoading: loadingProducts } = useTopProducts({ from: weekAgo, to: todayStr, limit: 10 });
  const { data: profitReport, isLoading: loadingProfit } = useProfitReport(weekAgo, todayStr);

  const trendData = Array.isArray(dailyRevenue) ? dailyRevenue : [];
  const productsData = Array.isArray(topProducts) ? topProducts : [];

  const totalRevenue30 = trendData.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalOrders30 = trendData.reduce((s, d) => s + (d.ordersCount ?? 0), 0);
  const avgCheck = totalOrders30 > 0 ? Math.round(totalRevenue30 / totalOrders30) : 0;
  const avgMargin = Math.round(CATEGORY_MARGIN.reduce((s, c) => s + c.margin, 0) / CATEGORY_MARGIN.length);

  const trendChartData = trendData.map((d) => ({
    date: d.date.slice(5), // MM-DD
    revenue: d.revenue,
    orders: d.ordersCount,
  }));

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analitika</h1>
        <p className="mt-0.5 text-sm text-gray-500">So'nggi 30 kunlik biznes tahlili</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: 'Jami daromad (30 kun)', value: formatPrice(totalRevenue30), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Buyurtmalar soni', value: `${totalOrders30} ta`, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: "O'rtacha chek", value: formatPrice(avgCheck), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: "O'rtacha marja", value: `${avgMargin}%`, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className={cn('mb-2 inline-flex rounded-lg p-2', bg)}>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <p className="text-xs text-gray-500">{label}</p>
            <p className={cn('mt-0.5 text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition',
              tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        {/* Sales Trend */}
        {tab === 'trend' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">30 kunlik sotuv trendi</h2>
            {loadingTrend ? (
              <LoadingSkeleton variant="line" className="h-64" />
            ) : trendChartData.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <TrendingUp className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Ma'lumotlar topilmadi</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trendChartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} interval={4} />
                  <YAxis tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} labelStyle={{ fontSize: 12 }} />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Daromad" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* Top Products */}
        {tab === 'products' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Top mahsulotlar (daromad bo'yicha)</h2>
            {loadingProducts ? (
              <LoadingSkeleton variant="table" rows={6} />
            ) : productsData.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
                <Package className="h-10 w-10 text-gray-300" />
                <p className="text-sm text-gray-500">Ma'lumotlar topilmadi</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={productsData} layout="vertical" margin={{ left: 20, right: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis type="number" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={140} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Mahsulot', 'Miqdor', 'Daromad'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {productsData.map((p) => (
                      <tr key={p.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{p.productName}</td>
                        <td className="px-4 py-2 text-gray-600">{p.quantity} dona</td>
                        <td className="px-4 py-2 font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* Margin analysis */}
        {tab === 'margin' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Kategoriya bo'yicha marja</h2>
            {loadingProfit ? (
              <LoadingSkeleton variant="line" className="h-64" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={CATEGORY_MARGIN}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis yAxisId="left" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar yAxisId="left" dataKey="margin" name="Marja %" radius={[4, 4, 0, 0]}>
                      {CATEGORY_MARGIN.map((_, i) => <Cell key={i} fill={MARGIN_COLORS[i % MARGIN_COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                {profitReport && (
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Jami daromad', value: formatPrice((profitReport as { totalRevenue?: number }).totalRevenue ?? 0) },
                      { label: 'Jami xarajat', value: formatPrice((profitReport as { totalExpenses?: number }).totalExpenses ?? 0) },
                      { label: 'Sof foyda', value: formatPrice((profitReport as { netProfit?: number }).netProfit ?? 0) },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-lg border border-gray-100 bg-gray-50 p-3 text-center">
                        <p className="text-xs text-gray-500">{label}</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Cashier performance — backend endpoint pending */}
        {tab === 'cashiers' && (
          <ComingSoonTab label="Kassirlar samaradorligi — tez kunda" />
        )}

        {/* Hourly heatmap — backend endpoint pending */}
        {tab === 'heatmap' && (
          <ComingSoonTab label="Soatlik faollik — tez kunda" />
        )}

        {/* Dead stock — backend endpoint pending */}
        {tab === 'deadstock' && (
          <ComingSoonTab label="Harakatsiz tovar tahlili — tez kunda" />
        )}
      </div>

      {/* ABC analysis */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">ABC tahlil</h2>
        <div className="flex items-center gap-4">
          {[
            { label: 'A — Yuqori (80% daromad)', count: 3, pct: 20, color: 'bg-green-500' },
            { label: "B — O'rta (15% daromad)", count: 5, pct: 33, color: 'bg-yellow-500' },
            { label: 'C — Past (5% daromad)', count: 7, pct: 47, color: 'bg-gray-400' },
          ].map(({ label, count, pct, color }) => (
            <div key={label} className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4">
              <div className="mb-2 h-2 w-full rounded-full bg-gray-200">
                <div className={cn('h-2 rounded-full transition-all', color)} style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs font-semibold text-gray-900">{count} mahsulot ({pct}%)</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-400">
        <Users className="h-4 w-4" />
        Kassirlar, soatlik faollik va harakatsiz tovar — backend endpoint tayyor bo'lgach ko'rinadi
      </div>
    </div>
  );
}
