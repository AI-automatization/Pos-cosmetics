'use client';

import { useState, useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  TrendingUp, Package, Users, AlertTriangle, Layers, Activity,
  X, Search, ShoppingCart, DollarSign, BarChart3,
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useBranches } from '@/hooks/settings/useBranches';
import {
  useAnalyticsSalesTrend,
  useAnalyticsTopProducts,
  useAnalyticsDeadStock,
  useAnalyticsMargin,
  useAnalyticsAbc,
  useAnalyticsCashierPerf,
  useAnalyticsHeatmap,
} from '@/hooks/analytics/useAnalytics';

/* ─── Constants ─── */

const DOW_LABELS = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Sh', 'Sha'];

const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#2563eb',
];

const ABC_COLORS: Record<'A' | 'B' | 'C', string> = {
  A: '#22c55e', B: '#f59e0b', C: '#94a3b8',
};

type Tab = 'trend' | 'products' | 'margin' | 'cashiers' | 'heatmap' | 'deadstock' | 'abc';

const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'trend', label: 'Sotuv trendi', icon: TrendingUp },
  { key: 'products', label: 'Top mahsulotlar', icon: BarChart3 },
  { key: 'margin', label: 'Marja', icon: DollarSign },
  { key: 'abc', label: 'ABC tahlil', icon: Layers },
  { key: 'cashiers', label: 'Kassirlar', icon: Users },
  { key: 'heatmap', label: 'Soatlik', icon: Activity },
  { key: 'deadstock', label: 'Harakatsiz', icon: AlertTriangle },
];

/* ─── Custom Tooltip ─── */

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-xs text-gray-600">{p.name}:</span>
          <span className="text-xs font-bold text-gray-900">{formatPrice(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Cashier Avatar ─── */

function CashierAvatar({ name, rank }: { name: string | null | undefined; rank: number }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const colors = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-fuchsia-500',
  ];
  const color = colors[(name ?? '?').charCodeAt(0) % colors.length];

  return (
    <div className="relative">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-md',
          color,
        )}
      >
        {initials}
      </div>
      {rank <= 3 && (
        <span className={cn(
          'absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow',
          rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700',
        )}>
          {rank}
        </span>
      )}
    </div>
  );
}

/* ─── Empty State ─── */

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
        <Activity className="h-7 w-7 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}

/* ─── Page ─── */

export default function AnalyticsPage() {
  const [tab, setTab] = useState<Tab>('trend');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);
  const [branchId, setBranchId] = useState('');
  const [productsSearch, setProductsSearch] = useState('');
  const [cashiersSearch, setCashiersSearch] = useState('');
  const [deadstockSearch, setDeadstockSearch] = useState('');

  const { data: branches = [] } = useBranches();
  const branchOptions = [
    { value: '', label: 'Barcha filiallar' },
    ...branches.map((b) => ({ value: b.id, label: b.name })),
  ];
  const bid = branchId || undefined;

  const { data: trend = [], isLoading: loadingTrend } = useAnalyticsSalesTrend(period, days, bid);
  const { data: topProducts = [], isLoading: loadingProducts } = useAnalyticsTopProducts(days, 'revenue', 20, bid);
  const { data: deadStock = [], isLoading: loadingDead } = useAnalyticsDeadStock(90, bid);
  const { data: marginData = [], isLoading: loadingMargin } = useAnalyticsMargin(days, bid);
  const { data: abcData = [], isLoading: loadingAbc } = useAnalyticsAbc(days, bid);
  const { data: cashiers = [], isLoading: loadingCashiers } = useAnalyticsCashierPerf(days, bid);
  const { data: heatmap = [], isLoading: loadingHeatmap } = useAnalyticsHeatmap(days, bid);

  const totalRevenue = trend.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalOrders = trend.reduce((s, d) => s + (d.orders ?? 0), 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const avgBasket = trend.length > 0
    ? Math.round(trend.reduce((s, d) => s + (d.avgBasket ?? 0), 0) / trend.length)
    : 0;

  const heatmapMax = heatmap.reduce((m, c) => Math.max(m, c.ordersCount), 1);
  const heatmapGrid: Record<string, number> = {};
  heatmap.forEach((c) => { heatmapGrid[`${c.dow}-${c.hour}`] = c.ordersCount; });

  /* Products pagination */
  const [productsPage, setProductsPage] = useState(0);
  const PRODUCTS_PER_PAGE = 10;
  const filteredProducts = useMemo(() =>
    topProducts.filter((p) =>
      !productsSearch || p.productName.toLowerCase().includes(productsSearch.toLowerCase())
    ), [topProducts, productsSearch]);
  const productsPageCount = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const pagedProducts = filteredProducts.slice(
    productsPage * PRODUCTS_PER_PAGE,
    (productsPage + 1) * PRODUCTS_PER_PAGE,
  );

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">Analitika</h1>
            <p className="mt-1 text-sm text-gray-500">Biznes ko&apos;rsatkichlari va tahlil</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchableDropdown
              options={branchOptions}
              value={branchId}
              onChange={setBranchId}
              placeholder="Barcha filiallar"
              clearable={branchId !== ''}
              searchable={branches.length > 3}
              className="w-52"
            />
            <div className="flex rounded-xl bg-gray-100 p-1">
              {([7, 30, 90] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDays(d)}
                  className={cn(
                    'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                    days === d
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700',
                  )}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Active branch */}
        {branchId && (
          <div className="flex items-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <p className="text-sm font-medium text-indigo-700">
              {branchOptions.find((b) => b.value === branchId)?.label}
            </p>
            <button type="button" onClick={() => setBranchId('')} className="ml-auto text-indigo-400 hover:text-indigo-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* ── KPI Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: 'Umumiy daromad', value: formatPrice(totalRevenue), sub: `${days} kun`, icon: TrendingUp, gradient: 'from-indigo-500 to-blue-600' },
            { label: 'Buyurtmalar', value: totalOrders.toLocaleString(), sub: 'ta', icon: ShoppingCart, gradient: 'from-violet-500 to-purple-600' },
            { label: "O'rtacha chek", value: formatPrice(avgCheck), sub: 'buyurtma', icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
            { label: "O'rtacha savatcha", value: formatPrice(avgBasket), sub: 'buyurtma', icon: Package, gradient: 'from-amber-500 to-orange-600' },
          ].map(({ label, value, sub, icon: Icon, gradient }) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100 transition hover:shadow-md">
              <div className={cn('absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br opacity-10 transition group-hover:opacity-20', gradient)} />
              <div className={cn('mb-3 inline-flex rounded-xl bg-gradient-to-br p-2.5 text-white shadow-sm', gradient)}>
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
              <p className="text-[11px] text-gray-400">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Tab Navigation ── */}
        <div className="flex gap-1 overflow-x-auto rounded-2xl bg-gray-100 p-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                type="button"
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  tab === t.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">

          {/* === TREND === */}
          {tab === 'trend' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-gray-900">Sotuv trendi</h2>
                <div className="flex rounded-lg bg-gray-100 p-0.5">
                  {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPeriod(p)}
                      className={cn(
                        'rounded-md px-3 py-1 text-xs font-medium transition',
                        period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
                      )}
                    >
                      {p === 'daily' ? 'Kunlik' : p === 'weekly' ? 'Haftalik' : 'Oylik'}
                    </button>
                  ))}
                </div>
              </div>
              {loadingTrend ? (
                <LoadingSkeleton variant="line" className="h-72" />
              ) : trend.length === 0 ? (
                <EmptyState label="Ma'lumotlar topilmadi" />
              ) : (
                <ResponsiveContainer width="100%" height={340}>
                  <AreaChart
                    data={trend.map((d) => ({
                      ...d,
                      date: d.period
                        ? new Date(d.period).toLocaleDateString('uz-UZ', { month: 'short', day: 'numeric' })
                        : '',
                    }))}
                  >
                    <defs>
                      <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradBasket" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      interval={Math.max(0, Math.floor(trend.length / 8))}
                    />
                    <YAxis
                      tickFormatter={(v) => {
                        const n = Number(v);
                        return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
                      }}
                      tick={{ fontSize: 11, fill: '#94a3b8' }}
                      tickLine={false}
                      axisLine={false}
                      width={50}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                    <Area type="monotone" dataKey="revenue" name="Daromad" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
                    <Area type="monotone" dataKey="avgBasket" name="O'rt. chek" stroke="#8b5cf6" strokeWidth={1.5} fill="url(#gradBasket)" dot={false} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* === TOP PRODUCTS === */}
          {tab === 'products' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">
                  Top mahsulotlar
                  <span className="ml-2 text-xs font-normal text-gray-400">({filteredProducts.length} ta)</span>
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={productsSearch}
                    onChange={(e) => { setProductsSearch(e.target.value); setProductsPage(0); }}
                    placeholder="Qidirish..."
                    className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition w-56"
                  />
                </div>
              </div>
              {loadingProducts ? (
                <LoadingSkeleton variant="table" rows={6} />
              ) : filteredProducts.length === 0 ? (
                <EmptyState label="Ma'lumotlar topilmadi" />
              ) : (
                <>
                  {/* Chart */}
                  <ResponsiveContainer width="100%" height={Math.min(400, pagedProducts.length * 40 + 40)}>
                    <BarChart data={pagedProducts} layout="vertical" margin={{ left: 0, right: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => {
                          const n = Number(v);
                          return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
                        }}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis type="category" dataKey="productName" tick={{ fontSize: 12, fill: '#475569' }} width={150} tickLine={false} axisLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="revenue" name="Daromad" radius={[0, 8, 8, 0]} barSize={24}>
                        {pagedProducts.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>

                  {/* Table */}
                  <div className="overflow-hidden rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {['#', 'Mahsulot', 'Sotildi', 'Daromad', 'Marja'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {pagedProducts.map((p, i) => (
                          <tr key={p.productId} className="transition hover:bg-gray-50/80">
                            <td className="px-4 py-3">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-500">
                                {productsPage * PRODUCTS_PER_PAGE + i + 1}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-medium text-gray-900">{p.productName}</td>
                            <td className="px-4 py-3 text-gray-500">{Number(p.qtySold).toFixed(0)} dona</td>
                            <td className="px-4 py-3 font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                            <td className="px-4 py-3">
                              <span className="font-semibold text-emerald-600">{formatPrice(p.margin)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {productsPageCount > 1 && (
                    <div className="flex items-center justify-center gap-1 pt-2">
                      {Array.from({ length: productsPageCount }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setProductsPage(i)}
                          className={cn(
                            'h-8 w-8 rounded-lg text-sm font-medium transition',
                            productsPage === i
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'text-gray-500 hover:bg-gray-100',
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* === MARGIN === */}
          {tab === 'margin' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Marja tahlili</h2>
              {loadingMargin ? (
                <LoadingSkeleton variant="table" rows={6} />
              ) : marginData.length === 0 ? (
                <EmptyState label="Ma'lumotlar topilmadi" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={marginData.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="productName" tick={{ fontSize: 10, fill: '#94a3b8' }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={55} />
                      <YAxis tickFormatter={(v) => `${Number(v)}%`} tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                        formatter={(v, name) =>
                          name === 'Marja %' ? `${Number(v).toFixed(1)}%` : formatPrice(Number(v))
                        }
                      />
                      <Bar dataKey="marginPct" name="Marja %" radius={[8, 8, 0, 0]} barSize={32}>
                        {marginData.slice(0, 10).map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="max-h-80 overflow-y-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          {['Mahsulot', 'Kategoriya', 'Daromad', 'Tannarx', 'Foyda', 'Marja'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {marginData.map((m) => (
                          <tr key={m.productId} className="transition hover:bg-gray-50/80">
                            <td className="px-4 py-3 font-medium text-gray-900">{m.productName}</td>
                            <td className="px-4 py-3 text-xs text-gray-400">{m.categoryName ?? '—'}</td>
                            <td className="px-4 py-3 text-gray-900">{formatPrice(m.revenue)}</td>
                            <td className="px-4 py-3 text-gray-500">{formatPrice(m.costTotal)}</td>
                            <td className="px-4 py-3 font-medium text-emerald-600">{formatPrice(m.grossProfit)}</td>
                            <td className="px-4 py-3">
                              <span
                                className={cn(
                                  'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                                  m.marginPct >= 30 ? 'bg-emerald-50 text-emerald-700'
                                    : m.marginPct >= 15 ? 'bg-amber-50 text-amber-700'
                                    : 'bg-red-50 text-red-600',
                                )}
                              >
                                {Number(m.marginPct).toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

          {/* === ABC === */}
          {tab === 'abc' && (
            <div className="space-y-5">
              <h2 className="text-base font-semibold text-gray-900">ABC tahlil</h2>
              {loadingAbc ? (
                <LoadingSkeleton variant="table" rows={4} />
              ) : abcData.length === 0 ? (
                <EmptyState label="Ma'lumotlar topilmadi" />
              ) : (
                <>
                  {/* Donut + cards */}
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={abcData.map((g) => ({ name: `Guruh ${g.group}`, value: g.totalRevenue ?? 0 }))}
                            cx="50%"
                            cy="50%"
                            innerRadius={65}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            strokeWidth={0}
                          >
                            {abcData.map((g) => (
                              <Cell key={g.group} fill={ABC_COLORS[g.group]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.08)' }}
                            formatter={(v) => formatPrice(Number(v))}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col justify-center gap-3">
                      {abcData.map((g) => (
                        <div
                          key={g.group}
                          className="flex items-center gap-4 rounded-2xl border p-4 transition hover:shadow-md"
                          style={{ borderColor: ABC_COLORS[g.group] + '40' }}
                        >
                          <span className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl font-black text-white shadow-sm"
                            style={{ backgroundColor: ABC_COLORS[g.group] }}
                          >
                            {g.group}
                          </span>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(g.totalRevenue ?? 0)}</p>
                            <p className="text-xs text-gray-500">{(g.products ?? []).length} mahsulot</p>
                          </div>
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                            {Number(g.revenueShare).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Product lists */}
                  {abcData.map((g) => (
                    <div key={g.group}>
                      <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ABC_COLORS[g.group] }} />
                        Guruh {g.group}
                      </h3>
                      <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-100">
                        <table className="w-full text-sm">
                          <tbody className="divide-y divide-gray-50">
                            {(g.products ?? []).slice(0, 8).map((p) => (
                              <tr key={p.productId} className="transition hover:bg-gray-50/80">
                                <td className="px-4 py-2.5 font-medium text-gray-900">{p.productName}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                                <td className="px-4 py-2.5 text-right text-xs text-gray-400">{Number(p.pct).toFixed(1)}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          )}

          {/* === CASHIERS === */}
          {tab === 'cashiers' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Kassirlar samaradorligi</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={cashiersSearch}
                    onChange={(e) => setCashiersSearch(e.target.value)}
                    placeholder="Qidirish..."
                    className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition w-48"
                  />
                </div>
              </div>
              {loadingCashiers ? (
                <LoadingSkeleton variant="table" rows={4} />
              ) : cashiers.length === 0 ? (
                <EmptyState label="Ma'lumotlar topilmadi" />
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={cashiers}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} angle={-30} textAnchor="end" height={60} interval={0} />
                      <YAxis
                        tickFormatter={(v) => {
                          const n = Number(v);
                          return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : `${(n / 1_000).toFixed(0)}K`;
                        }}
                        tick={{ fontSize: 11, fill: '#94a3b8' }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<ChartTooltip />} />
                      <Bar dataKey="revenue" name="Daromad" radius={[8, 8, 0, 0]} barSize={28}>
                        {cashiers.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
                    {cashiers
                      .filter((c) =>
                        !cashiersSearch || (c.name ?? '').toLowerCase().includes(cashiersSearch.toLowerCase())
                      )
                      .map((c, idx) => (
                        <div
                          key={c.userId}
                          className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4 transition hover:bg-gray-50 hover:shadow-sm"
                        >
                          <CashierAvatar name={c.name} rank={idx + 1} />
                          <div className="min-w-[140px] flex-1">
                            <p className="text-sm font-bold text-gray-900">{c.name ?? '—'}</p>
                            <p className="text-xs text-gray-400">{c.ordersCount} buyurtma</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-gray-900">{formatPrice(c.revenue)}</p>
                            <p className="text-xs text-gray-400">O&apos;rt: {formatPrice(c.avgBasket)}</p>
                          </div>
                          {c.returnsCount > 0 && (
                            <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600">
                              -{c.returnsCount}
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}

          {/* === HEATMAP === */}
          {tab === 'heatmap' && (
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-gray-900">Soatlik faoliyat xaritasi</h2>
              {loadingHeatmap ? (
                <LoadingSkeleton variant="line" className="h-56" />
              ) : heatmap.length === 0 ? (
                <EmptyState label="Ma'lumotlar topilmadi" />
              ) : (
                <div className="overflow-x-auto">
                  <div className="min-w-max">
                    <div className="mb-1.5 ml-14 flex gap-1">
                      {Array.from({ length: 24 }, (_, h) => (
                        <div key={h} className="w-8 text-center text-[10px] font-medium text-gray-400">{h}:00</div>
                      ))}
                    </div>
                    {DOW_LABELS.map((dow, di) => (
                      <div key={dow} className="mb-1 flex items-center gap-1">
                        <div className="w-12 pr-2 text-right text-xs font-medium text-gray-500">{dow}</div>
                        {Array.from({ length: 24 }, (_, h) => {
                          const count = heatmapGrid[`${di}-${h}`] ?? 0;
                          const intensity = count / heatmapMax;
                          return (
                            <div
                              key={h}
                              title={`${dow} ${h}:00 — ${count} buyurtma`}
                              className="h-8 w-8 rounded-lg transition-all hover:scale-110 hover:shadow-sm"
                              style={{
                                backgroundColor: count === 0
                                  ? '#f8fafc'
                                  : `rgba(99, 102, 241, ${0.1 + intensity * 0.85})`,
                              }}
                            />
                          );
                        })}
                      </div>
                    ))}
                    <div className="mt-4 ml-14 flex items-center gap-2 text-xs text-gray-400">
                      <span>Kam</span>
                      <div className="flex gap-0.5">
                        {[0.1, 0.25, 0.45, 0.65, 0.85].map((op) => (
                          <div
                            key={op}
                            className="h-5 w-5 rounded-md"
                            style={{ backgroundColor: `rgba(99, 102, 241, ${op})` }}
                          />
                        ))}
                      </div>
                      <span>Ko&apos;p</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* === DEADSTOCK === */}
          {tab === 'deadstock' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-gray-900">Harakatsiz tovarlar</h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={deadstockSearch}
                    onChange={(e) => setDeadstockSearch(e.target.value)}
                    placeholder="Qidirish..."
                    className="rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition w-48"
                  />
                </div>
              </div>
              {loadingDead ? (
                <LoadingSkeleton variant="table" rows={5} />
              ) : deadStock.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                    <Package className="h-8 w-8 text-emerald-400" />
                  </div>
                  <p className="text-sm font-semibold text-emerald-600">Barcha tovarlar faol!</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-5 py-3.5">
                    <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500" />
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        {deadStock.length} ta mahsulot 90+ kun sotilmagan
                      </p>
                      <p className="text-xs text-amber-600">
                        Umumiy zarar: {formatPrice(deadStock.reduce((s, d) => s + d.carryingCost, 0))}
                      </p>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto rounded-xl border border-gray-100">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-gray-50">
                        <tr>
                          {['Mahsulot', 'SKU', 'Zaxira', "So'nggi sotuv", 'Dam olgan', 'Zarar'].map((h) => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {deadStock
                          .filter((d) =>
                            !deadstockSearch || d.productName.toLowerCase().includes(deadstockSearch.toLowerCase())
                          )
                          .map((d) => (
                            <tr key={d.productId} className="transition hover:bg-gray-50/80">
                              <td className="px-4 py-3 font-medium text-gray-900">{d.productName}</td>
                              <td className="px-4 py-3 font-mono text-xs text-gray-400">{d.sku ?? '—'}</td>
                              <td className="px-4 py-3 text-gray-600">{Number(d.totalStock).toFixed(0)}</td>
                              <td className="px-4 py-3 text-xs text-gray-400">
                                {d.lastSoldAt ? new Date(d.lastSoldAt).toLocaleDateString('uz-UZ') : 'Hech qachon'}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={cn(
                                    'inline-flex rounded-full px-2.5 py-1 text-xs font-bold',
                                    d.daysIdle >= 180 ? 'bg-red-50 text-red-600'
                                      : d.daysIdle >= 90 ? 'bg-amber-50 text-amber-600'
                                      : 'bg-gray-100 text-gray-600',
                                  )}
                                >
                                  {d.daysIdle} kun
                                </span>
                              </td>
                              <td className="px-4 py-3 font-medium text-red-600">{formatPrice(d.carryingCost)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}

        </div>

        {/* ── ABC Quick Summary (when not on ABC tab) ── */}
        {!loadingAbc && abcData.length > 0 && tab !== 'abc' && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">ABC — tezkor ko&apos;rinish</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {abcData.map((g) => (
                <div
                  key={g.group}
                  className="rounded-xl border p-4 text-center transition hover:shadow-sm"
                  style={{
                    borderColor: ABC_COLORS[g.group] + '30',
                    backgroundColor: ABC_COLORS[g.group] + '08',
                  }}
                >
                  <span className="text-2xl font-black" style={{ color: ABC_COLORS[g.group] }}>
                    {g.group}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">{(g.products ?? []).length} mahsulot</p>
                  <p className="text-xs font-bold text-gray-700">
                    {Number(g.revenueShare).toFixed(0)}%
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
