'use client';

import { useQuery } from '@tanstack/react-query';
import { GitBranch } from 'lucide-react';
import { founderApi } from '@/api/founder.api';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatDateTime } from '@/lib/utils';
import type { DbMigration } from '@/types/founder';

// Migrations tab — Prisma migration history
export function MigrationsTab() {
  const { data: migrations, isLoading } = useQuery<DbMigration[]>({
    queryKey: ['admin-db', 'migrations'],
    queryFn: () => founderApi.db.getMigrations(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return <LoadingSkeleton variant="table" rows={6} />;
  }

  const sorted = [...(migrations ?? [])].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3">
        <GitBranch className="h-4 w-4 text-violet-500" />
        <h2 className="text-sm font-semibold text-gray-700">Prisma Migrations</h2>
        <span className="ml-auto text-xs text-gray-400">{sorted.length} миграций</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">#</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Название</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Начало</th>
              <th className="px-4 py-2.5 text-left font-medium text-gray-500">Завершение</th>
              <th className="px-4 py-2.5 text-right font-medium text-gray-500">Шагов</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  Миграции не найдены
                </td>
              </tr>
            ) : (
              sorted.map((m, idx) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs text-gray-400">{sorted.length - idx}</td>
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs text-gray-700">{m.name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-xs text-gray-500">
                    {formatDateTime(m.startedAt)}
                  </td>
                  <td className="px-4 py-2.5 text-xs">
                    {m.finishedAt ? (
                      <span className="text-emerald-600">{formatDateTime(m.finishedAt)}</span>
                    ) : (
                      <span className="rounded-full bg-yellow-50 px-2 py-0.5 text-yellow-600">
                        Jarayonda...
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right text-xs font-medium text-gray-600">
                    {m.stepsCount}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
