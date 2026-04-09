'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/hooks/settings/useUsers';
import { useBranches } from '@/hooks/settings/useBranches';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types/user';
import { ROLE_LABELS, ROLE_ORDER } from '@/types/user';

const userSchema = z.object({
  firstName: z.string().min(1, 'Ism kiritilishi shart'),
  lastName: z.string().min(1, 'Familiya kiritilishi shart'),
  email: z.string().email("Noto'g'ri email format"),
  password: z.string().min(8, 'Parol kamida 8 belgi').optional().or(z.literal('')),
  role: z.enum(['OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER', 'VIEWER'] as const),
  branchId: z.string().optional(),
});
type UserForm = z.infer<typeof userSchema>;

interface UserModalProps {
  user?: User;
  initialBranchId?: string;
  lockBranchId?: boolean;
  onClose: () => void;
}

export function UserModal({ user, initialBranchId, lockBranchId, onClose }: UserModalProps) {
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const { data: branches = [] } = useBranches();
  const isPending = creating || updating;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName: user?.lastName ?? '',
      email: user?.email ?? '',
      role: (user?.role ?? 'CASHIER') as UserRole,
      password: '',
      branchId: user?.branchId ?? initialBranchId ?? '',
    },
  });
  const roleValue = watch('role') ?? 'CASHIER';
  const branchValue = watch('branchId') ?? '';

  const onSubmit = (data: UserForm) => {
    if (user) {
      updateUser(
        {
          id: user.id,
          dto: {
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role,
            branchId: data.branchId || undefined,
          },
        },
        { onSuccess: onClose },
      );
    } else {
      if (!data.password) return;
      createUser(
        {
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          password: data.password,
          role: data.role,
          branchId: data.branchId || undefined,
        },
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
            {user ? 'Foydalanuvchi tahrirlash' : "Yangi xodim qo'shish"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Ism</label>
              <input
                {...register('firstName')}
                placeholder="Ali"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100',
                  errors.firstName ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Familiya</label>
              <input
                {...register('lastName')}
                placeholder="Karimov"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100',
                  errors.lastName ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email (login uchun)
            </label>
            <input
              {...register('email')}
              type="email"
              placeholder="ali@example.com"
              disabled={!!user}
              className={cn(
                'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100',
                errors.email ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                user && 'bg-gray-50 text-gray-500 cursor-not-allowed',
              )}
            />
            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
          </div>

          {!user && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Parol</label>
              <input
                type="password"
                {...register('password')}
                placeholder="Kamida 8 belgi"
                className={cn(
                  'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100',
                  errors.password ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                )}
              />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
            <SearchableDropdown
              options={ROLE_ORDER.filter((r) => r !== 'OWNER').map((role) => ({
                value: role,
                label: ROLE_LABELS[role],
              }))}
              value={roleValue}
              onChange={(val) => { if (val) setValue('role', val as UserRole); }}
              placeholder="Rolni tanlang"
              searchable={false}
              clearable={false}
            />
          </div>

          {lockBranchId && initialBranchId ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Filial</label>
              <div className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                {branches.find((b) => b.id === initialBranchId)?.name ?? initialBranchId}
              </div>
            </div>
          ) : (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Filial <span className="font-normal text-gray-400">(ixtiyoriy)</span>
              </label>
              <SearchableDropdown
                options={branches.filter((b) => b.isActive).map((b) => ({ value: b.id, label: b.name }))}
                value={branchValue}
                onChange={(val) => setValue('branchId', val || undefined)}
                placeholder="— Filial tanlang —"
                searchable={branches.length > 4}
                clearable
              />
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-gray-300 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              Bekor
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 rounded-lg bg-blue-600 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {isPending ? 'Saqlanmoqda...' : user ? 'Saqlash' : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
