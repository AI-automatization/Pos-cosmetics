'use client';

import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useDailyRevenue } from '@/hooks/reports/useReports';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice } from '@/lib/utils';

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function getDefaultRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 29);
  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}

export default function DailyRevenuePage() {
  const [range, setRange] = useState(getDefaultRange);
  const { data, isLoading, isError } = useDailyRevenue(range);

  const totalRevenue = data?.reduce((s, d) => s + d.revenue, 0) ?? 0;
  const totalOrders = data?.reduce((s, d) => s + d.ordersCount, 0) ?? 0;
  const avgPerDay = data?.length ? totalRevenue / data.length : 0;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/reports"
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Kunlik savdo</h1>
          <p className="text-sm text-gray-500">Sana oralig'i bo'yicha savdo dinamikasi</p>
        </div>
      </div>

      {/* Date range */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Dan:</label>
          <input
            type="date"
            value={range.from}
            max={range.to}
            onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-600">Gacha:</label>
          <input
            type="date"
            value={range.to}
            min={range.from}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
          />
        </div>
        {/* Quick ranges */}
        <div className="ml-auto flex gap-2">
          {[
            { label: '7 kun', days: 7 },
            { label: '30 kun', days: 30 },
            { label: '90 kun', days: 90 },
          ].map(({ label, days }) => (
            <button
              key={days}
              type="button"
              onClick={() => {
                const to = new Date();
                const from = new Date();
                from.setDate(from.getDate() - (days - 1));
                setRange({
                  from: from.toISOString().slice(0, 10),
                  to: to.toISOString().slice(0, 10),
                });
              }}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : isError ? (
        <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-700">
          Backend API (T-024) hali tayyor emas
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Jami savdo', value: formatPrice(totalRevenue) },
              { label: 'Jami buyurtma', value: `${totalOrders} ta` },
              { label: 'Kunlik o\'rtacha', value: formatPrice(avgPerDay) },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-xl border border-gray-200 bg-white px-5 py-4"
              >
                <p className="text-sm text-gray-500">{label}</p>
                <p className="mt-1 text-xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
          </div>

          {/* Bar chart */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-700">Savdo grafigi</h2>
            {!data || data.length === 0 ? (
              <p className="py-10 text-center text-sm text-gray-400">
                Tanlangan sana oralig'ida savdo yo'q
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart
                  data={data.map((d) => ({ ...d, label: fmtDate(d.date) }))}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Table */}
          {data && data.length > 0 && (
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Sana</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Savdo</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Buyurtmalar</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Chegirma</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[...data].reverse().map((row) => (
                    <tr key={row.date} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-700">
                        {new Date(row.date).toLocaleDateString('uz-UZ', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'long',
                        })}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums text-gray-900">
                        {formatPrice(row.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-600">
                        {row.ordersCount}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-gray-500">
                        {row.discountAmount > 0 ? `−${formatPrice(row.discountAmount)}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
