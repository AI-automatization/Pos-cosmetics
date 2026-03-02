'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertOctagon, Search } from 'lucide-react';
import { useFounderErrors } from '@/hooks/founder/useFounder';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { FounderError } from '@/types/founder';

type ErrType = 'ALL' | 'API' | 'CLIENT' | 'SYNC';
type ErrSeverity = 'ALL' | 'CRITICAL' | 'ERROR' | 'WARN';

function SeverityBadge({ severity }: { severity: FounderError['severity'] }) {
  const configs: Record<FounderError['severity'], string> = {
    CRITICAL: 'bg-red-900/60 text-red-400 font-semibold',
    ERROR: 'bg-orange-900/60 text-orange-400',
    WARN: 'bg-yellow-900/60 text-yellow-400',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs', configs[severity])}>
      {severity}
    </span>
  );
}

function TypeBadge({ type }: { type: FounderError['type'] }) {
  const configs: Record<FounderError['type'], string> = {
    API: 'bg-blue-900/50 text-blue-400',
    CLIENT: 'bg-purple-900/50 text-purple-400',
    SYNC: 'bg-cyan-900/50 text-cyan-400',
  };
  return (
    <span className={cn('rounded px-1.5 py-0.5 text-xs font-mono', configs[type])}>
      {type}
    </span>
  );
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (mins < 60) return `${mins}m oldin`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `${h}h oldin`;
  return `${Math.floor(h / 24)}k oldin`;
}

export default function FounderErrorsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ErrType>('ALL');
  const [severityFilter, setSeverityFilter] = useState<ErrSeverity>('ALL');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: errors, isLoading } = useFounderErrors({
    type: typeFilter !== 'ALL' ? typeFilter : undefined,
    severity: severityFilter !== 'ALL' ? severityFilter : undefined,
  });

  const filtered = (errors ?? []).filter((e) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      e.message.toLowerCase().includes(s) ||
      e.tenantName.toLowerCase().includes(s) ||
      (e.url ?? '').includes(s)
    );
  });

  const TYPES: { key: ErrType; label: string }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'API', label: 'API' },
    { key: 'CLIENT', label: 'Client' },
    { key: 'SYNC', label: 'Sync' },
  ];
  const SEVERITIES: { key: ErrSeverity; label: string }[] = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'CRITICAL', label: 'Critical' },
    { key: 'ERROR', label: 'Error' },
    { key: 'WARN', label: 'Warn' },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-semibold text-white">
            <AlertOctagon className="h-5 w-5 text-red-400" />
            Error Log
          </h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Barcha tenantlardan markazlashgan xatolar
          </p>
        </div>
        {errors && (
          <div className="flex gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-red-900/40 px-2 py-1 text-red-400">
              {errors.filter((e) => e.severity === 'CRITICAL').length} critical
            </span>
            <span className="rounded-full bg-orange-900/40 px-2 py-1 text-orange-400">
              {errors.filter((e) => e.severity === 'ERROR').length} error
            </span>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Type */}
        <div className="flex gap-0.5 rounded-lg border border-gray-700 bg-gray-900 p-0.5">
          {TYPES.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTypeFilter(t.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                typeFilter === t.key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Severity */}
        <div className="flex gap-0.5 rounded-lg border border-gray-700 bg-gray-900 p-0.5">
          {SEVERITIES.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSeverityFilter(s.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                severityFilter === s.key ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300',
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-600" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xato matni, tenant, URL..."
            className="w-full rounded-lg border border-gray-700 bg-gray-900 py-1.5 pl-8 pr-3 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-violet-500"
          />
        </div>
      </div>

      {/* Error list */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-800 bg-gray-900 px-6 py-12 text-center">
          <AlertOctagon className="mx-auto mb-2 h-8 w-8 text-gray-700" />
          <p className="text-sm text-gray-600">Xato topilmadi</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((err) => (
            <div
              key={err.id}
              className={cn(
                'rounded-xl border bg-gray-900 transition',
                err.severity === 'CRITICAL'
                  ? 'border-red-800'
                  : err.severity === 'ERROR'
                  ? 'border-orange-900'
                  : 'border-gray-800',
              )}
            >
              <button
                type="button"
                onClick={() => setExpanded(expanded === err.id ? null : err.id)}
                className="w-full px-4 py-3 text-left"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex gap-1.5">
                    <SeverityBadge severity={err.severity} />
                    <TypeBadge type={err.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-gray-200">{err.message}</p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                      <Link
                        href={`/founder/tenants/${err.tenantId}`}
                        className="text-violet-500 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {err.tenantName}
                      </Link>
                      {err.url && <span className="font-mono">{err.url}</span>}
                      {err.userId && <span>user: {err.userId}</span>}
                      <span className="ml-auto">{timeAgo(err.occurredAt)}</span>
                    </div>
                  </div>
                </div>
              </button>

              {/* Stack trace expanded */}
              {expanded === err.id && err.stack && (
                <div className="border-t border-gray-800 px-4 pb-4">
                  <pre className="mt-3 overflow-x-auto rounded-lg bg-gray-950 p-3 text-xs text-gray-400">
                    {err.stack}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
