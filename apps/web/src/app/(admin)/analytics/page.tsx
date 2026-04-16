'use client';

import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from 'recharts';
import {
  TrendingUp, Package, Users, AlertTriangle, Layers, Activity, X, Search,
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
  { key: 'heatmap', label: 'Soatlik faoliyat' },
  { key: 'deadstock', label: 'Harakatsiz tovar' },
];

/* ─── CashierAvatar ─── */

function CashierAvatar({ name }: { name: string }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const AVATAR_COLORS = [
    'from-blue-500 to-blue-600',
    'from-violet-500 to-violet-600',
    'from-emerald-500 to-emerald-600',
    'from-amber-500 to-amber-600',
    'from-pink-500 to-pink-600',
    'from-cyan-500 to-cyan-600',
  ];
  const color = AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-sm',
        color,
      )}
    >
      {initials}
    </div>
  );
}

/* ─── EmptyState ─── */

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <Activity className="h-6 w-6 text-gray-300" />
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
  const { data: topProducts = [], isLoading: loadingProducts } = useAnalyticsTopProducts(days, 'revenue', 10, bid);
  const { data: deadStock = [], isLoading: loadingDead } = useAnalyticsDeadStock(90, bid);
  const { data: marginData = [], isLoading: loadingMargin } = useAnalyticsMargin(days, bid);
  const { data: abcData = [], isLoading: loadingAbc } = useAnalyticsAbc(days, bid);
  const { data: cashiers = [], isLoading: loadingCashiers } = useAnalyticsCashierPerf(days, bid);
  const { data: heatmap = [], isLoading: loadingHeatmap } = useAnalyticsHeatmap(days, bid);

  const totalRevenue = trend.reduce((s, d) => s + (d.revenue ?? 0), 0);
  const totalOrders = trend.reduce((s, d) => s + (d.orders ?? 0), 0);
  const avgCheck = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;
  const avgBasket =
    trend.length > 0
      ? Math.round(trend.reduce((s, d) => s + (d.avgBasket ?? 0), 0) / trend.length)
      : 0;

  const heatmapMax = heatmap.reduce((m, c) => Math.max(m, c.ordersCount), 1);
  const heatmapGrid: Record<string, number> = {};
  heatmap.forEach((c) => {
    heatmapGrid[`${c.dow}-${c.hour}`] = c.ordersCount;
  });

  return (
    <div className="flex flex-col gap-5 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Analitika</h1>
          <p className="mt-0.5 text-sm text-gray-500">Real vaqt biznes tahlili</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Branch filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-medium text-gray-500">Filial:</span>
            <SearchableDropdown
              options={branchOptions}
              value={branchId}
              onChange={setBranchId}
              placeholder="Barcha filiallar"
              clearable={branchId !== ''}
              searchable={branches.length > 3}
              className="w-56"
            />
          </div>
          {/* Days filter */}
          <div className="flex gap-1 rounded-xl border border-gray-200 bg-white p-1 shadow-sm">
            {([7, 30, 90] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium transition',
                  days === d
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                )}
              >
                {d} kun
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Active branch banner */}
      {branchId && (
        <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5">
          <span className="h-2 w-2 rounded-full bg-blue-500" />
          <p className="text-sm font-medium text-blue-700">
            {branchOptions.find((b) => b.value === branchId)?.label ?? 'Filial'} bo'yicha ko'rsatilmoqda
          </p>
          <button
            type="button"
            onClick={() => setBranchId('')}
            className="ml-auto rounded-lg p-0.5 text-blue-400 transition hover:bg-blue-100 hover:text-blue-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: `Daromad (${days} kun)`, value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
          { label: 'Buyurtmalar', value: `${totalOrders} ta`, icon: Package, color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-100' },
          { label: "O'rtacha chek", value: formatPrice(avgCheck), icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
          { label: "O'rtacha savatcha", value: formatPrice(avgBasket), icon: Users, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={cn('rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md', border)}>
            <div className={cn('mb-3 inline-flex rounded-xl p-2', bg)}>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <p className="text-xs font-medium text-gray-500">{label}</p>
            <p className={cn('mt-1 text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto rounded-xl border border-gray-200 bg-gray-50 p-1 w-fit shadow-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition',
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

        {/* TREND */}
        {tab === 'trend' && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Sotuv trendi</h2>
              <div className="flex gap-1 rounded-lg border border-gray-200 p-1">
                {(['daily', 'weekly', 'monthly'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'rounded-md px-2.5 py-1 text-xs font-medium transition',
                      period === p
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-500 hover:bg-gray-50',
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    interval={Math.max(0, Math.floor(trend.length / 8))}
                  />
                  <YAxis
                    tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }}
                    formatter={(v) => formatPrice(Number(v))}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Daromad" stroke="#3b82f6" strokeWidth={2.5} dot={false} />
                  <Line type="monotone" dataKey="avgBasket" name="O'rt. chek" stroke="#8b5cf6" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        )}

        {/* TOP PRODUCTS */}
        {tab === 'products' && (
          <div className="tab-scroll-content custom-scrollbar pr-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Top mahsulotlar</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={productsSearch}
                  onChange={(e) => setProductsSearch(e.target.value)}
                  placeholder="Mahsulot qidirish..."
                  className="rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition"
                />
              </div>
            </div>
            {loadingProducts ? (
              <LoadingSkeleton variant="table" rows={6} />
            ) : topProducts.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <>
                <div className="max-h-[380px] overflow-y-auto pr-1">
                  <ResponsiveContainer width="100%" height={Math.max(200, topProducts.length * 36)}>
                    <BarChart data={topProducts} layout="vertical" margin={{ left: 20, right: 40 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
                      <XAxis
                        type="number"
                        tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                        tick={{ fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis type="category" dataKey="productName" tick={{ fontSize: 11 }} width={140} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                        formatter={(v) => formatPrice(Number(v))}
                      />
                      <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[0, 6, 6, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 max-h-72 overflow-y-auto custom-scrollbar rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="border-b border-gray-100">
                        {['Mahsulot', 'Sotildi', 'Daromad', 'Marja'].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {topProducts
                        .filter((p) =>
                          !productsSearch || p.productName.toLowerCase().includes(productsSearch.toLowerCase())
                        )
                        .map((p) => (
                          <tr key={p.productId} className="transition hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{p.productName}</td>
                            <td className="px-4 py-2.5 text-gray-500">{Number(p.qtySold).toFixed(1)} dona</td>
                            <td className="px-4 py-2.5 font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                            <td className="px-4 py-2.5 font-semibold text-emerald-600">{formatPrice(p.margin)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        )}

        {/* MARGIN */}
        {tab === 'margin' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Marja tahlili (mahsulot bo'yicha)</h2>
            {loadingMargin ? (
              <LoadingSkeleton variant="table" rows={6} />
            ) : marginData.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={marginData.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="productName" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                    <YAxis tickFormatter={(v) => `${Number(v)}%`} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(v, name) =>
                        name === 'Marja %' ? `${Number(v).toFixed(1)}%` : formatPrice(Number(v))
                      }
                    />
                    <Bar dataKey="marginPct" name="Marja %" radius={[6, 6, 0, 0]}>
                      {marginData.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={MARGIN_COLORS[i % MARGIN_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 max-h-72 overflow-y-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="border-b border-gray-100">
                        {['Mahsulot', 'Kategoriya', 'Daromad', 'Narx', 'Foyda', 'Marja %'].map((h) => (
                          <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {marginData.map((m) => (
                        <tr key={m.productId} className="transition hover:bg-gray-50">
                          <td className="px-3 py-2.5 font-medium text-gray-900">{m.productName}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-400">{m.categoryName ?? '—'}</td>
                          <td className="px-3 py-2.5 text-gray-900">{formatPrice(m.revenue)}</td>
                          <td className="px-3 py-2.5 text-gray-500">{formatPrice(m.costTotal)}</td>
                          <td className="px-3 py-2.5 font-medium text-emerald-600">{formatPrice(m.grossProfit)}</td>
                          <td className="px-3 py-2.5">
                            <span
                              className={cn(
                                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
                                m.marginPct >= 30
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : m.marginPct >= 15
                                    ? 'bg-amber-50 text-amber-700'
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

        {/* ABC */}
        {tab === 'abc' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">ABC tahlil (daromad bo'yicha)</h2>
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
                      className="rounded-2xl border p-4 transition hover:shadow-md"
                      style={{
                        borderColor: ABC_COLORS[g.group] + '40',
                        backgroundColor: ABC_COLORS[g.group] + '08',
                      }}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-3xl font-black" style={{ color: ABC_COLORS[g.group] }}>
                          {g.group}
                        </span>
                        <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
                          {(g.products ?? []).length} mahsulot
                        </span>
                      </div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(g.totalRevenue ?? 0)}</p>
                      <p className="text-xs text-gray-500">{Number(g.revenueShare).toFixed(1)}% daromad</p>
                    </div>
                  ))}
                </div>
                {abcData.map((g) => (
                  <div key={g.group}>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                      Guruh {g.group}
                    </h3>
                    <div className="max-h-52 overflow-y-auto rounded-xl border border-gray-100">
                      <table className="w-full text-sm">
                        <tbody className="divide-y divide-gray-50">
                          {(g.products ?? []).slice(0, 5).map((p) => (
                            <tr key={p.productId} className="transition hover:bg-gray-50">
                              <td className="px-3 py-2.5 font-medium text-gray-900">{p.productName}</td>
                              <td className="px-3 py-2.5 text-right font-semibold text-gray-900">{formatPrice(p.revenue)}</td>
                              <td className="px-3 py-2.5 text-right text-xs text-gray-400">{Number(p.pct).toFixed(1)}%</td>
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
          <div className="tab-scroll-content custom-scrollbar pr-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Kassirlar samaradorligi</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={cashiersSearch}
                  onChange={(e) => setCashiersSearch(e.target.value)}
                  placeholder="Kassir qidirish..."
                  className="rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition"
                />
              </div>
            </div>
            {loadingCashiers ? (
              <LoadingSkeleton variant="table" rows={4} />
            ) : cashiers.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={cashiers}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} angle={-35} textAnchor="end" height={60} interval={0} />
                    <YAxis
                      tickFormatter={(v) => `${(Number(v) / 1_000_000).toFixed(1)}M`}
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb' }}
                      formatter={(v) => formatPrice(Number(v))}
                    />
                    <Bar dataKey="revenue" name="Daromad" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                {/* Cashier cards with avatars */}
                <div className="mt-4 space-y-2 pr-1">
                  {cashiers
                    .filter((c) =>
                      !cashiersSearch || c.name.toLowerCase().includes(cashiersSearch.toLowerCase())
                    )
                    .map((c) => (
                      <div
                        key={c.userId}
                        className="flex items-center gap-3 rounded-xl border border-gray-100 p-3 transition hover:bg-gray-50 hover:shadow-sm"
                      >
                        <CashierAvatar name={c.name} />
                        <div className="min-w-[160px] flex-1">
                          <p className="text-sm font-bold text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-400">{c.ordersCount} buyurtma</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{formatPrice(c.revenue)}</p>
                          <p className="text-xs text-gray-400">O&apos;rt: {formatPrice(c.avgBasket)}</p>
                        </div>
                        {c.returnsCount > 0 && (
                          <span className="ml-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
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

        {/* HEATMAP */}
        {tab === 'heatmap' && (
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Soatlik intensivlik (buyurtmalar soni)</h2>
            {loadingHeatmap ? (
              <LoadingSkeleton variant="line" className="h-48" />
            ) : heatmap.length === 0 ? (
              <EmptyState label="Ma'lumotlar topilmadi" />
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-max">
                  <div className="mb-1 ml-12 flex gap-1">
                    {Array.from({ length: 24 }, (_, h) => (
                      <div key={h} className="w-7 text-center text-xs text-gray-400">{h}</div>
                    ))}
                  </div>
                  {DOW_LABELS.map((dow, di) => (
                    <div key={dow} className="mb-1 flex items-center gap-1">
                      <div className="w-10 pr-2 text-right text-xs text-gray-500">{dow}</div>
                      {Array.from({ length: 24 }, (_, h) => {
                        const count = heatmapGrid[`${di}-${h}`] ?? 0;
                        const intensity = count / heatmapMax;
                        return (
                          <div
                            key={h}
                            title={`${dow} ${h}:00 — ${count} buyurtma`}
                            className="h-7 w-7 rounded-md transition hover:scale-110"
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
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                    <span>Kam</span>
                    <div className="flex gap-0.5">
                      {[0.1, 0.3, 0.5, 0.7, 0.9].map((op) => (
                        <div
                          key={op}
                          className="h-5 w-5 rounded"
                          style={{ backgroundColor: `rgba(59, 130, 246, ${op})` }}
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

        {/* DEADSTOCK */}
        {tab === 'deadstock' && (
          <div className="tab-scroll-content custom-scrollbar pr-1">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-gray-900">Harakatsiz tovarlar (90+ kun sotilmagan)</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={deadstockSearch}
                  onChange={(e) => setDeadstockSearch(e.target.value)}
                  placeholder="Tovar qidirish..."
                  className="rounded-lg border border-gray-200 bg-white py-1.5 pl-8 pr-3 text-xs text-gray-900 outline-none placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/20 transition"
                />
              </div>
            </div>
            {loadingDead ? (
              <LoadingSkeleton variant="table" rows={5} />
            ) : deadStock.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-12">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
                  <Package className="h-7 w-7 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-emerald-600">Barcha tovarlar faol!</p>
              </div>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-700">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>
                    {deadStock.length} ta mahsulot 90+ kun sotilmagan. Umumiy zarar:{' '}
                    <strong>{formatPrice(deadStock.reduce((s, d) => s + d.carryingCost, 0))}</strong>
                  </span>
                </div>
                <div className="max-h-80 overflow-y-auto custom-scrollbar rounded-xl border border-gray-100">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-gray-50">
                      <tr className="border-b border-gray-100">
                        {["Mahsulot", "SKU", "Zaxira", "So'nggi sotuv", "Dam olgan kun", "Narxlar"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {deadStock
                        .filter((d) =>
                          !deadstockSearch || d.productName.toLowerCase().includes(deadstockSearch.toLowerCase())
                        )
                        .map((d) => (
                          <tr key={d.productId} className="transition hover:bg-gray-50">
                            <td className="px-4 py-2.5 font-medium text-gray-900">{d.productName}</td>
                            <td className="px-4 py-2.5 font-mono text-xs text-gray-400">{d.sku ?? '—'}</td>
                            <td className="px-4 py-2.5 text-gray-600">{Number(d.totalStock).toFixed(1)}</td>
                            <td className="px-4 py-2.5 text-xs text-gray-400">
                              {d.lastSoldAt ? new Date(d.lastSoldAt).toLocaleDateString('uz-UZ') : 'Hech qachon'}
                            </td>
                            <td className="px-4 py-2.5">
                              <span
                                className={cn(
                                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold',
                                  d.daysIdle >= 180
                                    ? 'bg-red-50 text-red-600'
                                    : d.daysIdle >= 90
                                      ? 'bg-amber-50 text-amber-600'
                                      : 'bg-gray-50 text-gray-600',
                                )}
                              >
                                {d.daysIdle} kun
                              </span>
                            </td>
                            <td className="px-4 py-2.5 text-gray-600">{formatPrice(d.carryingCost)}</td>
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

      {/* ABC summary bar */}
      {!loadingAbc && abcData.length > 0 && tab !== 'abc' && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Layers className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">ABC — tezkor ko&apos;rinish</h3>
          </div>
          <div className="flex gap-3">
            {abcData.map((g) => (
              <div
                key={g.group}
                className="flex-1 rounded-xl border p-3 text-center transition hover:shadow-sm"
                style={{
                  borderColor: ABC_COLORS[g.group] + '30',
                  backgroundColor: ABC_COLORS[g.group] + '06',
                }}
              >
                <span className="text-2xl font-black" style={{ color: ABC_COLORS[g.group] }}>
                  {g.group}
                </span>
                <p className="mt-1 text-xs text-gray-500">{(g.products ?? []).length} mahsulot</p>
                <p className="text-xs font-semibold text-gray-700">
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
