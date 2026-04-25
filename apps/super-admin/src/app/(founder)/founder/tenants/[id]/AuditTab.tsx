'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, FileText } from 'lucide-react';
import { founderApi } from '@/api/founder.api';
import { cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

interface AuditTabProps {
  tenantId: string;
}

interface AuditEntry {
  id: string;
  action?: string;
  entity?: string;
  entityId?: string;
  userId?: string;
  userName?: string;
  details?: string;
  ip?: string;
  createdAt?: string;
}

interface AuditResponse {
  items?: AuditEntry[];
  data?: AuditEntry[];
  total?: number;
  page?: number;
  totalPages?: number;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'bg-green-50 text-green-700',
  UPDATE: 'bg-blue-50 text-blue-700',
  DELETE: 'bg-red-50 text-red-600',
  LOGIN: 'bg-violet-50 text-violet-700',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

// Audit log table with pagination
export function AuditTab({ tenantId }: AuditTabProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<AuditResponse>({
    queryKey: ['founder', 'tenant-audit', tenantId, page],
    queryFn: () => founderApi.getTenantAuditLog(tenantId, page),
    staleTime: 30_000,
  });

  if (isLoading) return <LoadingSkeleton variant="table" rows={8} />;

  // Normalize response — backend may return items or data
  const rawData = data ?? {};
  const items: AuditEntry[] = rawData.items ?? rawData.data ?? (Array.isArray(data) ? (data as AuditEntry[]) : []);
  const totalPages = rawData.totalPages ?? 1;
  const total = rawData.total ?? items.length;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-gray-500">
        Всего: <span className="font-medium text-gray-700">{total}</span> записей
      </p>

      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
          <FileText className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">Записей аудита не найдено</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Время</th>
                <th className="px-4 py-3">Действие</th>
                <th className="px-4 py-3">Объект</th>
                <th className="px-4 py-3">Пользователь</th>
                <th className="px-4 py-3">Детали</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {items.map((entry) => (
                <tr key={entry.id} className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {entry.createdAt
                      ? new Date(entry.createdAt).toLocaleString('ru-RU')
                      : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        ACTION_COLORS[entry.action ?? ''] ?? 'bg-gray-100 text-gray-600',
                      )}
                    >
                      {entry.action ?? '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{entry.entity ?? '—'}</p>
                    {entry.entityId && (
                      <p className="font-mono text-xs text-gray-400">{entry.entityId.slice(0, 8)}...</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {entry.userName ?? entry.userId?.slice(0, 8) ?? '—'}
                  </td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-xs text-gray-500" title={entry.details}>
                    {entry.details ?? '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-gray-400">
                    {entry.ip ?? '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}
