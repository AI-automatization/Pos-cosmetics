'use client';

import {
  ShoppingBag,
  TrendingUp,
  AlertOctagon,
  Clock,
  Users,
  Store,
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
import { formatPrice, cn } from '@/lib/utils';
import type { TenantSummary, RevenuePoint } from '@/types/founder';

interface OverviewTabProps {
  tenant: TenantSummary;
  revenue: RevenuePoint[] | undefined;
}

// Stat cards + health indicators + 7-day revenue chart
export function OverviewTab({ tenant, revenue }: OverviewTabProps) {
  const revenueFormatted =
    revenue?.map((p) => ({
      date: p.date.slice(5),
      revenueM: Math.round(p.revenue / 1_000_000),
      orders: p.orders,
    })) ?? [];

  // Time since last activity
  const lastActivityMinutes = Math.round(
    (Date.now() - new Date(tenant.lastActivityAt).getTime()) / 60_000,
  );
  const activityText =
    lastActivityMinutes < 1
      ? 'Сейчас активен'
      : lastActivityMinutes < 60
        ? `${lastActivityMinutes} мин назад`
        : lastActivityMinutes < 1440
          ? `${Math.round(lastActivityMinutes / 60)} ч назад`
          : `${Math.round(lastActivityMinutes / 1440)} дн назад`;

  const isRecentlyActive = lastActivityMinutes < 30;

  return (
    <div className="flex flex-col gap-6">
      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: 'Продажи (сегодня)',
            value: tenant.salesToday.toString(),
            icon: ShoppingBag,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
          },
          {
            label: 'Выручка (сегодня)',
            value: formatPrice(tenant.revenueToday),
            icon: TrendingUp,
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
          },
          {
            label: 'Ошибки (24ч)',
            value: tenant.errorsLast24h.toString(),
            icon: AlertOctagon,
            color: tenant.errorsLast24h > 0 ? 'text-red-600' : 'text-gray-400',
            bg: tenant.errorsLast24h > 0 ? 'bg-red-50' : 'bg-gray-50',
          },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="mb-3 flex items-center gap-2">
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', card.bg)}>
                <card.icon className={cn('h-4 w-4', card.color)} />
              </div>
              <p className="text-sm text-gray-500">{card.label}</p>
            </div>
            <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Health indicators */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-400">
          Показатели
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Clock className={cn('h-5 w-5', isRecentlyActive ? 'text-green-500' : 'text-amber-500')} />
            <div>
              <p className="text-xs text-gray-500">Последняя активность</p>
              <p className={cn('text-sm font-medium', isRecentlyActive ? 'text-green-700' : 'text-amber-700')}>
                {activityText}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Store className="h-5 w-5 text-violet-500" />
            <div>
              <p className="text-xs text-gray-500">Статус</p>
              <p
                className={cn(
                  'text-sm font-medium',
                  tenant.status === 'ACTIVE' ? 'text-green-700' : 'text-red-600',
                )}
              >
                {tenant.status === 'ACTIVE' ? 'Активен' : 'Неактивен'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-gray-500">Создан</p>
              <p className="text-sm font-medium text-gray-700">
                {new Date(tenant.createdAt).toLocaleDateString('ru-RU')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue chart 7d */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 font-semibold text-gray-700">Выручка (7 дней, млн)</h3>
        {revenueFormatted.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}
                labelStyle={{ color: '#374151' }}
                formatter={(v: number | string | undefined) => [
                  typeof v === 'number' ? `${v} млн` : String(v ?? ''),
                  'Выручка',
                ]}
              />
              <Bar dataKey="revenueM" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-40 items-center justify-center text-sm text-gray-400">
            Нет данных
          </div>
        )}
      </div>
    </div>
  );
}
