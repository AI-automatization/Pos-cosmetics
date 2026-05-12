'use client';

import { useState } from 'react';
import {
  TrendingUp, Package, Users, AlertTriangle, Layers, Activity,
  X, ShoppingCart, DollarSign, BarChart3,
} from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';
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
import { useTranslation } from '@/i18n/i18n-context';
import { ABC_COLORS } from './AnalyticsShared';
import { AnalyticsTrendTab } from './AnalyticsTrendTab';
import { AnalyticsProductsTab } from './AnalyticsProductsTab';
import { AnalyticsMarginTab } from './AnalyticsMarginTab';
import { AnalyticsAbcTab } from './AnalyticsAbcTab';
import { AnalyticsCashiersTab } from './AnalyticsCashiersTab';
import { AnalyticsHeatmapTab } from './AnalyticsHeatmapTab';
import { AnalyticsDeadstockTab } from './AnalyticsDeadstockTab';
import { formatPrice as _fp } from '@/lib/utils';

type Tab = 'trend' | 'products' | 'margin' | 'cashiers' | 'heatmap' | 'deadstock' | 'abc';

export default function AnalyticsPage() {
  const { t } = useTranslation();

  const TABS: { key: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { key: 'trend', label: t('analytics.trend'), icon: TrendingUp },
    { key: 'products', label: t('analytics.products'), icon: BarChart3 },
    { key: 'margin', label: t('analytics.margin'), icon: DollarSign },
    { key: 'abc', label: t('analytics.abc'), icon: Layers },
    { key: 'cashiers', label: t('analytics.cashiers'), icon: Users },
    { key: 'heatmap', label: t('analytics.heatmap'), icon: Activity },
    { key: 'deadstock', label: t('analytics.deadstock'), icon: AlertTriangle },
  ];

  const [tab, setTab] = useState<Tab>('trend');
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [days, setDays] = useState(30);
  const [branchId, setBranchId] = useState('');

  const { data: branches = [] } = useBranches();
  const branchOptions = [
    { value: '', label: t('analytics.allBranches') },
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

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="mx-auto w-full max-w-7xl space-y-6 p-6">

        {/* ── Header ── */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">{t('nav.analytics')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('analytics.subtitle')}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <SearchableDropdown
              options={branchOptions}
              value={branchId}
              onChange={setBranchId}
              placeholder={t('analytics.allBranches')}
              clearable={branchId !== ''}
              searchable={branches.length > 3}
              className="w-52"
            />
            <div className="flex rounded-xl bg-gray-100 p-1">
              <button
                type="button"
                onClick={() => setDays(1)}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-sm font-medium transition-all',
                  days === 1
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {t('time.today')}
              </button>
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
            { label: t('analytics.totalRevenue'), value: formatPrice(totalRevenue), sub: `${days} ${t('analytics.days')}`, icon: TrendingUp, gradient: 'from-indigo-500 to-blue-600' },
            { label: t('analytics.totalOrders'), value: totalOrders.toLocaleString(), sub: t('common.unit'), icon: ShoppingCart, gradient: 'from-violet-500 to-purple-600' },
            { label: t('analytics.avgCheck'), value: formatPrice(avgCheck), sub: t('analytics.perOrder'), icon: DollarSign, gradient: 'from-emerald-500 to-teal-600' },
            { label: t('analytics.avgBasket'), value: formatPrice(avgBasket), sub: t('analytics.perOrder'), icon: Package, gradient: 'from-amber-500 to-orange-600' },
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
          {TABS.map((tabItem) => {
            const Icon = tabItem.icon;
            return (
              <button
                key={tabItem.key}
                type="button"
                onClick={() => setTab(tabItem.key)}
                className={cn(
                  'flex items-center gap-1.5 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-all',
                  tab === tabItem.key
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {tabItem.label}
              </button>
            );
          })}
        </div>

        {/* ── Tab Content ── */}
        <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          {tab === 'trend' && (
            <AnalyticsTrendTab
              period={period}
              onPeriodChange={setPeriod}
              trend={trend}
              isLoading={loadingTrend}
            />
          )}
          {tab === 'products' && (
            <AnalyticsProductsTab topProducts={topProducts} isLoading={loadingProducts} />
          )}
          {tab === 'margin' && (
            <AnalyticsMarginTab marginData={marginData} isLoading={loadingMargin} />
          )}
          {tab === 'abc' && (
            <AnalyticsAbcTab abcData={abcData} isLoading={loadingAbc} />
          )}
          {tab === 'cashiers' && (
            <AnalyticsCashiersTab cashiers={cashiers} isLoading={loadingCashiers} />
          )}
          {tab === 'heatmap' && (
            <AnalyticsHeatmapTab heatmap={heatmap} isLoading={loadingHeatmap} />
          )}
          {tab === 'deadstock' && (
            <AnalyticsDeadstockTab deadStock={deadStock} isLoading={loadingDead} />
          )}
        </div>

        {/* ── ABC Quick Summary (when not on ABC tab) ── */}
        {!loadingAbc && abcData.length > 0 && tab !== 'abc' && (
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
            <div className="mb-3 flex items-center gap-2">
              <Layers className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">{t('analytics.abcQuickView')}</h3>
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
                  <p className="mt-1 text-xs text-gray-500">{t('analytics.productCount', { count: (g.products ?? []).length })}</p>
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
