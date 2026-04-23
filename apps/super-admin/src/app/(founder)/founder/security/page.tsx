'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Shield,
  Ban,
  Search,
  Unlock,
  Clock,
  AlertTriangle,
  UserX,
  Eye,
  ShieldAlert,
} from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

export default function SecurityPage() {
  const queryClient = useQueryClient();
  const [checkIp, setCheckIp] = useState('');
  const [checkedResult, setCheckedResult] = useState<{
    ip: string;
    isBlocked: boolean;
    failedLoginCount: number;
  } | null>(null);

  // Login attempts from DB
  const { data: loginAttempts, isLoading: attemptsLoading } = useQuery({
    queryKey: ['admin-db', 'table-data', 'login_attempts', 1],
    queryFn: () =>
      founderApi.db.getTableData('login_attempts', { page: 1, limit: 200, sort: 'id', sortDir: 'desc' }),
    staleTime: 15_000,
  });

  // Locked users from DB
  const { data: userLocks, isLoading: locksLoading } = useQuery({
    queryKey: ['admin-db', 'table-data', 'user_locks', 1],
    queryFn: () =>
      founderApi.db.getTableData('user_locks', { page: 1, limit: 50, sort: 'id', sortDir: 'desc' }),
    staleTime: 15_000,
  });

  // Group login attempts by IP — show suspicious IPs with failed counts
  const suspiciousIps = useMemo(() => {
    if (!loginAttempts?.rows) return [];
    const ipMap = new Map<string, { ip: string; total: number; failed: number; lastEmail: string; lastTime: string }>();
    for (const row of loginAttempts.rows) {
      const ip = String(row['ip'] ?? '');
      if (!ip || ip === '—') continue;
      const existing = ipMap.get(ip) ?? { ip, total: 0, failed: 0, lastEmail: '', lastTime: '' };
      existing.total += 1;
      if (row['success'] !== true) existing.failed += 1;
      if (!existing.lastEmail) existing.lastEmail = String(row['email'] ?? '');
      if (!existing.lastTime) existing.lastTime = String(row['created_at'] ?? row['createdAt'] ?? '');
      ipMap.set(ip, existing);
    }
    return Array.from(ipMap.values())
      .filter((e) => e.failed > 0)
      .sort((a, b) => b.failed - a.failed);
  }, [loginAttempts]);

  const blockMut = useMutation({
    mutationFn: ({ ip, reason }: { ip: string; reason?: string }) =>
      founderApi.blockIp(ip, reason, 24),
    onSuccess: (_, { ip }) => {
      toast.success(`IP ${ip} заблокирован на 24 часа`);
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const handleCheck = async () => {
    if (!checkIp.trim()) return;
    try {
      const result = await founderApi.getIpStats(checkIp.trim());
      setCheckedResult({ ip: checkIp.trim(), ...result });
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <Shield className="h-6 w-6 text-violet-600" />
          Безопасность
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Подозрительные IP, попытки входа и заблокированные пользователи
        </p>
      </div>

      {/* Suspicious IPs — main feature */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <ShieldAlert className="h-4 w-4 text-red-500" /> Подозрительные IP-адреса
          {suspiciousIps.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
              {suspiciousIps.length}
            </span>
          )}
        </h2>
        {attemptsLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : suspiciousIps.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">IP-адрес</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Неудачных</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Всего попыток</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Последний email</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Последняя попытка</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {suspiciousIps.map((entry) => (
                  <tr key={entry.ip} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono font-semibold text-gray-900">{entry.ip}</td>
                    <td className="px-4 py-2.5">
                      <span className={`rounded-full px-2 py-0.5 font-medium ${
                        entry.failed >= 10 ? 'bg-red-100 text-red-700' :
                        entry.failed >= 5 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {entry.failed}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-gray-600">{entry.total}</td>
                    <td className="px-4 py-2.5 text-gray-600">{entry.lastEmail}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                      {entry.lastTime ? new Date(entry.lastTime).toLocaleString('ru') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setCheckIp(entry.ip);
                            handleCheckIp(entry.ip);
                          }}
                          className="rounded px-2 py-1 text-[11px] font-medium text-violet-600 transition hover:bg-violet-50"
                        >
                          <Eye className="mr-0.5 inline h-3 w-3" />
                          Статус
                        </button>
                        <button
                          type="button"
                          onClick={() => blockMut.mutate({ ip: entry.ip, reason: `${entry.failed} failed logins` })}
                          disabled={blockMut.isPending}
                          className="rounded px-2 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-50"
                        >
                          <Ban className="mr-0.5 inline h-3 w-3" />
                          Блокировать
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-6 text-center">
            <Shield className="mx-auto h-6 w-6 text-green-500" />
            <p className="mt-2 text-sm font-medium text-green-700">Подозрительных IP не обнаружено</p>
          </div>
        )}
      </section>

      {/* IP Check / Manual Block */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Search className="h-4 w-4" /> Проверка и блокировка IP
        </h2>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">IP-адрес</label>
              <input
                type="text"
                value={checkIp}
                onChange={(e) => { setCheckIp(e.target.value); setCheckedResult(null); }}
                placeholder="192.168.1.100"
                className="w-48 rounded-lg border border-gray-200 px-3 py-2 text-sm font-mono outline-none focus:border-violet-400"
              />
            </div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={!checkIp.trim()}
              className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              <Eye className="mr-1 inline h-3.5 w-3.5" />
              Проверить
            </button>
            <button
              type="button"
              onClick={() => blockMut.mutate({ ip: checkIp.trim(), reason: 'manual block' })}
              disabled={!checkIp.trim() || blockMut.isPending}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              <Ban className="mr-1 inline h-3.5 w-3.5" />
              Заблокировать
            </button>
            {checkedResult && (
              <div className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium ${checkedResult.isBlocked ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                <span className={`h-2.5 w-2.5 rounded-full ${checkedResult.isBlocked ? 'bg-red-500' : 'bg-green-500'}`} />
                {checkedResult.ip}: {checkedResult.isBlocked ? 'Заблокирован' : 'Не заблокирован'} — {checkedResult.failedLoginCount} неудачных попыток
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Recent Login Attempts */}
      <section className="mb-8">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <AlertTriangle className="h-4 w-4" /> Последние попытки входа
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {loginAttempts?.total ?? 0}
          </span>
        </h2>
        {attemptsLoading ? (
          <LoadingSkeleton variant="table" rows={5} />
        ) : loginAttempts && loginAttempts.rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Email</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">IP</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Результат</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Время</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loginAttempts.rows.slice(0, 30).map((row, i) => {
                  const ip = String(row['ip'] ?? '');
                  const isFailed = row['success'] !== true;
                  return (
                    <tr key={String(row['id'] ?? i)} className={isFailed ? 'bg-red-50/30 hover:bg-red-50' : 'hover:bg-gray-50'}>
                      <td className="px-4 py-2.5 font-medium text-gray-800">{String(row['email'] ?? '—')}</td>
                      <td className="px-4 py-2.5 font-mono text-gray-700">{ip || '—'}</td>
                      <td className="px-4 py-2.5">
                        {isFailed ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700">Ошибка</span>
                        ) : (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-medium text-green-700">Успешно</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                        {row['created_at'] ? new Date(String(row['created_at'])).toLocaleString('ru') : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {ip && isFailed && (
                          <button
                            type="button"
                            onClick={() => blockMut.mutate({ ip, reason: 'blocked from login attempts' })}
                            disabled={blockMut.isPending}
                            className="rounded px-2 py-1 text-[11px] font-medium text-red-600 transition hover:bg-red-50"
                            title={`Заблокировать ${ip}`}
                          >
                            <Ban className="mr-0.5 inline h-3 w-3" />
                            Блок
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">Нет данных о попытках входа</p>
        )}
      </section>

      {/* Locked Users */}
      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <UserX className="h-4 w-4" /> Заблокированные пользователи
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {userLocks?.total ?? 0}
          </span>
        </h2>
        {locksLoading ? (
          <LoadingSkeleton variant="table" rows={3} />
        ) : userLocks && userLocks.rows.length > 0 ? (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <table className="w-full text-xs">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">User ID</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Причина</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Заблокирован до</th>
                  <th className="px-4 py-2.5 text-left font-medium text-gray-500">Создан</th>
                  <th className="px-4 py-2.5 text-right font-medium text-gray-500">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {userLocks.rows.map((row, i) => (
                  <tr key={String(row['id'] ?? i)} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{String(row['user_id'] ?? row['userId'] ?? '—')}</td>
                    <td className="px-4 py-2.5 text-gray-800">{String(row['reason'] ?? '—')}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                      {row['locked_until'] ?? row['lockedUntil'] ? new Date(String(row['locked_until'] ?? row['lockedUntil'])).toLocaleString('ru') : '—'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-gray-500">
                      {row['created_at'] ? new Date(String(row['created_at'])).toLocaleString('ru') : '—'}
                    </td>
                    <td className="px-4 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          const id = String(row['id'] ?? '');
                          if (id) founderApi.db.deleteRow('user_locks', id).then(() => {
                            toast.success('Блокировка снята');
                            queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'user_locks'] });
                          });
                        }}
                        className="rounded p-1.5 text-gray-400 transition hover:bg-green-50 hover:text-green-600"
                        title="Разблокировать"
                      >
                        <Unlock className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-sm text-gray-400">Нет заблокированных пользователей</p>
        )}
      </section>
    </div>
  );

  function handleCheckIp(ip: string) {
    founderApi.getIpStats(ip).then((result) => {
      setCheckedResult({ ip, ...result });
    }).catch((err) => {
      toast.error(extractErrorMessage(err));
    });
  }
}
