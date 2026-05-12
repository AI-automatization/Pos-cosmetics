'use client';

import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ChartTooltip } from './AnalyticsShared';
import { EmptyState } from './AnalyticsShared';
import { useTranslation } from '@/i18n/i18n-context';

interface TrendDataPoint {
  period?: string;
  revenue?: number;
  avgBasket?: number;
  orders?: number;
}

interface Props {
  period: 'daily' | 'weekly' | 'monthly';
  onPeriodChange: (p: 'daily' | 'weekly' | 'monthly') => void;
  trend: TrendDataPoint[];
  isLoading: boolean;
}

export function AnalyticsTrendTab({ period, onPeriodChange, trend, isLoading }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-gray-900">{t('analytics.trendTitle')}</h2>
        <div className="flex rounded-lg bg-gray-100 p-0.5">
          {(['daily', 'weekly', 'monthly'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                'rounded-md px-3 py-1 text-xs font-medium transition',
                period === p ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {p === 'daily' ? t('analytics.daily') : p === 'weekly' ? t('analytics.weekly') : t('analytics.monthly')}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <LoadingSkeleton variant="line" className="h-72" />
      ) : trend.length === 0 ? (
        <EmptyState label={t('analytics.noData')} />
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
            <Area type="monotone" dataKey="revenue" name={t('analytics.revenue')} stroke="#6366f1" strokeWidth={2.5} fill="url(#gradRevenue)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }} />
            <Area type="monotone" dataKey="avgBasket" name={t('analytics.avgCheckShort')} stroke="#8b5cf6" strokeWidth={1.5} fill="url(#gradBasket)" dot={false} strokeDasharray="5 3" />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
