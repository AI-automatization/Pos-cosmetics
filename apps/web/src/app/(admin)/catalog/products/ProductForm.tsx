'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/catalog';

const productSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart').max(200),
  barcode: z.string().optional(),
  sku: z.string().min(1, 'SKU kiritilishi shart').max(100),
  categoryId: z.string().min(1, 'Kategoriya tanlanishi shart'),
  costPrice: z.coerce.number().min(0, 'Narx manfiy bo\'lishi mumkin emas'),
  sellPrice: z.coerce.number().min(0, 'Narx manfiy bo\'lishi mumkin emas'),
  minStockLevel: z.coerce.number().min(0),
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  isPending: boolean;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
}

interface FieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

function Field({ label, error, required, className, children }: FieldProps) {
  return (
    <div className={cn(className)}>
      <label className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

export function ProductForm({
  product,
  categories,
  isPending,
  onSubmit,
  onClose,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as import('react-hook-form').Resolver<ProductFormData>,
    defaultValues: product
      ? {
          name: product.name ?? '',
          barcode: product.barcode ?? '',
          sku: product.sku ?? '',
          categoryId: product.categoryId ?? '',
          costPrice: Number(product.costPrice),
          sellPrice: Number(product.sellPrice),
          minStockLevel: Number(product.minStockLevel ?? 0),
        }
      : { costPrice: 0, sellPrice: 0, minStockLevel: 0 },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">
            {product ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Nomi" error={errors.name?.message} required className="col-span-2">
              <input
                {...register('name')}
                placeholder="Masalan: Nivea krem 100ml"
                className={inputCls}
              />
            </Field>

            <Field label="SKU" error={errors.sku?.message} required>
              <input {...register('sku')} placeholder="NIV-001" className={inputCls} />
            </Field>

            <Field label="Barcode" error={errors.barcode?.message}>
              <input {...register('barcode')} placeholder="8901234567890" className={inputCls} />
            </Field>

            <Field
              label="Kategoriya"
              error={errors.categoryId?.message}
              required
              className="col-span-2"
            >
              <select {...register('categoryId')} className={inputCls}>
                <option value="">— Tanlang —</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Kelish narxi (so'm)" error={errors.costPrice?.message} required>
              <input
                {...register('costPrice')}
                type="number"
                min={0}
                step={100}
                className={inputCls}
              />
            </Field>

            <Field label="Sotuv narxi (so'm)" error={errors.sellPrice?.message} required>
              <input
                {...register('sellPrice')}
                type="number"
                min={0}
                step={100}
                className={inputCls}
              />
            </Field>

            <Field label="Minimal zaxira" error={errors.minStockLevel?.message} className="col-span-2">
              <input
                {...register('minStockLevel')}
                type="number"
                min={0}
                className={inputCls}
              />
            </Field>
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
              {isPending ? 'Saqlanmoqda...' : product ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
