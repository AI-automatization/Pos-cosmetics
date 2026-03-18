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

const DEMO_WEEKLY = [
  { label: '22.02', revenue: 1_250_000 },
  { label: '23.02', revenue: 980_000 },
  { label: '24.02', revenue: 1_600_000 },
  { label: '25.02', revenue: 1_120_000 },
  { label: '26.02', revenue: 2_050_000 },
  { label: '27.02', revenue: 1_780_000 },
  { label: '28.02', revenue: 950_000 },
];

const DEMO_TOP = [
  { name: 'Nivea Day Cream', qty: 24, revenue: 960_000 },
  { name: 'Garnier Micellar Water', qty: 18, revenue: 720_000 },
  { name: "L'Oreal Shampoo", qty: 32, revenue: 640_000 },
  { name: 'Maybelline Mascara', qty: 12, revenue: 600_000 },
  { name: 'Dove Soap', qty: 48, revenue: 480_000 },
];

interface DemoTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function DemoTooltip({ active, payload, label }: DemoTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-bold text-gray-900">{formatPrice(payload[0].value)}</p>
    </div>
  );
}

export function DemoContent() {
  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-1 text-sm font-semibold text-gray-700">Haftalik savdo (demo)</p>
        <p className="mb-4 text-xs text-gray-400">
          Backend tayyor bo&apos;lgach real ma&apos;lumot ko&apos;rinadi
        </p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={DEMO_WEEKLY} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
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
            <Tooltip content={<DemoTooltip />} />
            <Bar dataKey="revenue" fill="#93c5fd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <p className="mb-4 text-sm font-semibold text-gray-700">Top mahsulotlar (demo)</p>
        <div className="flex flex-col gap-3">
          {DEMO_TOP.map((p, idx) => (
            <div key={p.name} className="flex items-center gap-2">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-500">
                {idx + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-gray-800">{p.name}</p>
                <p className="text-xs text-gray-400">{p.qty} ta</p>
              </div>
              <span className="shrink-0 text-xs font-semibold text-gray-700">
                {formatPrice(p.revenue)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
