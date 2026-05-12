'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ChartTooltip, CashierAvatar, CHART_COLORS, EmptyState } from './AnalyticsShared';
import { useTranslation } from '@/i18n/i18n-context';

interface CashierPerf {
  userId: string;
  name?: string | null;
  ordersCount: number;
  revenue: number;
  avgBasket: number;
  returnsCount: number;
}

interface Props {
  cashiers: CashierPerf[];
  isLoading: boolean;
}

export function AnalyticsCashiersTab({ cashiers, isLoading }: Props) {
  const { t } = useTranslation();
  const [cashiersSearch, setCashiersSearch] = useState('');

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-gray-900">{t('analytics.cashiersTitle')}</h2>
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

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={4} />
      ) : cashiers.length === 0 ? (
        <EmptyState label={t('analytics.noData')} />
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
              <Bar dataKey="revenue" name={t('analytics.revenue')} radius={[8, 8, 0, 0]} barSize={28}>
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
                    <p className="text-xs text-gray-400">{t('analytics.ordersCount', { count: c.ordersCount })}</p>
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
  );
}
