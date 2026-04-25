'use client';

import { useState, useMemo } from 'react';
import {
  UserPlus, Shield, CheckCircle, XCircle,
  Building2, Users, UserCheck, UserX,
} from 'lucide-react';
import { useUsers, useUpdateUser } from '@/hooks/settings/useUsers';
import { useBranches } from '@/hooks/settings/useBranches';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { UserModal } from '@/components/settings/UserModal';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types/user';
import { ROLE_LABELS, ROLE_ORDER } from '@/types/user';

/* ─── Role badge ─── */
const ROLE_COLORS: Record<UserRole, string> = {
  OWNER:     'bg-purple-100 text-purple-700',
  ADMIN:     'bg-red-100 text-red-700',
  MANAGER:   'bg-blue-100 text-blue-700',
  WAREHOUSE: 'bg-amber-100 text-amber-700',
  CASHIER:   'bg-green-100 text-green-700',
  VIEWER:    'bg-gray-100 text-gray-600',
};

function RoleBadge({ role, isActive = true }: { role: UserRole; isActive?: boolean }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', isActive ? ROLE_COLORS[role] : 'bg-gray-100 text-gray-400')}>
      {ROLE_LABELS[role]}
    </span>
  );
}

/* ─── Page ─── */
export default function WorkersPage() {
  const [showModal,  setShowModal]  = useState(false);
  const [editUser,   setEditUser]   = useState<User | undefined>();
  const [search,     setSearch]     = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [branchFilter, setBranchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const { data: users, isLoading, isError, refetch } = useUsers();
  const { mutate: updateUser } = useUpdateUser();
  const { data: branches = [] } = useBranches();

  /* ─── Stats ─── */
  const stats = useMemo(() => {
    if (!users) return null;
    const workers = users.filter((u) => u.role !== 'OWNER');
    const active  = workers.filter((u) => u.isActive).length;
    const byRole  = ROLE_ORDER.filter((r) => r !== 'OWNER').map((role) => ({
      role,
      count: workers.filter((u) => u.role === role).length,
    })).filter((r) => r.count > 0);
    return { total: workers.length, active, inactive: workers.length - active, byRole };
  }, [users]);

  /* ─── Filtered list ─── */
  const filtered = useMemo(() => {
    if (!users) return [];
    let list = users.filter((u) => u.role !== 'OWNER');

    if (search) {
      const q = search.toLowerCase();
      list = list.filter((u) =>
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q),
      );
    }
    if (roleFilter)   list = list.filter((u) => u.role === roleFilter);
    if (branchFilter) list = list.filter((u) => u.branchId === branchFilter);
    if (statusFilter === 'active')   list = list.filter((u) => u.isActive);
    if (statusFilter === 'inactive') list = list.filter((u) => !u.isActive);

    return list;
  }, [users, search, roleFilter, branchFilter, statusFilter]);

  if (isLoading) return (
    <div className="flex flex-col gap-6 p-6">
      <div className="h-7 w-48 animate-pulse rounded bg-gray-200" />
      <LoadingSkeleton variant="table" rows={6} />
    </div>
  );
  if (isError) return <div className="p-6"><ErrorState compact onRetry={refetch} /></div>;

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Xodimlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {stats ? `${stats.active} faol / ${stats.total} jami` : 'Yuklanmoqda...'}
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setEditUser(undefined); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Yangi xodim
        </button>
      </div>

      {/* Stats row */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Jami</p>
              <p className="text-lg font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-green-100 bg-green-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-green-700">Faol</p>
              <p className="text-lg font-bold text-green-700">{stats.active}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-200">
              <UserX className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Nofaol</p>
              <p className="text-lg font-bold text-gray-600">{stats.inactive}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl border border-gray-100 bg-white px-4 py-3">
            {stats.byRole.map(({ role, count }) => (
              <span key={role} className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_COLORS[role])}>
                {ROLE_LABELS[role]} {count}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Status tabs */}
        <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
          {([['all', 'Barchasi'], ['active', 'Faol'], ['inactive', 'Nofaol']] as const).map(([key, label]) => (
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

        {/* Role filter */}
        <div className="w-40">
          <SearchableDropdown
            options={ROLE_ORDER.filter((r) => r !== 'OWNER').map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
            value={roleFilter}
            onChange={(val) => setRoleFilter(val)}
            placeholder="Barcha rollar"
            searchable={false}
            clearable
          />
        </div>

        {/* Branch filter */}
        {branches.length > 1 && (
          <div className="w-44">
            <SearchableDropdown
              options={branches.filter((b) => b.isActive).map((b) => ({ value: b.id, label: b.name }))}
              value={branchFilter}
              onChange={(val) => setBranchFilter(val)}
              placeholder="Barcha filiallar"
              searchable={branches.length > 4}
              clearable
            />
          </div>
        )}

        {/* Role legend */}
        <div className="ml-auto hidden items-center gap-1.5 sm:flex">
          <Shield className="h-3.5 w-3.5 text-gray-400" />
          {ROLE_ORDER.filter((r) => r !== 'OWNER').map((role) => (
            <RoleBadge key={role} role={role} />
          ))}
        </div>
      </div>

      {/* Table */}
      <ScrollableTable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ism yoki email bo'yicha..."
        totalCount={filtered.length}
        isLoading={false}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-gray-100 bg-gray-50">
            <tr>
              {['Xodim', 'Email', 'Rol', 'Filial', "So'nggi kirish", 'Holat', 'Amallar'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                  <Users className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  <p className="text-sm">{search ? "Qidiruv bo'yicha natija topilmadi" : "Xodimlar yo'q"}</p>
                </td>
              </tr>
            ) : filtered.map((u) => (
              <tr key={u.id} className={cn('transition hover:bg-gray-50', !u.isActive && 'opacity-60')}>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                      {(u.firstName?.[0] ?? u.email?.[0] ?? '?').toUpperCase()}
                    </div>
                    <span className="font-medium text-gray-900">
                      {`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || '—'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{u.email ?? '—'}</td>
                <td className="px-4 py-3"><RoleBadge role={u.role} isActive={u.isActive} /></td>
                <td className="px-4 py-3">
                  {u.branch ? (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {u.branch.name}
                    </span>
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {(u as User & { lastLogin?: string }).lastLogin
                    ? new Date((u as User & { lastLogin: string }).lastLogin).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {u.isActive
                    ? <span className="flex items-center gap-1 text-xs text-green-600"><CheckCircle className="h-3.5 w-3.5" />Faol</span>
                    : <span className="flex items-center gap-1 text-xs text-gray-400"><XCircle className="h-3.5 w-3.5" />Nofaol</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditUser(u); setShowModal(true); }}
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-700 transition hover:bg-gray-50"
                    >
                      Tahrirlash
                    </button>
                    {u.role !== 'OWNER' && (
                      <button
                        type="button"
                        onClick={() => updateUser({ id: u.id, dto: { isActive: !u.isActive } })}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-xs transition',
                          u.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50',
                        )}
                      >
                        {u.isActive ? "O'chirish" : 'Yoqish'}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollableTable>

      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(undefined); }}
        />
      )}
    </div>
  );
}
