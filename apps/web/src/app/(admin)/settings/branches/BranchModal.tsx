'use client';

import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateBranch, useUpdateBranch } from '@/hooks/settings/useBranches';
import { useTranslation } from '@/i18n/i18n-context';
import { cn } from '@/lib/utils';
import type { Branch } from '@/api/branches.api';

const branchSchema = z.object({
  name: z.string().min(2, 'Filial nomi kamida 2 belgi'),
  address: z.string().optional(),
});
type BranchForm = z.infer<typeof branchSchema>;

interface Props {
  branch: Branch | null;
  onClose: () => void;
}

export function BranchModal({ branch, onClose }: Props) {
  const { t } = useTranslation();
  const { mutate: create, isPending: creating } = useCreateBranch();
  const { mutate: update, isPending: updating } = useUpdateBranch();
  const isPending = creating || updating;

  const { register, handleSubmit, formState: { errors } } = useForm<BranchForm>({
    resolver: zodResolver(branchSchema),
    defaultValues: { name: branch?.name ?? '', address: branch?.address ?? '' },
  });

  const onSubmit = (data: BranchForm) => {
    if (branch) {
      update({ id: branch.id, dto: data }, { onSuccess: onClose });
    } else {
      create(data, { onSuccess: onClose });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {branch ? t('branches.editBranch') : t('branches.newBranch')}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              {t('branches.branchName')} <span className="text-red-500">*</span>
            </label>
            <input
              {...register('name')}
              placeholder="Tashkent Yunusobod"
              className={cn(
                'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-blue-500/20',
                errors.name ? 'border-red-400' : 'border-gray-300 focus:border-blue-500',
              )}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('branches.address')}</label>
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
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? t('common.saving') : branch ? t('common.save') : t('common.create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
