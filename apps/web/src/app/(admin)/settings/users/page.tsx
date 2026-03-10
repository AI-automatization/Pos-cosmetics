'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserPlus, Shield, CheckCircle, XCircle, X } from 'lucide-react';
import { useUsers, useCreateUser, useUpdateUser } from '@/hooks/settings/useUsers';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types/user';
import { ROLE_LABELS, ROLE_ORDER } from '@/types/user';

const userSchema = z.object({
  name: z.string().min(2, "Ism kamida 2 belgi"),
  phone: z.string().regex(/^\+998\d{9}$/, "+998 bilan boshlangan 12 raqam"),
  password: z.string().min(6, "Parol kamida 6 belgi").optional().or(z.literal('')),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'VIEWER'] as const),
});
type UserForm = z.infer<typeof userSchema>;

function RoleBadge({ role, isActive = true }: { role: UserRole; isActive?: boolean }) {
  const colors: Record<UserRole, string> = {
    OWNER: 'bg-purple-100 text-purple-700',
    ADMIN: 'bg-red-100 text-red-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    CASHIER: 'bg-green-100 text-green-700',
    VIEWER: 'bg-gray-100 text-gray-600',
  };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', isActive ? colors[role] : 'bg-gray-100 text-gray-400')}>
      {ROLE_LABELS[role]}
    </span>
  );
}

function UserModal({ user, onClose }: { user?: User; onClose: () => void }) {
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '+998',
      role: user?.role ?? 'CASHIER',
      password: '',
    },
  });

  const onSubmit = (data: UserForm) => {
    if (user) {
      updateUser(
        { id: user.id, dto: { name: data.name, phone: data.phone, role: data.role } },
        { onSuccess: onClose },
      );
    } else {
      if (!data.password) return;
      createUser(
        { name: data.name, phone: data.phone, role: data.role, password: data.password },
        { onSuccess: onClose },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {user ? 'Foydalanuvchi tahrirlash' : "Yangi foydalanuvchi qo'shish"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ism va familiya</label>
            <input {...register('name')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefon</label>
            <input {...register('phone')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          {!user && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Parol</label>
              <input type="password" {...register('password')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
            <select {...register('role')} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-400">
              {ROLE_ORDER.filter((r) => r !== 'OWNER').map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role]}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Bekor
            </button>
            <button type="submit" disabled={isPending} className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60">
              {isPending ? 'Saqlanmoqda...' : user ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | undefined>();
  const { data: users, isLoading } = useUsers();
  const { mutate: updateUser } = useUpdateUser();

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
          Foydalanuvchi qo'shish
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
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['Ism', 'Telefon', 'Rol', 'So\'nggi kirish', 'Status', 'Amal'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {(users ?? []).map((user) => (
              <tr key={user.id} className={cn('transition hover:bg-gray-50', !user.isActive && 'opacity-60')}>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {/* B-014 fix: API returns firstName+lastName, not name */}
                  {`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email}
                </td>
                <td className="px-4 py-3 font-mono text-gray-600">{user.phone ?? '—'}</td>
                <td className="px-4 py-3"><RoleBadge role={user.role} isActive={user.isActive} /></td>
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
      </div>

      {showModal && (
        <UserModal user={editUser} onClose={() => { setShowModal(false); setEditUser(undefined); }} />
      )}
    </div>
  );
}
