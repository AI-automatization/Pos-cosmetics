'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { formatPrice } from '@/lib/utils';

interface WeeklyEntry {
  date: string;
  revenue: number;
}

interface ChartTooltipContentProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltipContent({ active, payload, label }: ChartTooltipContentProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

function fmtDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getDate()}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

interface WeeklyRevenueChartProps {
  data: WeeklyEntry[];
}

export function WeeklyRevenueChart({ data }: WeeklyRevenueChartProps) {
  return (
    <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-sm font-semibold text-gray-700">
        Haftalik savdo (so&apos;m)
      </h2>
      <ResponsiveContainer width="100%" height={220}>
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
          <Tooltip content={<ChartTooltipContent />} />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
