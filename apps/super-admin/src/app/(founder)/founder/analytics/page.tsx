'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  BarChart3,
  TrendingUp,
  Users,
  ShoppingCart,
  DollarSign,
  Calendar,
} from 'lucide-react';
import { founderApi } from '@/api/founder.api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

const PERIOD_OPTIONS = [
  { value: 7, label: '7 дней' },
  { value: 14, label: '14 дней' },
  { value: 30, label: '30 дней' },
  { value: 90, label: '90 дней' },
];

export default function AnalyticsPage() {
  const [days, setDays] = useState(14);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => founderApi.getStats(),
    staleTime: 30_000,
  });

  const { data: revenue, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin-revenue', days],
    queryFn: () => founderApi.getRevenueSeries(days),
    staleTime: 30_000,
  });

  const { data: topTenants, isLoading: topLoading } = useQuery({
    queryKey: ['admin-top-tenants'],
    queryFn: () => founderApi.getTopTenants(),
    staleTime: 30_000,
  });

  const { data: tenants } = useQuery({
    queryKey: ['admin-tenants'],
    queryFn: () => founderApi.listTenants(),
    staleTime: 60_000,
  });

  const activeTenants = tenants?.filter((t) => t.status === 'ACTIVE').length ?? 0;
  const inactiveTenants = tenants?.filter((t) => t.status === 'INACTIVE').length ?? 0;
  const totalTenants = tenants?.length ?? 0;

  // Fill missing days with zeros so chart shows full period
  const filledRevenue = useMemo(() => {
    if (!revenue) return [];
    const map = new Map(revenue.map((r) => [r.date, r]));
    const result: typeof revenue = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push(map.get(key) ?? { date: key, revenue: 0, orders: 0 });
    }
    return result;
  }, [revenue, days]);

  const maxRevenue = filledRevenue.length > 0 ? Math.max(...filledRevenue.map((r) => r.revenue ?? 0), 1) : 1;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <BarChart3 className="h-6 w-6 text-violet-600" />
            Аналитика платформы
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Рост тенантов, выручка, активность
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
                days === opt.value
                  ? 'bg-violet-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      {statsLoading ? (
        <LoadingSkeleton variant="card" />
      ) : (
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <KpiCard icon={Users} label="Всего тенантов" value={totalTenants} />
          <KpiCard icon={Users} label="Активные" value={activeTenants} color="green" />
          <KpiCard icon={Users} label="Неактивные" value={inactiveTenants} color="red" />
          <KpiCard icon={ShoppingCart} label="Заказы (сегодня)" value={stats?.totalOrdersToday ?? 0} />
          <KpiCard icon={DollarSign} label="Выручка (месяц)" value={formatMoney(stats?.totalRevenueMonth ?? 0)} />
        </div>
      )}

      {/* Revenue Table + Bar Chart */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <TrendingUp className="h-4 w-4" /> Динамика выручки ({days} дней)
        </h2>
        {revenueLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : filledRevenue.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Дата</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Выручка</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">График</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Заказы</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filledRevenue.map((point, i) => {
                  const val = point.revenue ?? 0;
                  const hasData = val > 0;
                  const width = maxRevenue > 0 ? Math.max((val / maxRevenue) * 100, 0) : 0;
                  return (
                    <tr key={i} className={hasData ? 'bg-violet-50/40 hover:bg-violet-50' : 'hover:bg-gray-50'}>
                      <td className="whitespace-nowrap px-4 py-2 font-medium text-gray-700">
                        {point.date ? new Date(point.date).toLocaleDateString('ru', { day: 'numeric', month: 'long', weekday: 'short' }) : '—'}
                      </td>
                      <td className="px-4 py-2 font-mono font-semibold text-gray-900">
                        {hasData ? `${Number(val).toLocaleString('ru')} сум` : '—'}
                      </td>
                      <td className="px-4 py-2" style={{ minWidth: 200 }}>
                        {hasData && (
                          <div className="h-5 rounded bg-gray-100">
                            <div
                              className="h-full rounded bg-violet-500"
                              style={{ width: `${width}%` }}
                            />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2 text-right">
                        {hasData ? (
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 font-medium text-violet-700">
                            {point.orders}
                          </span>
                        ) : (
                          <span className="text-gray-300">0</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">Нет данных за выбранный период</p>
        )}
      </section>

      {/* Top Tenants */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <BarChart3 className="h-4 w-4" /> Топ тенанты (сегодня)
        </h2>
        {topLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : topTenants && topTenants.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Магазин</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Выручка</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Заказы</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {topTenants.map((t, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-bold text-violet-600">{i + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{t.name ?? '—'}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-gray-700">
                      {formatMoney(t.revenue ?? 0)}
                    </td>
                    <td className="px-4 py-2.5 text-right text-gray-600">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">Нет данных о продажах за сегодня</p>
        )}
      </section>
    </div>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  color = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  color?: 'default' | 'green' | 'red';
}) {
  const colors = {
    default: 'border-gray-200 bg-white',
    green: 'border-green-200 bg-green-50',
    red: 'border-red-200 bg-red-50',
  };
  const textColors = { default: 'text-gray-900', green: 'text-green-700', red: 'text-red-700' };
  return (
    <div className={`rounded-xl border p-4 ${colors[color]}`}>
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className={`mt-1 text-xl font-bold ${textColors[color]}`}>{value}</p>
    </div>
  );
}

function formatMoney(val: number): string {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}M`;
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}K`;
  return String(val);
}
