'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  ShoppingBag,
  TrendingUp,
  AlertOctagon,
  Activity,
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
import {
  useFounderStats,
  useFounderRevenue,
  useTopTenants,
  useFounderErrors,
} from '@/hooks/founder/useFounder';
import { formatPrice, cn } from '@/lib/utils';
import type { LiveSaleTick } from '@/types/founder';

// Demo live ticker generator
const DEMO_TENANTS = ['Kosmetika Markaz', 'Moda Dunyosi', 'Elektronika Plus', 'Dorixona 24'];
const DEMO_METHODS = ['CASH', 'CARD', 'NASIYA'] as const;
function genTick(): LiveSaleTick {
  return {
    id: Math.random().toString(36).slice(2),
    tenantName: DEMO_TENANTS[Math.floor(Math.random() * DEMO_TENANTS.length)],
    amount: Math.round((50_000 + Math.random() * 450_000) / 1000) * 1000,
    method: DEMO_METHODS[Math.floor(Math.random() * DEMO_METHODS.length)],
    at: new Date().toISOString(),
  };
}

function useLiveTicker() {
  const [ticks, setTicks] = useState<LiveSaleTick[]>(() =>
    Array.from({ length: 5 }, genTick),
  );
  useEffect(() => {
    const id = setInterval(() => {
      setTicks((prev) => [genTick(), ...prev].slice(0, 10));
    }, 3500);
    return () => clearInterval(id);
  }, []);
  return ticks;
}

function formatTimeAgo(iso: string) {
  const secs = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return `${secs}s`;
  if (secs < 3600) return `${Math.floor(secs / 60)}m`;
  return `${Math.floor(secs / 3600)}h`;
}

export default function FounderOverviewPage() {
  const { data: stats } = useFounderStats();
  const { data: revenue } = useFounderRevenue(14);
  const { data: topTenants } = useTopTenants();
  const { data: errors } = useFounderErrors();
  const ticks = useLiveTicker();

  const criticalErrors = errors?.filter((e) => e.severity === 'CRITICAL') ?? [];

  const STAT_CARDS = stats
    ? [
        {
          label: 'Jami tenantlar',
          value: stats.totalTenants.toString(),
          sub: `${stats.activeTenants} faol`,
          icon: Building2,
          color: 'text-violet-400',
          bg: 'bg-violet-500/10',
        },
        {
          label: 'Bugungi savdolar',
          value: stats.totalSalesToday.toString(),
          sub: 'barcha tenantlar',
          icon: ShoppingBag,
          color: 'text-blue-400',
          bg: 'bg-blue-500/10',
        },
        {
          label: "Bugungi daromad",
          value: formatPrice(stats.totalRevenueToday),
          sub: `${formatPrice(stats.totalRevenueMonth)} oy`,
          icon: TrendingUp,
          color: 'text-emerald-400',
          bg: 'bg-emerald-500/10',
        },
        {
          label: 'Xatolar (24h)',
          value: (errors?.length ?? 0).toString(),
          sub: criticalErrors.length > 0 ? `${criticalErrors.length} kritik!` : 'hammasi yaxshi',
          icon: AlertOctagon,
          color: criticalErrors.length > 0 ? 'text-red-400' : 'text-gray-400',
          bg: criticalErrors.length > 0 ? 'bg-red-500/10' : 'bg-gray-700/50',
        },
      ]
    : [];

  const revenueFormatted = revenue?.map((p) => ({
    ...p,
    date: p.date.slice(5), // MM-DD
    revenueM: Math.round(p.revenue / 1_000_000), // million so'm
  })) ?? [];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div>
        <h1 className="text-xl font-semibold text-white">Founder Overview</h1>
        <p className="mt-0.5 text-sm text-gray-500">Barcha tenantlar monitoringi</p>
      </div>

      {/* Stat cards */}
      {STAT_CARDS.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {STAT_CARDS.map((card) => (
            <div
              key={card.label}
              className="rounded-xl border border-gray-800 bg-gray-900 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-gray-500">{card.label}</p>
                <div className={cn('rounded-lg p-1.5', card.bg)}>
                  <card.icon className={cn('h-4 w-4', card.color)} />
                </div>
              </div>
              <p className={cn('text-2xl font-bold', card.color)}>{card.value}</p>
              <p className="mt-0.5 text-xs text-gray-600">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Critical errors banner */}
      {criticalErrors.length > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-800 bg-red-950/50 px-4 py-3">
          <AlertOctagon className="h-5 w-5 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">
            <span className="font-semibold">{criticalErrors.length} ta KRITIK xato</span>
            {' — '}
            {criticalErrors.map((e) => e.tenantName).join(', ')}
          </p>
          <Link
            href="/founder/errors"
            className="ml-auto rounded-lg border border-red-700 px-3 py-1 text-xs font-medium text-red-400 transition hover:bg-red-900/50"
          >
            Ko'rish
          </Link>
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* Revenue chart */}
        <div className="col-span-2 rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 font-semibold text-gray-200">Daromad (14 kun, mln so'm)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={revenueFormatted}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 11 }} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
              <Tooltip
                contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }}
                labelStyle={{ color: '#e5e7eb' }}
                formatter={(v: number | string | undefined) => [typeof v === 'number' ? `${v} mln` : String(v ?? ''), 'Daromad']}
              />
              <Bar dataKey="revenueM" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top 5 tenants */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 font-semibold text-gray-200">Top 5 tenant (bugun)</h2>
          <div className="flex flex-col gap-3">
            {topTenants?.map((t, i) => {
              const maxRev = topTenants[0]?.revenue ?? 1;
              const pct = (t.revenue / maxRev) * 100;
              return (
                <div key={t.name}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-gray-300">
                      <span className="mr-2 text-gray-600">#{i + 1}</span>
                      {t.name}
                    </span>
                    <span className="font-medium text-violet-400">
                      {formatPrice(t.revenue)}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Live sales ticker */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-emerald-400" />
          <h2 className="font-semibold text-gray-200">Live savdolar</h2>
          <span className="ml-1 flex h-2 w-2">
            <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
        </div>
        <div className="flex flex-col gap-2">
          {ticks.map((tick, i) => (
            <div
              key={tick.id}
              className={cn(
                'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all',
                i === 0 ? 'bg-emerald-950/60 text-white' : 'text-gray-400',
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    tick.method === 'CASH'
                      ? 'bg-green-900/60 text-green-400'
                      : tick.method === 'CARD'
                      ? 'bg-blue-900/60 text-blue-400'
                      : 'bg-orange-900/60 text-orange-400',
                  )}
                >
                  {tick.method}
                </span>
                <span className="text-xs">{tick.tenantName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-emerald-400">
                  +{formatPrice(tick.amount)}
                </span>
                <span className="text-xs text-gray-600">{formatTimeAgo(tick.at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
