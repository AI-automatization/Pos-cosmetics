'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Database,
  Server,
  AlertTriangle,
  RefreshCw,
  Trash2,
  Clock,
  HardDrive,
  Users,
  Activity,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export default function SystemPage() {
  const queryClient = useQueryClient();

  const { data: dbStats, isLoading: dbLoading } = useQuery({
    queryKey: ['admin-db', 'stats'],
    queryFn: () => founderApi.db.getStats(),
    refetchInterval: 30_000,
  });

  const { data: dlqCounts, isLoading: dlqCountLoading } = useQuery({
    queryKey: ['admin-dlq', 'counts'],
    queryFn: () => founderApi.getDlqCounts(),
    refetchInterval: 15_000,
  });

  const { data: dlqJobs, isLoading: dlqJobsLoading } = useQuery({
    queryKey: ['admin-dlq', 'jobs'],
    queryFn: () => founderApi.getDlqJobs(),
    refetchInterval: 15_000,
  });

  const retryMut = useMutation({
    mutationFn: ({ queue, jobId }: { queue: string; jobId: string }) =>
      founderApi.retryDlqJob(queue, jobId),
    onSuccess: () => {
      toast.success('Задача отправлена на повтор');
      queryClient.invalidateQueries({ queryKey: ['admin-dlq'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const dismissMut = useMutation({
    mutationFn: ({ queue, jobId }: { queue: string; jobId: string }) =>
      founderApi.dismissDlqJob(queue, jobId),
    onSuccess: () => {
      toast.success('Задача удалена');
      queryClient.invalidateQueries({ queryKey: ['admin-dlq'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const totalFailed = dlqCounts
    ? Object.values(dlqCounts).reduce((s, v) => s + v, 0)
    : 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Server className="h-6 w-6 text-violet-600" />
          Мониторинг системы
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Состояние базы данных, очередей и инфраструктуры
        </p>
      </div>

      {/* DB Stats */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Database className="h-4 w-4" /> PostgreSQL
        </h2>
        {dbLoading ? (
          <LoadingSkeleton variant="card" />
        ) : dbStats ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard icon={HardDrive} label="Размер БД" value={`${dbStats.dbSizeMb} MB`} />
            <StatCard icon={Users} label="Соединения" value={`${dbStats.activeConnections}/${dbStats.maxConnections}`} />
            <StatCard icon={Database} label="Таблицы" value={String(dbStats.tablesCount)} />
            <StatCard icon={Clock} label="Uptime" value={dbStats.uptime} />
            <StatCard icon={Server} label="Версия" value={dbStats.version?.split(' on ')[0]?.replace('PostgreSQL ', '') ?? '—'} />
            <StatCard icon={Activity} label="Статус" value="Online" color="green" />
          </div>
        ) : (
          <p className="text-sm text-red-500">Не удалось получить статистику</p>
        )}
      </section>

      {/* DLQ Summary */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <AlertTriangle className="h-4 w-4" /> Очереди — Dead Letter Queue
        </h2>
        {dlqCountLoading ? (
          <LoadingSkeleton variant="card" />
        ) : dlqCounts && Object.keys(dlqCounts).length > 0 ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Object.entries(dlqCounts).map(([queue, count]) => (
              <div
                key={queue}
                className={`rounded-xl border p-4 ${count > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}
              >
                <p className="font-mono text-xs text-gray-500">{queue}</p>
                <p className={`mt-1 text-2xl font-bold ${count > 0 ? 'text-red-600' : 'text-gray-400'}`}>
                  {count}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center">
            <Activity className="mx-auto h-6 w-6 text-green-500" />
            <p className="mt-2 text-sm font-medium text-green-700">
              {totalFailed === 0 ? 'Все очереди работают нормально' : `${totalFailed} ошибок в очередях`}
            </p>
          </div>
        )}
      </section>

      {/* DLQ Jobs */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Trash2 className="h-4 w-4" /> Проваленные задачи
          {totalFailed > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {totalFailed}
            </span>
          )}
        </h2>
        {dlqJobsLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : dlqJobs && dlqJobs.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Очередь</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Задача</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Причина ошибки</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Время</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dlqJobs.map((job) => (
                  <tr key={`${job.queue}-${job.id}`} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-violet-600">{job.queue}</td>
                    <td className="px-4 py-2.5 font-medium text-gray-800">{job.name}</td>
                    <td className="max-w-xs truncate px-4 py-2.5 text-red-600">{job.failedReason}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                      {job.timestamp ? new Date(job.timestamp).toLocaleString('ru') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => retryMut.mutate({ queue: job.queue, jobId: job.id })}
                          disabled={retryMut.isPending}
                          className="rounded p-1.5 text-gray-400 transition hover:bg-violet-50 hover:text-violet-600"
                          title="Повторить"
                        >
                          {retryMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => dismissMut.mutate({ queue: job.queue, jobId: job.id })}
                          disabled={dismissMut.isPending}
                          className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                          title="Удалить"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">Нет проваленных задач</p>
        )}
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color = 'default',
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color?: 'default' | 'green' | 'red';
}) {
  const colorMap = {
    default: 'border-gray-200 bg-white text-gray-900',
    green: 'border-green-200 bg-green-50 text-green-700',
    red: 'border-red-200 bg-red-50 text-red-700',
  };
  return (
    <div className={`rounded-xl border p-4 ${colorMap[color]}`}>
      <div className="flex items-center gap-1.5 text-gray-400">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-[11px] font-medium">{label}</span>
      </div>
      <p className="mt-1 truncate text-lg font-bold">{value}</p>
    </div>
  );
}
