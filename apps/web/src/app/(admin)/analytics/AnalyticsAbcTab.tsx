'use client';

import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ABC_COLORS, EmptyState } from './AnalyticsShared';
import { useTranslation } from '@/i18n/i18n-context';

interface AbcProduct {
  productId: string;
  productName: string;
  revenue: number;
  pct: number | string;
}

interface AbcGroup {
  group: 'A' | 'B' | 'C';
  totalRevenue?: number;
  revenueShare: number | string;
  products?: AbcProduct[];
}

interface Props {
  abcData: AbcGroup[];
  isLoading: boolean;
}

export function AnalyticsAbcTab({ abcData, isLoading }: Props) {
  const { t } = useTranslation();
  return (
    <div className="space-y-5">
      <h2 className="text-base font-semibold text-gray-900">{t('analytics.abcTitle')}</h2>
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={4} />
      ) : abcData.length === 0 ? (
        <EmptyState label={t('analytics.noData')} />
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={abcData.map((g) => ({ name: t('analytics.group', { group: g.group }), value: g.totalRevenue ?? 0 }))}
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
                    <p className="text-xs text-gray-500">{t('analytics.productCount', { count: (g.products ?? []).length })}</p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-bold text-gray-700">
                    {Number(g.revenueShare).toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {abcData.map((g) => (
            <div key={g.group}>
              <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-400">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ABC_COLORS[g.group] }} />
                {t('analytics.group', { group: g.group })}
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
  );
}
