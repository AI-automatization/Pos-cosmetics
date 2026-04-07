'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import type { Category } from '@/types/catalog';

const categorySchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart').max(100),
  parentId: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  category?: Category | null;
  categories: Category[];
  isPending: boolean;
  onSubmit: (data: CategoryFormData) => void;
  onClose: () => void;
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export function CategoryForm({
  category,
  categories,
  isPending,
  onSubmit,
  onClose,
}: CategoryFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: category
      ? { name: category.name, parentId: category.parentId ?? '' }
      : { name: '', parentId: '' },
  });

  const parentIdValue = watch('parentId') ?? '';

  // exclude self from parent options
  const parentOptions = categories.filter((c) => c.id !== category?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-md rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {category ? 'Kategoriyani tahrirlash' : 'Yangi kategoriya'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Nomi <span className="text-red-500">*</span>
              </label>
              <input
                {...register('name')}
                placeholder="Masalan: Yuz kremi"
                className={inputCls}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Ota kategoriya
              </label>
              <SearchableDropdown
                options={parentOptions.map((cat) => ({
                  value: cat.id,
                  label: cat.name,
                }))}
                value={parentIdValue}
                onChange={(val) => setValue('parentId', val)}
                placeholder="— Yuqori daraja —"
                searchable={parentOptions.length >= 6}
                clearable
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saqlanmoqda...' : category ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
