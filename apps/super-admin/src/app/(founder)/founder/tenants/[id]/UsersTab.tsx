'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { cn, extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { AddOwnerModal } from './AddOwnerModal';

interface UsersTabProps {
  tenantId: string;
  tenantName: string;
}

interface TenantUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  isActive?: boolean;
  branchName?: string;
  lastLoginAt?: string;
}

const ROLE_BADGES: Record<string, string> = {
  OWNER: 'bg-violet-100 text-violet-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MANAGER: 'bg-emerald-100 text-emerald-700',
  CASHIER: 'bg-amber-100 text-amber-700',
  VIEWER: 'bg-gray-100 text-gray-600',
};

// Table of tenant users + add owner modal
export function UsersTab({ tenantId, tenantName }: UsersTabProps) {
  const queryClient = useQueryClient();
  const [showAddOwner, setShowAddOwner] = useState(false);

  const { data: users, isLoading } = useQuery<TenantUser[]>({
    queryKey: ['founder', 'tenant-users', tenantId],
    queryFn: () => founderApi.getTenantUsers(tenantId),
    staleTime: 30_000,
  });

  const addOwnerMut = useMutation({
    mutationFn: (data: { firstName: string; lastName: string; email: string; phone?: string; password?: string }) =>
      founderApi.addOwner(tenantId, data),
    onSuccess: () => {
      toast.success('Owner добавлен');
      setShowAddOwner(false);
      queryClient.invalidateQueries({ queryKey: ['founder', 'tenant-users', tenantId] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  if (isLoading) return <LoadingSkeleton variant="table" rows={5} />;

  const userList = Array.isArray(users) ? users : [];

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Всего: <span className="font-medium text-gray-700">{userList.length}</span> пользователей
        </p>
        <button
          type="button"
          onClick={() => setShowAddOwner(true)}
          className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-700"
        >
          <UserPlus className="h-4 w-4" />
          Добавить Owner
        </button>
      </div>

      {/* Table */}
      {userList.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 py-12">
          <Shield className="h-8 w-8 text-gray-300" />
          <p className="text-sm text-gray-400">Пользователи не найдены</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                <th className="px-4 py-3">Имя</th>
                <th className="px-4 py-3">Email / Телефон</th>
                <th className="px-4 py-3">Роль</th>
                <th className="px-4 py-3">Филиал</th>
                <th className="px-4 py-3">Статус</th>
                <th className="px-4 py-3">Последний вход</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {userList.map((user) => (
                <tr key={user.id} className="transition hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {[user.firstName, user.lastName].filter(Boolean).join(' ') || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-700">{user.email ?? '—'}</p>
                    {user.phone && (
                      <p className="font-mono text-xs text-gray-400">{user.phone}</p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold',
                        ROLE_BADGES[user.role ?? ''] ?? ROLE_BADGES.VIEWER,
                      )}
                    >
                      {user.role ?? 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {user.branchName ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {user.isActive !== false ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-600">
                        <CheckCircle className="h-3.5 w-3.5" />
                        Активен
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-medium text-red-500">
                        <XCircle className="h-3.5 w-3.5" />
                        Неактивен
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {user.lastLoginAt
                      ? new Date(user.lastLoginAt).toLocaleString('ru-RU')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add owner modal */}
      <AddOwnerModal
        isOpen={showAddOwner}
        onClose={() => setShowAddOwner(false)}
        onSave={(data) => addOwnerMut.mutate(data)}
        isPending={addOwnerMut.isPending}
        tenantName={tenantName}
      />
    </div>
  );
}
