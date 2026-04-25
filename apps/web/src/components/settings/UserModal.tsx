'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Eye, EyeOff, RefreshCw, Copy, CheckCheck } from 'lucide-react';
import { useCreateUser, useUpdateUser } from '@/hooks/settings/useUsers';
import { useBranches } from '@/hooks/settings/useBranches';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import type { User, UserRole } from '@/types/user';
import { ROLE_ORDER } from '@/types/user';

const ROLE_OPTIONS: { value: UserRole; label: string; sub: string }[] = [
  { value: 'ADMIN',     label: 'Admin',     sub: "Hamma narsaga kirish" },
  { value: 'MANAGER',   label: 'Menejer',   sub: "Hisobot, kassa, inventar" },
  { value: 'WAREHOUSE', label: 'Omborchi',  sub: "Faqat ombor" },
  { value: 'CASHIER',   label: 'Kassir',    sub: "Faqat kassa, savdo" },
  { value: 'VIEWER',    label: "Ko'ruvchi", sub: "Faqat ko'rish, o'zgartira olmaydi" },
];

const userSchema = z.object({
  firstName: z.string().min(1, 'Ism kiritilishi shart'),
  lastName:  z.string().min(1, 'Familiya kiritilishi shart'),
  email:     z.string().email("Noto'g'ri email format"),
  password:  z.string().min(8, 'Parol kamida 8 belgi').optional().or(z.literal('')),
  role:      z.enum(['OWNER', 'ADMIN', 'MANAGER', 'WAREHOUSE', 'CASHIER', 'VIEWER'] as const),
  branchId:  z.string().optional(),
});
type UserForm = z.infer<typeof userSchema>;

interface CredentialsInfo { email: string; password: string }

interface UserModalProps {
  user?: User;
  initialBranchId?: string;
  lockBranchId?: boolean;
  onClose: () => void;
}

function generatePassword(): string {
  const chars = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#';
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function CredentialsBox({ creds, onClose }: { creds: CredentialsInfo; onClose: () => void }) {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPass,  setCopiedPass]  = useState(false);

  const copy = (text: string, setDone: (v: boolean) => void) => {
    void navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  };

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <CheckCheck className="h-4 w-4 text-green-600" />
        <p className="text-sm font-semibold text-green-700">Xodim qo&apos;shildi! Loginni saqlang:</p>
      </div>
      <div className="flex flex-col gap-2">
        {[
          { label: 'Email', value: creds.email, copied: copiedEmail, onCopy: () => copy(creds.email, setCopiedEmail) },
          { label: 'Parol', value: creds.password, copied: copiedPass, onCopy: () => copy(creds.password, setCopiedPass) },
        ].map(({ label, value, copied, onCopy }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-green-200 bg-white px-3 py-2">
            <span className="w-12 shrink-0 text-xs font-medium text-gray-500">{label}:</span>
            <span className="flex-1 font-mono text-sm text-gray-900">{value}</span>
            <button
              type="button"
              onClick={onCopy}
              className="rounded p-1 text-gray-400 transition hover:text-green-600"
              title="Nusxa olish"
            >
              {copied ? <CheckCheck className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-green-600">
        Diqqat: bu parolni keyinchalik ko&apos;rib bo&apos;lmaydi.
      </p>
      <button
        type="button"
        onClick={onClose}
        className="mt-3 w-full rounded-lg bg-green-600 py-2 text-sm font-medium text-white transition hover:bg-green-700"
      >
        Tushunarli, yopish
      </button>
    </div>
  );
}

export function UserModal({ user, initialBranchId, lockBranchId, onClose }: UserModalProps) {
  const { mutate: createUser, isPending: creating } = useCreateUser();
  const { mutate: updateUser, isPending: updating } = useUpdateUser();
  const { data: branches = [] } = useBranches();
  const isPending = creating || updating;

  const [showPassword,       setShowPassword]       = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<CredentialsInfo | null>(null);

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: user?.firstName ?? '',
      lastName:  user?.lastName  ?? '',
      email:     user?.email     ?? '',
      role:      (user?.role ?? 'CASHIER') as UserRole,
      password:  '',
      branchId:  user?.branchId ?? initialBranchId ?? '',
    },
  });
  const roleValue   = watch('role')     ?? 'CASHIER';
  const branchValue = watch('branchId') ?? '';

  const handleGenerate = () => {
    const pwd = generatePassword();
    setValue('password', pwd);
    setShowPassword(true);
  };

  const onSubmit = (data: UserForm) => {
    if (user) {
      updateUser(
        { id: user.id, dto: { firstName: data.firstName, lastName: data.lastName, role: data.role, branchId: data.branchId || undefined } },
        { onSuccess: onClose },
      );
    } else {
      if (!data.password) return;
      const emailVal    = data.email;
      const passwordVal = data.password;
      createUser(
        { email: emailVal, firstName: data.firstName, lastName: data.lastName, password: passwordVal, role: data.role, branchId: data.branchId || undefined },
        { onSuccess: () => setCreatedCredentials({ email: emailVal, password: passwordVal }) },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={!createdCredentials ? onClose : undefined} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {user ? 'Xodimni tahrirlash' : "Yangi xodim qo'shish"}
          </h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {createdCredentials ? (
            <CredentialsBox creds={createdCredentials} onClose={onClose} />
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
              {/* Name */}
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

              {/* Email */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email (login uchun)</label>
                <input
                  {...register('email')}
                  type="email"
                  placeholder="ali@example.com"
                  disabled={!!user}
                  className={cn(
                    'w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-100',
                    errors.email ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                    user && 'cursor-not-allowed bg-gray-50 text-gray-500',
                  )}
                />
                {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
              </div>

              {/* Password (create only) */}
              {!user && (
                <div>
                  <div className="mb-1 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Parol</label>
                    <button
                      type="button"
                      onClick={handleGenerate}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 transition hover:text-blue-700"
                    >
                      <RefreshCw className="h-3 w-3" />
                      Tasodifiy parol
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password')}
                      placeholder="Kamida 8 belgi"
                      className={cn(
                        'w-full rounded-lg border px-3 py-2 pr-10 text-sm outline-none focus:ring-2 focus:ring-blue-100',
                        errors.password ? 'border-red-400' : 'border-gray-300 focus:border-blue-400',
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
                </div>
              )}

              {/* Role */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Rol</label>
                <SearchableDropdown
                  options={ROLE_OPTIONS.filter((r) => r.value !== 'OWNER').map((r) => ({
                    value: r.value,
                    label: r.label,
                    sublabel: r.sub,
                  }))}
                  value={roleValue}
                  onChange={(val) => { if (val) setValue('role', val as UserRole); }}
                  placeholder="Rolni tanlang"
                  searchable={false}
                  clearable={false}
                />
              </div>

              {/* Branch */}
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
          )}
        </div>
      </div>
    </div>
  );
}
