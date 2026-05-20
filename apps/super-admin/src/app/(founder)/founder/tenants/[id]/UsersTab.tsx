'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Shield, CheckCircle, XCircle, KeyRound, RefreshCw, Eye, EyeOff, Copy } from 'lucide-react';
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
  OWNER: 'bg-blue-100 text-blue-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  MANAGER: 'bg-emerald-100 text-emerald-700',
  CASHIER: 'bg-blue-100 text-blue-700',
  VIEWER: 'bg-gray-100 text-gray-600',
};

// ─── Password Reset Modal ─────────────────────────────────────────────────────

interface ResetPasswordModalProps {
  user: TenantUser;
  tenantId: string;
  onClose: () => void;
}

function generatePassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$';
  let pw = '';
  for (let i = 0; i < 12; i++) pw += chars[Math.floor(Math.random() * chars.length)];
  return pw;
}

function ResetPasswordModal({ user, tenantId, onClose }: ResetPasswordModalProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetMut = useMutation({
    mutationFn: (newPassword: string) =>
      founderApi.resetUserPassword(tenantId, user.id, newPassword),
    onSuccess: (data) => {
      toast.success(`Пароль обновлён для ${data.email}`);
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const handleGenerate = () => {
    const pw = generatePassword();
    setPassword(pw);
    setShowPassword(true);
  };

  const handleCopy = () => {
    if (!password) return;
    navigator.clipboard.writeText(password).then(() => toast.success('Скопировано'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().length < 6) {
      toast.error('Минимум 6 символов');
      return;
    }
    resetMut.mutate(password.trim());
  };

  const inputCls =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 pr-20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100">
            <KeyRound className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Сброс пароля</h2>
            <p className="text-sm text-gray-500">
              {[user.firstName, user.lastName].filter(Boolean).join(' ') || user.email}
            </p>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Новый пароль <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите или сгенерируйте пароль"
                className={inputCls}
                minLength={6}
                required
              />
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded p-1 text-gray-400 hover:text-gray-600"
                  title={showPassword ? 'Скрыть' : 'Показать'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                {password && (
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="rounded p-1 text-gray-400 hover:text-gray-600"
                    title="Скопировать"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            className="flex items-center gap-2 self-start rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-600 transition hover:border-blue-400 hover:text-blue-600"
          >
            <RefreshCw className="h-4 w-4" />
            Сгенерировать пароль
          </button>

          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={!password.trim() || resetMut.isPending}
              className={cn(
                'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition',
                'bg-blue-500 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              <KeyRound className="h-4 w-4" />
              {resetMut.isPending ? 'Сохранение...' : 'Сохранить пароль'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

// Table of tenant users + add owner modal + password reset
export function UsersTab({ tenantId, tenantName }: UsersTabProps) {
  const queryClient = useQueryClient();
  const [showAddOwner, setShowAddOwner] = useState(false);
  const [resetPasswordUser, setResetPasswordUser] = useState<TenantUser | null>(null);

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
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
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
                <th className="px-4 py-3"></th>
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
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setResetPasswordUser(user)}
                      title="Сбросить пароль"
                      className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs text-gray-500 transition hover:border-blue-300 hover:text-blue-600"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Пароль
                    </button>
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

      {/* Reset password modal */}
      {resetPasswordUser && (
        <ResetPasswordModal
          user={resetPasswordUser}
          tenantId={tenantId}
          onClose={() => setResetPasswordUser(null)}
        />
      )}
    </div>
  );
}
