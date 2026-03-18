'use client';

import { TrendingUp, TrendingDown, Info } from 'lucide-react';

interface TrendBadgeProps {
  current: number;
  previous: number | undefined;
}

export function TrendBadge({ current, previous }: TrendBadgeProps) {
  if (previous === undefined || previous === 0) return null;
  const pct = ((current - previous) / previous) * 100;
  const up = pct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-medium ${
        up ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
      }`}
    >
      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(pct).toFixed(1)}%
    </span>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  sub?: string;
  tooltip?: string;
  trend?: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  accent?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export function StatCard({
  title,
  value,
  sub,
  tooltip,
  trend,
  icon: Icon,
  accent = 'blue',
}: StatCardProps) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${colors[accent]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-gray-500">{title}</p>
          {tooltip && (
            <span title={tooltip} className="cursor-help text-gray-300 hover:text-gray-400">
              <Info className="h-3.5 w-3.5" />
            </span>
          )}
        </div>
        <div className="mt-0.5 flex items-baseline gap-2">
          <p className="text-xl font-bold text-gray-900">{value}</p>
          {trend}
        </div>
        {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
      </div>
    </div>
  );
}
