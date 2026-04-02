'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Building2, Plus, Pencil, Trash2, X, CheckCircle, XCircle } from 'lucide-react';
import { useBranches, useCreateBranch, useUpdateBranch, useDeactivateBranch } from '@/hooks/settings/useBranches';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import type { Branch } from '@/api/branches.api';

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
          <p className="text-sm text-gray-500">Do'kon filiallarini boshqarish</p>
        </div>
        <button
          onClick={() => setModal({ open: true, branch: null })}
          className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          Filial qo'shish
        </button>
      </div>

      {!branches?.length ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 py-16">
          <Building2 className="mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm font-medium text-gray-500">Hali filial yo'q</p>
          <p className="mt-1 text-xs text-gray-400">Yuqoridagi tugmani bosib yangi filial qo'shing</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-xs font-medium text-gray-500">
                <th className="px-5 py-3">Filial nomi</th>
                <th className="px-5 py-3">Manzil</th>
                <th className="px-5 py-3">Holat</th>
                <th className="px-5 py-3 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {branches.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium text-gray-900">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{b.address ?? '—'}</td>
                  <td className="px-5 py-3.5">
                    {b.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                        <CheckCircle className="h-3 w-3" /> Aktiv
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600">
                        <XCircle className="h-3 w-3" /> Nofaol
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-2">
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
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
