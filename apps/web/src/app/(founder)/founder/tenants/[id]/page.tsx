'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertOctagon, ShoppingBag, TrendingUp, ExternalLink } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useFounderTenants, useFounderErrors, useFounderRevenue } from '@/hooks/founder/useFounder';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';

function SeverityBadge({ severity }: { severity: string }) {
  const configs: Record<string, string> = {
    CRITICAL: 'bg-red-900/50 text-red-400',
    ERROR: 'bg-orange-900/50 text-orange-400',
    WARN: 'bg-yellow-900/50 text-yellow-400',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', configs[severity] ?? 'bg-gray-800 text-gray-400')}>
      {severity}
    </span>
  );
}

export default function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: tenants, isLoading } = useFounderTenants();
  const { data: errors } = useFounderErrors({ tenantId: id });
  const { data: revenue } = useFounderRevenue(7);

  const tenant = tenants?.find((t) => t.id === id);

  if (isLoading) return <LoadingSkeleton variant="table" rows={4} />;

  if (!tenant) {
    return (
      <div className="flex flex-col items-center gap-4 p-12">
        <p className="text-gray-500">Tenant topilmadi</p>
        <Link href="/founder/tenants" className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">
          Orqaga
        </Link>
      </div>
    );
  }

  const revenueFormatted = revenue?.map((p) => ({
    date: p.date.slice(5),
    revenueM: Math.round(p.revenue / 7 / 1_000_000), // simulated per-tenant
  })) ?? [];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Back */}
      <Link href="/founder/tenants" className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300">
        <ArrowLeft className="h-4 w-4" />
        Tenantlar
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">{tenant.name}</h1>
          <p className="mt-0.5 font-mono text-sm text-gray-500">{tenant.slug}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/${tenant.slug}/dashboard`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-gray-700 px-3 py-2 text-sm text-gray-400 transition hover:border-violet-500 hover:text-violet-400"
          >
            <ExternalLink className="h-4 w-4" />
            Login as
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Bugungi savdolar', value: tenant.salesToday.toString(), icon: ShoppingBag, color: 'text-blue-400' },
          { label: 'Bugungi daromad', value: formatPrice(tenant.revenueToday), icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Xatolar (24h)', value: tenant.errorsLast24h.toString(), icon: AlertOctagon, color: tenant.errorsLast24h > 0 ? 'text-red-400' : 'text-gray-500' },
        ].map((card) => (
          <div key={card.label} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
            <div className="mb-2 flex items-center gap-2">
              <card.icon className={cn('h-4 w-4', card.color)} />
              <p className="text-xs text-gray-500">{card.label}</p>
            </div>
            <p className={cn('text-xl font-bold', card.color)}>{card.value}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
        <h2 className="mb-4 font-semibold text-gray-200">Daromad (7 kun)</h2>
        <ResponsiveContainer width="100%" height={180}>
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

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <h2 className="mb-4 font-semibold text-gray-200">
            Xatolar ({errors.length})
          </h2>
          <div className="flex flex-col gap-3">
            {errors.map((err) => (
              <div key={err.id} className="rounded-lg border border-gray-700 bg-gray-800/50 p-3">
                <div className="mb-1 flex items-center gap-2">
                  <SeverityBadge severity={err.severity} />
                  <span className="rounded bg-gray-700 px-1.5 py-0.5 text-xs text-gray-400">
                    {err.type}
                  </span>
                  <span className="ml-auto text-xs text-gray-600">
                    {new Date(err.occurredAt).toLocaleTimeString('uz-UZ')}
                  </span>
                </div>
                <p className="text-sm text-gray-300">{err.message}</p>
                {err.url && (
                  <p className="mt-1 font-mono text-xs text-gray-600">{err.url}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
