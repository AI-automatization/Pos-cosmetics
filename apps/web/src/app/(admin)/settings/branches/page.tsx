'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Building2, Plus, Pencil, Trash2, X, CheckCircle, XCircle,
  UserPlus, Users, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useBranches, useCreateBranch, useUpdateBranch, useDeactivateBranch } from '@/hooks/settings/useBranches';
import { useUsers } from '@/hooks/settings/useUsers';
import { UserModal } from '@/components/settings/UserModal';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { Branch } from '@/api/branches.api';
import { ROLE_LABELS } from '@/types/user';

const branchSchema = z.object({
  name: z.string().min(2, 'Filial nomi kamida 2 belgi'),
  address: z.string().optional(),
});
type BranchForm = z.infer<typeof branchSchema>;

function BranchModal({
  branch,
  onClose,
}: {
  branch: Branch | null;
  onClose: () => void;
}) {
  const { mutate: create, isPending: creating } = useCreateBranch();
  const { mutate: update, isPending: updating } = useUpdateBranch();
  const isPending = creating || updating;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      name: branch?.name ?? '',
      address: branch?.address ?? '',
    },
  });

  const onSubmit = (data: BranchForm) => {
    if (branch) {
      update(
        { id: branch.id, dto: data },
        { onSuccess: onClose },
      );
    } else {
      create(data, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {branch ? 'Filialni tahrirlash' : 'Yangi filial'}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Filial nomi <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Tashkent Yunusobod"
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20',
                errors.name ? 'border-red-400' : 'border-gray-300 focus:border-blue-500',
              )}
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Manzil</label>
            <input
              {...register('address')}
              placeholder="Yunusobod 5-mavze"
              className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saqlanmoqda...' : branch ? 'Saqlash' : 'Yaratish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BranchEmployees({ branch }: { branch: Branch }) {
  const [expanded, setExpanded] = useState(false);
  const [addEmployee, setAddEmployee] = useState(false);
  const { data: users = [], isLoading } = useUsers(expanded ? branch.id : undefined);

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center justify-between px-5 py-2.5 bg-gray-50/60">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Users className="h-4 w-4 text-gray-400" />
          <span className="font-medium">Xodimlar</span>
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5 text-gray-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setAddEmployee(true)}
          className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
        >
          <UserPlus className="h-3.5 w-3.5" />
          Xodim qo&apos;shish
        </button>
      </div>

      {expanded && (
        <div className="px-5 pb-3 pt-2">
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-8 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <p className="py-3 text-center text-sm text-gray-400">
              Bu filialda xodim yo&apos;q.{' '}
              <button
                type="button"
                onClick={() => setAddEmployee(true)}
                className="text-blue-600 hover:underline"
              >
                Birinchi xodimni qo&apos;shing
              </button>
            </p>
          ) : (
            <div className="divide-y divide-gray-100">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-2">
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {`${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email}
                    </span>
                    <span className="ml-2 text-xs text-gray-400">{u.email}</span>
                  </div>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    u.role === 'WAREHOUSE' ? 'bg-amber-100 text-amber-700' :
                    u.role === 'CASHIER' ? 'bg-green-100 text-green-700' :
                    u.role === 'MANAGER' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-600',
                  )}>
                    {ROLE_LABELS[u.role]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {addEmployee && (
        <UserModal
          initialBranchId={branch.id}
          onClose={() => setAddEmployee(false)}
        />
      )}
    </div>
  );
}

export default function BranchesPage() {
  const { data: branches, isLoading } = useBranches();
  const { mutate: deactivate } = useDeactivateBranch();
  const [modal, setModal] = useState<{ open: boolean; branch: Branch | null }>({
    open: false,
    branch: null,
  });

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Filiallar</h1>
          <p className="text-sm text-gray-500">Do&apos;kon filiallarini va xodimlarini boshqarish</p>
        </div>
        <button
          onClick={() => setModal({ open: true, branch: null })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Filial qo&apos;shish
        </button>
      </div>

      {!branches?.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16">
          <Building2 className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Hali filial yo&apos;q</p>
          <p className="mt-1 text-xs text-gray-400">Yuqoridagi tugmani bosib yangi filial qo&apos;shing</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {branches.map((b) => (
            <div key={b.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              {/* Branch header row */}
              <div className="flex items-center px-5 py-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Building2 className="h-4.5 w-4.5 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{b.name}</p>
                    {b.address && (
                      <p className="text-xs text-gray-500 truncate">{b.address}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {b.isActive ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                      <CheckCircle className="h-3 w-3" /> Aktiv
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                      <XCircle className="h-3 w-3" /> Nofaol
                    </span>
                  )}
                  <button
                    onClick={() => setModal({ open: true, branch: b })}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Tahrirlash"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`"${b.name}" filialni o'chirmoqchimisiz?`)) {
                        deactivate(b.id);
                      }
                    }}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    title="O'chirish"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Employees section */}
              <BranchEmployees branch={b} />
            </div>
          ))}
        </div>
      )}

      {modal.open && (
        <BranchModal
          branch={modal.branch}
          onClose={() => setModal({ open: false, branch: null })}
        />
      )}
    </div>
  );
}
