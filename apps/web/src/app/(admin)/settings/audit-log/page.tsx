'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronUp, Shield, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { apiClient } from '@/api/client';

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuditLogItem {
  id: string;
  tenantId: string;
  userId: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}

interface AuditLogsResponse {
  items: AuditLogItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type ActionFilter = 'ALL' | string;

const ACTION_OPTIONS = [
  { value: 'ALL', label: 'Barcha amallar' },
  { value: 'CREATE', label: 'CREATE' },
  { value: 'UPDATE', label: 'UPDATE' },
  { value: 'DELETE', label: 'DELETE' },
  { value: 'LOGIN', label: 'LOGIN' },
  { value: 'LOGOUT', label: 'LOGOUT' },
  { value: 'APPROVE', label: 'APPROVE' },
];

const ACTION_COLORS: Record<string, string> = {
  CREATE:  'bg-green-100 text-green-700',
  UPDATE:  'bg-blue-100 text-blue-700',
  DELETE:  'bg-red-100 text-red-700',
  LOGIN:   'bg-gray-100 text-gray-600',
  LOGOUT:  'bg-gray-100 text-gray-600',
  APPROVE: 'bg-purple-100 text-purple-700',
};

// ─── API hook ───────��──────────────────────────────��────────────────────────

function useAuditLogs(params: { action?: string; page: number; limit: number }) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () =>
      apiClient
        .get<AuditLogsResponse>('/audit-logs', {
          params: {
            ...(params.action && params.action !== 'ALL' && { action: params.action }),
            page: params.page,
            limit: params.limit,
          },
        })
        .then((r) => r.data),
  });
}

// ─── Row component ───��──────────────────────────────────────────────────────

function AuditRow({ log }: { log: AuditLogItem }) {
  const [expanded, setExpanded] = useState(false);
  const hasDiff = log.oldData || log.newData;
  const colorClass = ACTION_COLORS[log.action] ?? 'bg-gray-100 text-gray-600';

  return (
    <>
      <tr
        className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
        onClick={() => hasDiff && setExpanded((e) => !e)}
      >
        <td className="px-4 py-3 text-xs text-gray-400 font-mono whitespace-nowrap">
          {new Date(log.createdAt).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
        </td>
        <td className="px-4 py-3">
          <p className="text-sm text-gray-700 font-mono">{log.userId ? log.userId.slice(0, 8) + '...' : '—'}</p>
          {log.ip && <p className="text-xs text-gray-400">{log.ip}</p>}
        </td>
        <td className="px-4 py-3">
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', colorClass)}>
            {log.action}
          </span>
        </td>
        <td className="px-4 py-3 text-sm text-gray-600">{log.entityType}</td>
        <td className="px-4 py-3 text-sm text-gray-500 font-mono">
          {log.entityId ? log.entityId.slice(0, 12) + '...' : '—'}
        </td>
        <td className="px-4 py-3">
          {hasDiff && (
            <button type="button" className="text-gray-400">
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          )}
        </td>
      </tr>
      {expanded && hasDiff && (
        <tr className="bg-gray-50">
          <td colSpan={6} className="px-4 pb-3">
            <div className="grid grid-cols-2 gap-4 pt-1">
              {log.oldData && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-red-600">Oldingi</p>
                  <pre className="rounded-lg border border-red-100 bg-red-50 p-2 text-xs text-red-800 overflow-x-auto max-h-48">
                    {JSON.stringify(log.oldData, null, 2)}
                  </pre>
                </div>
              )}
              {log.newData && (
                <div>
                  <p className="mb-1 text-xs font-semibold text-green-600">Yangi</p>
                  <pre className="rounded-lg border border-green-100 bg-green-50 p-2 text-xs text-green-800 overflow-x-auto max-h-48">
                    {JSON.stringify(log.newData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Page ────────────────────────────────────��──────────────────────────────

export default function AuditLogPage() {
  const [actionFilter, setActionFilter] = useState<ActionFilter>('ALL');
  const [page, setPage] = useState(1);
  const LIMIT = 30;

  const { data, isLoading, error } = useAuditLogs({
    action: actionFilter !== 'ALL' ? actionFilter : undefined,
    page,
    limit: LIMIT,
  });

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Audit log</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Barcha muhim operatsiyalar tarixi
            {total > 0 && <span className="ml-1">({total} ta yozuv)</span>}
          </p>
        </div>
        <SearchableDropdown
          options={ACTION_OPTIONS}
          value={actionFilter}
          onChange={(val) => { setActionFilter((val || 'ALL') as ActionFilter); setPage(1); }}
          searchable={false}
          clearable={false}
          className="w-48"
        />
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <Shield className="h-4 w-4 shrink-0" />
          Ma'lumot yuklashda xatolik yuz berdi
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-xl border border-gray-200 bg-white px-6 py-12 text-center text-gray-400">
          Audit log yozuvlari topilmadi
        </div>
      )}

      {/* Table */}
      {!isLoading && items.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Vaqt', 'Foydalanuvchi', 'Amal', 'Entity', 'Entity ID', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((log) => (
                <AuditRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <p className="text-xs text-gray-500">
                {(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)} / {total}
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-2 text-sm text-gray-600">
                  {page} / {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
