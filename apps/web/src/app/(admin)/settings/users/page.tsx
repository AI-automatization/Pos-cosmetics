'use client';

import { useState, useMemo } from 'react';
import { UserPlus, Shield, CheckCircle, XCircle, Building2, KeyRound, Eye, EyeOff, X } from 'lucide-react';
import { useUsers, useUpdateUser, useResetPassword } from '@/hooks/settings/useUsers';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { UserModal } from '@/components/settings/UserModal';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types/user';
import { ROLE_LABELS, ROLE_ORDER } from '@/types/user';

function ResetPasswordModal({
  user,
  onClose,
}: {
  user: User;
  onClose: () => void;
}) {
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { mutate: resetPassword, isPending } = useResetPassword();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) return;
    resetPassword({ id: user.id, newPassword }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Parolni yangilash</h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {user.firstName} {user.lastName}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Yangi parol <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={6}
                required
                placeholder="Kamida 6 belgi"
                className="w-full rounded-xl border border-gray-300 px-3 py-2.5 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={newPassword.length < 6 || isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RoleBadge({ role, isActive = true }: { role: UserRole; isActive?: boolean }) {
  const colors: Record<UserRole, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    WAREHOUSE: 'bg-amber-100 text-amber-700',
    CASHIER: 'bg-green-100 text-green-700',
    VIEWER: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', isActive ? colors[role] : 'bg-gray-100 text-gray-400')}>
      {ROLE_LABELS[role]}
    </span>
  );
}

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const [resetPwdUser, setResetPwdUser] = useState<User | undefined>();
  const [search, setSearch] = useState('');
  const { data: users, isLoading, isError, refetch } = useUsers();
  const { mutate: updateUser } = useUpdateUser();

  const filteredUsers = useMemo(() => {
    if (!users) return [];
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(q) ||
      (u.email ?? '').toLowerCase().includes(q),
    );
  }, [users, search]);

  if (isLoading) return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Foydalanuvchilar</h1>
          <p className="mt-0.5 text-sm text-gray-500">Yuklanmoqda...</p>
        </div>
      </div>
      <LoadingSkeleton variant="table" rows={5} />
    </div>
  );

  if (isError) return (
    <div className="p-6">
      <ErrorState compact onRetry={refetch} />
    </div>
  );

  const active = users?.filter((u) => u.isActive).length ?? 0;
  const total = users?.length ?? 0;

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Foydalanuvchilar</h1>
          <p className="mt-0.5 text-sm text-gray-500">{active} faol / {total} jami</p>
        </div>
        <button
          type="button"
          onClick={() => { setEditUser(undefined); setShowModal(true); }}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-4 w-4" />
          Foydalanuvchi qo&apos;shish
        </button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {ROLE_ORDER.map((role) => (
          <div key={role} className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5">
            <Shield className="h-3.5 w-3.5 text-gray-400" />
            <RoleBadge role={role} />
          </div>
        ))}
      </div>

      {/* Table */}
      <ScrollableTable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Ism yoki email bo'yicha qidirish..."
        totalCount={filteredUsers.length}
        isLoading={isLoading}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-gray-100 bg-gray-50">
            <tr>
              {['Ism', 'Email', 'Rol', 'Filial', "So'nggi kirish", 'Status', 'Amal'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredUsers.map((user) => (
              <tr key={user.id} className={cn('transition hover:bg-gray-50', !user.isActive && 'opacity-60')}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || '—'}
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">{user.email ?? '—'}</td>
                <td className="px-4 py-3"><RoleBadge role={user.role} isActive={user.isActive} /></td>
                <td className="px-4 py-3">
                  {user.branch ? (
                    <span className="flex items-center gap-1 text-xs text-gray-600">
                      <Building2 className="h-3.5 w-3.5 text-gray-400" />
                      {user.branch.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  {user.isActive
                    ? <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Faol</span>
                    : <span className="flex items-center gap-1 text-gray-400"><XCircle className="h-4 w-4" /> Nofaol</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => { setEditUser(user); setShowModal(true); }}
                      className="rounded-md border border-gray-200 px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50"
                    >
                      Tahrirlash
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetPwdUser(user)}
                      title="Parolni yangilash"
                      className="rounded-md border border-blue-200 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                    </button>
                    {user.role !== 'OWNER' && (
                      <button
                        type="button"
                        onClick={() => updateUser({ id: user.id, dto: { isActive: !user.isActive } })}
                        className={cn(
                          'rounded-md border px-2.5 py-1 text-xs',
                          user.isActive
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50',
                        )}
                      >
                        {user.isActive ? "O'chirish" : 'Yoqish'}
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

      {resetPwdUser && (
        <ResetPasswordModal
          user={resetPwdUser}
          onClose={() => setResetPwdUser(undefined)}
        />
      )}
    </div>
  );
}
