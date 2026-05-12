'use client';

import { Activity } from 'lucide-react';
import { formatPrice, cn } from '@/lib/utils';

/* ─── Constants ─── */

export const CHART_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#06b6d4', '#3b82f6', '#2563eb',
];

export const ABC_COLORS: Record<'A' | 'B' | 'C', string> = {
  A: '#22c55e', B: '#f59e0b', C: '#94a3b8',
};

export const DOW_LABELS = ['Yak', 'Du', 'Se', 'Ch', 'Pa', 'Sh', 'Sha'];

/* ─── Custom Tooltip ─── */

export function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm">
      <p className="mb-1.5 text-xs font-medium text-gray-500">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-xs text-gray-600">{p.name}:</span>
          <span className="text-xs font-bold text-gray-900">{formatPrice(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

/* ─── Cashier Avatar ─── */

export function CashierAvatar({ name, rank }: { name: string | null | undefined; rank: number }) {
  const initials = (name ?? '?')
    .split(' ')
    .map((w) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?';

  const colors = [
    'from-indigo-500 to-purple-600',
    'from-blue-500 to-cyan-500',
    'from-emerald-500 to-teal-500',
    'from-amber-500 to-orange-500',
    'from-pink-500 to-rose-500',
    'from-violet-500 to-fuchsia-500',
  ];
  const color = colors[(name ?? '?').charCodeAt(0) % colors.length];

  return (
    <div className="relative">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white shadow-md',
          color,
        )}
      >
        {initials}
      </div>
      {rank <= 3 && (
        <span className={cn(
          'absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold text-white shadow',
          rank === 1 ? 'bg-amber-500' : rank === 2 ? 'bg-gray-400' : 'bg-amber-700',
        )}>
          {rank}
        </span>
      )}
    </div>
  );
}

/* ─── Empty State ─── */

export function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
        <Activity className="h-7 w-7 text-gray-300" />
      </div>
      <p className="text-sm text-gray-400">{label}</p>
    </div>
  );
}
