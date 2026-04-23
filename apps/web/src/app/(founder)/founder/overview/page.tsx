'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import {
  Building2,
  ShoppingBag,
  TrendingUp,
  AlertOctagon,
  Activity,
  Clock,
} from 'lucide-react';
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
  useFounderStats,
  useFounderRevenue,
  useTopTenants,
  useFounderErrors,
} from '@/hooks/founder/useFounder';
import { founderApi } from '@/api/founder.api';
import { formatPrice, cn } from '@/lib/utils';

export default function FounderOverviewPage() {
  const { data: stats } = useFounderStats();
  const { data: revenue } = useFounderRevenue(14);
  const { data: topTenants } = useTopTenants();
  const { data: errors } = useFounderErrors();

  // Последние реальные заказы из БД (вместо фейковых)
  const { data: recentOrders } = useQuery({
    queryKey: ['admin-db', 'table-data', 'orders', 'recent'],
    queryFn: () => founderApi.db.getTableData('orders', { page: 1, limit: 10, sort: 'created_at', sortDir: 'desc' }),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });

  const criticalErrors = errors?.filter((e) => e.severity === 'CRITICAL') ?? [];

  const STAT_CARDS = stats
    ? [
        {
          label: 'Всего тенантов',
          value: stats.totalTenants.toString(),
          sub: `${stats.activeTenants} активных`,
          icon: Building2,
          color: 'text-violet-600',
          bg: 'bg-violet-50',
        },
        {
          label: 'Продажи (сегодня)',
          value: stats.totalSalesToday.toString(),
          sub: 'все тенанты',
          icon: ShoppingBag,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          label: 'Выручка (сегодня)',
          value: formatPrice(stats.totalRevenueToday),
          sub: `${formatPrice(stats.totalRevenueMonth)} за месяц`,
          icon: TrendingUp,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          label: 'Ошибки (24ч)',
          value: (errors?.length ?? 0).toString(),
          sub: criticalErrors.length > 0 ? `${criticalErrors.length} критических!` : 'всё в порядке',
          icon: AlertOctagon,
          color: criticalErrors.length > 0 ? 'text-red-600' : 'text-gray-400',
          bg: criticalErrors.length > 0 ? 'bg-red-50' : 'bg-gray-50',
        },
      ]
    : [];

  const revenueFormatted = revenue?.map((p) => ({
    ...p,
    date: p.date.slice(5),
    revenueM: Math.round(p.revenue / 1_000_000),
  })) ?? [];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Обзор</h1>
        <p className="mt-0.5 text-sm text-gray-500">Мониторинг всех тенантов</p>
      </div>

      {/* Stat cards */}
      {STAT_CARDS.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-200 bg-white p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">{card.label}</p>
                <div className={cn('rounded-lg p-1.5', card.bg)}>
                  <card.icon className={cn('h-4 w-4', card.color)} />
                </div>
              </div>
              <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
              <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Critical errors banner */}
      {criticalErrors.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertOctagon className="h-5 w-5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{criticalErrors.length} КРИТИЧЕСКИХ ошибок</span>
            {' — '}
            {criticalErrors.map((e) => e.tenantName).join(', ')}
          </p>
          <Link
            href="/founder/errors"
            className="ml-auto rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-600 transition hover:bg-red-100"
          >
            Смотреть
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-700">Выручка (14 дней, млн сум)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                labelStyle={{ color: '#374151' }}
                formatter={(v: number | string | undefined) => [typeof v === 'number' ? `${v} млн` : String(v ?? ''), 'Выручка']}
              />
              <Bar dataKey="revenueM" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 tenants */}
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-4 font-semibold text-gray-700">Топ 5 тенантов (сегодня)</h2>
          <div className="flex flex-col gap-3">
            {topTenants?.map((t, i) => {
              const maxRev = topTenants[0]?.revenue ?? 1;
              const pct = (t.revenue / maxRev) * 100;
              return (
                <div key={t.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-700">
                      <span className="mr-2 text-gray-400">#{i + 1}</span>
                      {t.name}
                    </span>
                    <span className="font-medium text-violet-600">
                      {formatPrice(t.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full rounded-full bg-violet-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent orders (real data) */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-500" />
          <h2 className="font-semibold text-gray-700">Последние заказы</h2>
          <span className="ml-auto text-xs text-gray-400">обновляется каждые 30 сек</span>
        </div>
        {recentOrders?.rows && recentOrders.rows.length > 0 ? (
          <div className="flex flex-col gap-2">
            {recentOrders.rows.map((order, i) => {
              const total = Number(order['total_amount'] ?? order['totalAmount'] ?? 0);
              const status = String(order['status'] ?? 'COMPLETED');
              const createdAt = String(order['created_at'] ?? order['createdAt'] ?? '');
              const tenantId = String(order['tenant_id'] ?? order['tenantId'] ?? '').slice(0, 8);
              return (
                <div
                  key={String(order['id'] ?? i)}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm',
                    i === 0 ? 'bg-emerald-50 text-gray-900' : 'text-gray-500',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium',
                      status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600',
                    )}>
                      {status}
                    </span>
                    <span className="text-xs text-gray-400">tenant: {tenantId}...</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-600">
                      {formatPrice(total)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="h-3 w-3" />
                      {createdAt ? new Date(createdAt).toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-gray-400">Заказов пока нет</p>
        )}
      </div>
    </div>
  );
}
