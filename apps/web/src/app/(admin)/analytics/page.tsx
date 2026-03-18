'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  TrendingUp, Package, Users, AlertTriangle, Layers, Activity,
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import {
  useAnalyticsSalesTrend,
  useAnalyticsTopProducts,
  useAnalyticsDeadStock,
  useAnalyticsMargin,
  useAnalyticsAbc,
  useAnalyticsCashierPerf,
  useAnalyticsHeatmap,
} from '@/hooks/analytics/useAnalytics';

const DOW_LABELS = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Sh', 'Sha'];
const MARGIN_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899', '#06b6d4'];
const ABC_COLORS: Record<'A' | 'B' | 'C', string> = { A: '#10b981', B: '#f59e0b', C: '#9ca3af' };

type Tab = 'trend' | 'products' | 'margin' | 'cashiers' | 'heatmap' | 'deadstock' | 'abc';

const TABS: { key: Tab; label: string }[] = [
  { key: 'trend', label: 'Sotuv trendi' },
  { key: 'products', label: 'Top mahsulotlar' },
  { key: 'margin', label: 'Marja tahlili' },
  { key: 'abc', label: 'ABC tahlil' },
  { key: 'cashiers', label: 'Kassirlar' },
  { key: 'heatmap', label: 'Soatlik faollik' },
  { key: 'deadstock', label: 'Harakatsiz tovar' },
];

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <Activity className="h-10 w-10 text-gray-200" />
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('trend');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);

  const { data: trend = [], isLoading: loadingTrend } = useAnalyticsSalesTrend(period, days);
  const { data: topProducts = [], isLoading: loadingProducts } = useAnalyticsTopProducts(days);
  const { data: deadStock = [], isLoading: loadingDead } = useAnalyticsDeadStock(90);
  const { data: marginData = [], isLoading: loadingMargin } = useAnalyticsMargin(days);
  const { data: abcData = [], isLoading: loadingAbc } = useAnalyticsAbc(days);
  const { data: cashiers = [], isLoading: loadingCashiers } = useAnalyticsCashierPerf(days);
  const { data: heatmap = [], isLoading: loadingHeatmap } = useAnalyticsHeatmap(days);

  // KPI from trend
  const totalRevenue = trend.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalOrders = trend.reduce((s, d) => s + (d.orders ?? 0), 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const avgBasket =
    trend.length > 0
      ? Math.round(trend.reduce((s, d) => s + (d.avgBasket ?? 0), 0) / trend.length)
      : 0;

  // Heatmap grid: 7 days x 24 hours
  const heatmapMax = heatmap.reduce((m, c) => Math.max(m, c.ordersCount), 1);
  const heatmapGrid: Record<string, number> = {};
  heatmap.forEach((c) => {
    heatmapGrid[`${c.dow}-${c.hour}`] = c.ordersCount;
  });

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Analitika</h1>
          <p className="mt-0.5 text-sm text-gray-500">Real vaqt biznes tahlili</p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDays(d)}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-sm font-medium transition',
                days === d
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:bg-gray-50',
              )}
            >
              {d} kun
            </button>
          ))}
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: `Daromad (${days} kun)`, value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Buyurtmalar', value: `${totalOrders} ta`, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: "O'rtacha chek", value: formatPrice(avgCheck), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: "O'rtacha savatcha", value: formatPrice(avgBasket), icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
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

        {/* TREND */}
        {tab === 'trend' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Sotuv trendi</h2>
              <div className="flex gap-1">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition',
                      period === p
                        ? 'bg-blue-600 text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50',
                    )}
                  >
                    {p === 'daily' ? 'Kunlik' : p === 'weekly' ? 'Haftalik' : 'Oylik'}
                  </button>
                ))}
              </div>
            </div>
            {loadingTrend ? (
              <LoadingSkeleton variant="line" className="h-64" />
            ) : trend.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart
                  data={trend.map((d) => ({
                    ...d,
                    date: d.period
                      ? new Date(d.period).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
                      : '',
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(trend.length / 8))}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip formatter={(v) => formatPrice(Number(v))} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    name="Daromad"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="avgBasket"
                    name="O'rt. chek"
                    stroke="#8b5cf6"
                    strokeWidth={1.5}
                    dot={false}
                    strokeDasharray="4 2"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* TOP PRODUCTS */}
        {tab === 'products' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Top mahsulotlar</h2>
            {loadingProducts ? (
              <LoadingSkeleton variant="table" rows={6} />
            ) : topProducts.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <>
                <ResponsiveContainer
                  width="100%"
                  height={Math.max(200, topProducts.length * 36)}
                >
                  <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                    <XAxis
                      type="number"
                      tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="productName"
                      tick={{ fontSize: 11 }}
                      width={140}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Mahsulot', 'Sotildi', 'Daromad', 'Marja'].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {topProducts.map((p) => (
                      <tr key={p.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{p.productName}</td>
                        <td className="px-4 py-2 text-gray-600">{Number(p.qtySold).toFixed(1)} dona</td>
                        <td className="px-4 py-2 font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                        <td className="px-4 py-2 text-green-600 font-medium">{formatPrice(p.margin)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* MARGIN */}
        {tab === 'margin' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Marja tahlili (mahsulot bo'yicha)
            </h2>
            {loadingMargin ? (
              <LoadingSkeleton variant="table" rows={6} />
            ) : marginData.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={marginData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis
                      dataKey="productName"
                      tick={{ fontSize: 10 }}
                      tickLine={false}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={50}
                    />
                    <YAxis
                      tickFormatter={(v) => `${Number(v)}%`}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      formatter={(v, name) =>
                        name === 'Marja %' ? `${Number(v).toFixed(1)}%` : formatPrice(Number(v))
                      }
                    />
                    <Bar dataKey="marginPct" name="Marja %" radius={[4, 4, 0, 0]}>
                      {marginData.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={MARGIN_COLORS[i % MARGIN_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Mahsulot', 'Kategoriya', 'Daromad', 'Narx', 'Foyda', 'Marja %'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {marginData.map((m) => (
                      <tr key={m.productId} className="hover:bg-gray-50">
                        <td className="px-3 py-2 font-medium text-gray-900">{m.productName}</td>
                        <td className="px-3 py-2 text-gray-500 text-xs">{m.categoryName ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-900">{formatPrice(m.revenue)}</td>
                        <td className="px-3 py-2 text-gray-500">{formatPrice(m.costTotal)}</td>
                        <td className="px-3 py-2 text-green-600 font-medium">{formatPrice(m.grossProfit)}</td>
                        <td className="px-3 py-2">
                          <span
                            className={cn(
                              'font-bold',
                              m.marginPct >= 30
                                ? 'text-green-600'
                                : m.marginPct >= 15
                                  ? 'text-amber-600'
                                  : 'text-red-500',
                            )}
                          >
                            {Number(m.marginPct).toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* ABC */}
        {tab === 'abc' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              ABC tahlil (daromad bo'yicha)
            </h2>
            {loadingAbc ? (
              <LoadingSkeleton variant="table" rows={4} />
            ) : abcData.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  {abcData.map((g) => (
                    <div
                      key={g.group}
                      className="rounded-xl border p-4"
                      style={{
                        borderColor: ABC_COLORS[g.group] + '40',
                        backgroundColor: ABC_COLORS[g.group] + '08',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-2xl font-black" style={{ color: ABC_COLORS[g.group] }}>
                          {g.group}
                        </span>
                        <span className="text-xs font-medium text-gray-500">
                          {g.products.length} mahsulot
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(g.totalRevenue)}</p>
                      <p className="text-xs text-gray-500">{Number(g.revenueShare).toFixed(1)}% daromad</p>
                    </div>
                  ))}
                </div>
                {abcData.map((g) => (
                  <div key={g.group}>
                    <h3 className="mb-2 text-xs font-semibold uppercase text-gray-500">
                      Guruh {g.group}
                    </h3>
                    <div className="overflow-hidden rounded-lg border border-gray-100">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-50">
                          {g.products.slice(0, 5).map((p) => (
                            <tr key={p.productId} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{p.productName}</td>
                              <td className="px-3 py-2 text-right font-semibold text-gray-900">
                                {formatPrice(p.revenue)}
                              </td>
                              <td className="px-3 py-2 text-right text-xs text-gray-500">
                                {Number(p.pct).toFixed(1)}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* CASHIERS */}
        {tab === 'cashiers' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Kassirlar samaradorligi</h2>
            {loadingCashiers ? (
              <LoadingSkeleton variant="table" rows={4} />
            ) : cashiers.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={cashiers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} />
                    <YAxis
                      tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip formatter={(v) => formatPrice(Number(v))} />
                    <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <table className="mt-4 w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Kassir", "Buyurtmalar", "Daromad", "O'rt. chek", "Qaytarishlar"].map((h) => (
                        <th key={h} className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {cashiers.map((c) => (
                      <tr key={c.userId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                        <td className="px-4 py-2 text-gray-600">{c.ordersCount} ta</td>
                        <td className="px-4 py-2 font-semibold">{formatPrice(c.revenue)}</td>
                        <td className="px-4 py-2 text-gray-600">{formatPrice(c.avgBasket)}</td>
                        <td className="px-4 py-2">
                          <span
                            className={cn(
                              'font-medium',
                              c.returnsCount > 0 ? 'text-red-600' : 'text-gray-400',
                            )}
                          >
                            {c.returnsCount} ta
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}

        {/* HEATMAP */}
        {tab === 'heatmap' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Soatlik faollik (buyurtmalar soni)
            </h2>
            {loadingHeatmap ? (
              <LoadingSkeleton variant="line" className="h-48" />
            ) : heatmap.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="flex gap-1 mb-1 ml-12">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} className="w-7 text-center text-xs text-gray-400">
                        {h}
                      </div>
                    ))}
                  </div>
                  {DOW_LABELS.map((dow, di) => (
                    <div key={dow} className="flex items-center gap-1 mb-1">
                      <div className="w-10 text-right text-xs text-gray-500 pr-2">{dow}</div>
                      {Array.from({ length: 24 }, (_, h) => {
                        const count = heatmapGrid[`${di}-${h}`] ?? 0;
                        const intensity = count / heatmapMax;
                        return (
                          <div
                            key={h}
                            title={`${dow} ${h}:00 — ${count} buyurtma`}
                            className="w-7 h-7 rounded"
                            style={{
                              backgroundColor:
                                count === 0
                                  ? '#f3f4f6'
                                  : `rgba(59, 130, 246, ${0.1 + intensity * 0.9})`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                    <span>Kam</span>
                    <div className="flex gap-1">
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                        <div
                          key={op}
                          className="w-5 h-5 rounded"
                          style={{ backgroundColor: `rgba(59, 130, 246, ${op})` }}
                        />
                      ))}
                    </div>
                    <span>Ko'p</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEADSTOCK */}
        {tab === 'deadstock' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Harakatsiz tovarlar (90+ kun sotilmagan)
            </h2>
            {loadingDead ? (
              <LoadingSkeleton variant="table" rows={5} />
            ) : deadStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <Package className="h-10 w-10 text-green-300" />
                <p className="text-sm text-green-600 font-medium">Barcha tovarlar faol!</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  {deadStock.length} ta mahsulot 90+ kun sotilmagan. Umumiy zararli zaxira:{' '}
                  {formatPrice(deadStock.reduce((s, d) => s + d.carryingCost, 0))}
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Mahsulot", "SKU", "Zaxira", "So'nggi sotuv", "Dam olgan kun", "Narxlar"].map(
                        (h) => (
                          <th
                            key={h}
                            className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500"
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {deadStock.map((d) => (
                      <tr key={d.productId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 font-medium text-gray-900">{d.productName}</td>
                        <td className="px-4 py-2 font-mono text-xs text-gray-500">{d.sku ?? '—'}</td>
                        <td className="px-4 py-2 text-gray-600">{Number(d.totalStock).toFixed(1)}</td>
                        <td className="px-4 py-2 text-gray-500 text-xs">
                          {d.lastSoldAt
                            ? new Date(d.lastSoldAt).toLocaleDateString('uz-UZ')
                            : 'Hech qachon'}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className={cn(
                              'font-semibold',
                              d.daysIdle >= 180
                                ? 'text-red-600'
                                : d.daysIdle >= 90
                                  ? 'text-amber-600'
                                  : 'text-gray-600',
                            )}
                          >
                            {d.daysIdle} kun
                          </span>
                        </td>
                        <td className="px-4 py-2 text-gray-600">{formatPrice(d.carryingCost)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        )}
      </div>

      {/* ABC summary bar — shown on all tabs except abc itself */}
      {!loadingAbc && abcData.length > 0 && tab !== 'abc' && (
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">ABC — tezkor ko'rinish</h3>
          </div>
          <div className="flex gap-3">
            {abcData.map((g) => (
              <div
                key={g.group}
                className="flex-1 rounded-lg border border-gray-100 bg-gray-50 p-3 text-center"
              >
                <span className="text-xl font-black" style={{ color: ABC_COLORS[g.group] }}>
                  {g.group}
                </span>
                <p className="text-xs text-gray-500 mt-1">{g.products.length} mahsulot</p>
                <p className="text-xs font-medium text-gray-700">
                  {Number(g.revenueShare).toFixed(0)}% daromad
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
