'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Flag, Plus, Trash2, Loader2, X, Search, Globe, Building2, Info,
} from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { extractErrorMessage, cn } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';

// ─── Types ───────────────────────────────────────────────────────────────────

type ScopeFilter = 'ALL' | 'GLOBAL' | 'TENANT';
type StatusFilter = 'ALL' | 'ON' | 'OFF';

// ─── Main page ───────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState<ScopeFilter>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-db', 'table-data', 'feature_flags', 1],
    queryFn: () =>
      founderApi.db.getTableData('feature_flags', { page: 1, limit: 100, sort: 'id', sortDir: 'desc' }),
    staleTime: 15_000,
  });

  const toggleMut = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) =>
      founderApi.db.updateRow('feature_flags', id, { enabled }),
    onSuccess: () => {
      toast.success('Флаг обновлён');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'feature_flags'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => founderApi.db.deleteRow('feature_flags', id),
    onSuccess: () => {
      toast.success('Флаг удалён');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'feature_flags'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const allFlags = data?.rows ?? [];

  const filtered = useMemo(() => {
    return allFlags.filter((flag) => {
      const name = String(flag['name'] ?? flag['key'] ?? '');
      const desc = String(flag['description'] ?? '');
      const enabled = flag['enabled'] === true || flag['isEnabled'] === true;
      const tenantId = flag['tenant_id'] ?? flag['tenantId'] ?? null;
      const isGlobal = tenantId == null || tenantId === '' || tenantId === 'null';

      if (search && !name.toLowerCase().includes(search.toLowerCase()) && !desc.toLowerCase().includes(search.toLowerCase())) return false;
      if (scopeFilter === 'GLOBAL' && !isGlobal) return false;
      if (scopeFilter === 'TENANT' && isGlobal) return false;
      if (statusFilter === 'ON' && !enabled) return false;
      if (statusFilter === 'OFF' && enabled) return false;
      return true;
    });
  }, [allFlags, search, scopeFilter, statusFilter]);

  const enabledCount = allFlags.filter((f) => f['enabled'] === true || f['isEnabled'] === true).length;
  const globalCount = allFlags.filter((f) => {
    const tid = f['tenant_id'] ?? f['tenantId'] ?? null;
    return tid == null || tid === '' || tid === 'null';
  }).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Flag className="h-6 w-6 text-violet-600" />
            Feature Flags
          </h1>
          <p className="mt-1 text-sm text-gray-500">Управление функциями платформы</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Новый флаг
        </button>
      </div>

      {/* Stats */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-3">
          <p className="text-xs text-gray-400">Всего флагов</p>
          <p className="text-2xl font-bold text-gray-900">{allFlags.length}</p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3">
          <p className="text-xs text-green-600">Включено</p>
          <p className="text-2xl font-bold text-green-700">{enabledCount}</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3">
          <p className="text-xs text-violet-600">Глобальных</p>
          <p className="text-2xl font-bold text-violet-700">{globalCount}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1" style={{ maxWidth: 280 }}>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-gray-400 focus:border-violet-400"
          />
        </div>

        {/* Scope filter */}
        <div className="flex gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          {([['ALL', 'Все'], ['GLOBAL', 'Глобальные'], ['TENANT', 'По тенанту']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setScopeFilter(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                scopeFilter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Status filter */}
        <div className="flex gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          {([['ALL', 'Все'], ['ON', 'Вкл'], ['OFF', 'Выкл']] as const).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setStatusFilter(key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition',
                statusFilter === key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={5} />
      ) : filtered.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Название</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Описание</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Область</th>
                <th className="w-16 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((flag, i) => {
                const id = String(flag['id'] ?? '');
                const enabled = flag['enabled'] === true || flag['isEnabled'] === true;
                const name = String(flag['name'] ?? flag['key'] ?? '—');
                const description = String(flag['description'] ?? '');
                const tenantId = flag['tenant_id'] ?? flag['tenantId'] ?? null;
                const isGlobal = tenantId == null || tenantId === '' || tenantId === 'null';

                return (
                  <tr key={id || i} className="transition hover:bg-gray-50">
                    {/* Toggle */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => toggleMut.mutate({ id, enabled: !enabled })}
                        disabled={toggleMut.isPending}
                        className={cn(
                          'relative inline-flex h-6 w-11 items-center rounded-full transition',
                          enabled ? 'bg-green-500' : 'bg-gray-200',
                        )}
                      >
                        <span className={cn(
                          'inline-block h-4 w-4 rounded-full bg-white shadow transition',
                          enabled ? 'translate-x-6' : 'translate-x-1',
                        )} />
                      </button>
                    </td>
                    {/* Name */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-sm font-semibold text-gray-900">{name}</span>
                    </td>
                    {/* Description */}
                    <td className="max-w-[250px] truncate px-4 py-3 text-xs text-gray-500">
                      {description && description !== 'null' ? description : <span className="text-gray-300">—</span>}
                    </td>
                    {/* Scope */}
                    <td className="px-4 py-3">
                      {isGlobal ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-medium text-violet-700">
                          <Globe className="h-3 w-3" />
                          Глобальный
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                          <Building2 className="h-3 w-3" />
                          {String(tenantId).slice(0, 8)}...
                        </span>
                      )}
                    </td>
                    {/* Delete */}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => { if (confirm(`Удалить флаг "${name}"?`)) deleteMut.mutate(id); }}
                        className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : allFlags.length > 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
          <Search className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-400">Ничего не найдено по фильтрам</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white px-4 py-10 text-center">
          <Flag className="mx-auto h-8 w-8 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">Feature flags не созданы</p>
          <p className="mt-1 text-xs text-gray-400">Создайте первый флаг для управления функциями</p>
        </div>
      )}

      {/* Info banner */}
      <div className="mt-4 flex items-start gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
        <p className="text-xs text-blue-700">
          <strong>Глобальный</strong> — действует на всю платформу. <strong>По тенанту</strong> — только для конкретного тенанта.
          Проверяйте флаги через <code className="rounded bg-blue-100 px-1">GET /api/v1/features/:key</code>.
        </p>
      </div>

      {showCreate && <CreateFlagModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ─── Create Modal ────────────────────────────────────────────────────────────

function CreateFlagModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [scope, setScope] = useState<'GLOBAL' | 'TENANT'>('GLOBAL');
  const [tenantId, setTenantId] = useState('');
  const [enabled, setEnabled] = useState(false);

  const { data: tenants } = useQuery({
    queryKey: ['founder', 'tenants'],
    queryFn: () => founderApi.db.getTableData('tenants', { page: 1, limit: 100, sort: 'name', sortDir: 'asc' }),
    staleTime: 60_000,
  });

  const tenantList = (tenants?.rows ?? []).map((t) => ({
    id: String(t['id'] ?? ''),
    name: String(t['name'] ?? '—'),
    slug: String(t['slug'] ?? ''),
  }));

  const createMut = useMutation({
    mutationFn: () =>
      founderApi.db.createRow('feature_flags', {
        key: name,
        description: description || null,
        enabled,
        tenant_id: tenantId || null,
      }),
    onSuccess: () => {
      toast.success('Флаг создан');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'feature_flags'] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const inputCls = 'w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-violet-600" />
            <h3 className="font-semibold text-gray-900">Новый Feature Flag</h3>
          </div>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }} className="space-y-4 p-6">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Название (ключ)</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required placeholder="enable_ai_analytics" className={`${inputCls} font-mono`} />
            <p className="mt-1 text-[10px] text-gray-400">Используется в коде: snake_case без пробелов</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Описание</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Включает AI аналитику для тенанта" className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Область действия</label>
            <div className="flex gap-2">
              <button type="button" onClick={() => { setScope('GLOBAL'); setTenantId(''); }}
                className={cn('flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  scope === 'GLOBAL' ? 'border-violet-400 bg-violet-50 text-violet-700' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                <Globe className="mr-1.5 inline h-3.5 w-3.5" />Глобальный
              </button>
              <button type="button" onClick={() => setScope('TENANT')}
                className={cn('flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition',
                  scope === 'TENANT' ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500 hover:border-gray-300')}>
                <Building2 className="mr-1.5 inline h-3.5 w-3.5" />Для тенанта
              </button>
            </div>
          </div>
          {scope === 'TENANT' && (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Выберите тенант</label>
              <select value={tenantId} onChange={(e) => setTenantId(e.target.value)}
                className={inputCls}>
                <option value="">— Выберите тенант —</option>
                {tenantList.map((t) => (
                  <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-700">Включить сразу</p>
              <p className="text-xs text-gray-400">Флаг будет активен после создания</p>
            </div>
            <button
              type="button"
              onClick={() => setEnabled(!enabled)}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition',
                enabled ? 'bg-green-500' : 'bg-gray-200',
              )}
            >
              <span className={cn(
                'inline-block h-4 w-4 rounded-full bg-white shadow transition',
                enabled ? 'translate-x-6' : 'translate-x-1',
              )} />
            </button>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
              Отмена
            </button>
            <button type="submit" disabled={createMut.isPending || !name}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-5 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-50">
              {createMut.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
