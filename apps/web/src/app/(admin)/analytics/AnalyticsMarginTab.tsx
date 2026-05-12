'use client';

import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatPrice, cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { CHART_COLORS, EmptyState } from './AnalyticsShared';
import { useTranslation } from '@/i18n/i18n-context';

interface MarginItem {
  productId: string;
  productName: string;
  categoryName?: string | null;
  revenue: number;
  costTotal: number;
  grossProfit: number;
  marginPct: number;
}

interface Props {
  marginData: MarginItem[];
  isLoading: boolean;
}

export function AnalyticsMarginTab({ marginData, isLoading }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">{t('analytics.marginTitle')}</h2>
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : marginData.length === 0 ? (
        <EmptyState label={t('analytics.noData')} />
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
                  name === `${t('analytics.colMargin')} %` ? `${Number(v).toFixed(1)}%` : formatPrice(Number(v))
                }
              />
              <Bar dataKey="marginPct" name={`${t('analytics.colMargin')} %`} radius={[8, 8, 0, 0]} barSize={32}>
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
                  {[
                    { key: 'product', label: t('analytics.colProduct') },
                    { key: 'category', label: t('analytics.colCategory') },
                    { key: 'revenue', label: t('analytics.colRevenue') },
                    { key: 'cost', label: t('analytics.colCost') },
                    { key: 'profit', label: t('analytics.colProfit') },
                    { key: 'margin', label: t('analytics.colMargin') },
                  ].map((h) => (
                    <th key={h.key} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">{h.label}</th>
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
  );
}
