'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserCog, Plus, Trash2, Shield, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { founderApi } from '@/api/founder.api';
import { extractErrorMessage } from '@/lib/utils';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';

export default function AdminsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-db', 'table-data', 'admin_users', 1],
    queryFn: () =>
      founderApi.db.getTableData('admin_users', { page: 1, limit: 50, sort: 'created_at', sortDir: 'desc' }),
    staleTime: 15_000,
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => founderApi.db.deleteRow('admin_users', id),
    onSuccess: () => {
      toast.success('Админ удалён');
      setDeleteTarget(null);
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'admin_users'] });
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  const admins = data?.rows ?? [];

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <UserCog className="h-6 w-6 text-violet-600" />
            Администраторы
          </h1>
          <p className="mt-1 text-sm text-gray-500">Управление Super Admin аккаунтами</p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-violet-700"
        >
          <Plus className="h-4 w-4" />
          Новый админ
        </button>
      </div>

      {isLoading ? (
        <LoadingSkeleton variant="table" rows={3} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Имя</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Роль</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Статус</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Создан</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {admins.map((admin, i) => (
                <tr key={String(admin['id'] ?? i)} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{String(admin['name'] ?? '—')}</td>
                  <td className="px-4 py-3 text-gray-600">{String(admin['email'] ?? '—')}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1 rounded-full bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-700">
                      <Shield className="h-3 w-3" />
                      {String(admin['role'] ?? 'SUPER_ADMIN')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {admin['is_active'] === true || admin['isActive'] === true ? (
                      <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">Активен</span>
                    ) : (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Неактивен</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {admin['created_at'] ? new Date(String(admin['created_at'])).toLocaleDateString('ru') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(String(admin['id']))}
                      className="rounded p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                      title="Удалить"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Удалить админа"
        message="Вы уверены? Это действие нельзя отменить."
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        variant="danger"
        isPending={deleteMut.isPending}
        onConfirm={() => deleteTarget && deleteMut.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
      />

      {showCreate && <CreateAdminModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function CreateAdminModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const createMut = useMutation({
    mutationFn: () => founderApi.createAdmin({ name, email, password }),
    onSuccess: () => {
      toast.success('Админ создан');
      queryClient.invalidateQueries({ queryKey: ['admin-db', 'table-data', 'admin_users'] });
      onClose();
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-900">Новый администратор</h3>
          <button type="button" onClick={onClose} className="rounded p-1 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); createMut.mutate(); }}
          className="space-y-3"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-500">Пароль</label>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-lg border border-gray-300 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50">
              Отмена
            </button>
            <button
              type="submit"
              disabled={createMut.isPending || !name || !email || !password}
              className="flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700 disabled:opacity-50"
            >
              {createMut.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Создать
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
