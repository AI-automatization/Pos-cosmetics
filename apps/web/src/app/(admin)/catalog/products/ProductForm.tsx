'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Barcode } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/catalog';
import { VariantsSection } from './VariantsSection';

const productSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart').max(200),
  barcode: z.string().optional(),
  extraBarcodes: z.array(z.object({ value: z.string() })).optional(),
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
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as import('react-hook-form').Resolver<ProductFormData>,
    defaultValues: product
      ? {
          name: product.name ?? '',
          barcode: product.barcode ?? '',
          extraBarcodes: (product.extraBarcodes ?? []).map((v) => ({ value: v })),
          sku: product.sku ?? '',
          categoryId: product.categoryId ?? '',
          costPrice: Number(product.costPrice),
          sellPrice: Number(product.sellPrice),
          minStockLevel: Number(product.minStockLevel ?? 0),
        }
      : { costPrice: 0, sellPrice: 0, minStockLevel: 0, extraBarcodes: [] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'extraBarcodes',
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

        <form onSubmit={handleSubmit(onSubmit)} className="max-h-[80vh] overflow-y-auto p-6">
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

            <Field label="Asosiy barcode" error={errors.barcode?.message}>
              <input {...register('barcode')} placeholder="8901234567890" className={inputCls} />
            </Field>

            {/* Extra barcodes */}
            <div className="col-span-2">
              <div className="mb-1 flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">
                  Qo&apos;shimcha barcodlar
                </label>
                <button
                  type="button"
                  onClick={() => append({ value: '' })}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Qo&apos;shish
                </button>
              </div>

              {fields.length === 0 ? (
                <button
                  type="button"
                  onClick={() => append({ value: '' })}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-400 transition hover:border-blue-400 hover:text-blue-500"
                >
                  <Barcode className="h-4 w-4" />
                  Qo&apos;shimcha barcode qo&apos;shish
                </button>
              ) : (
                <div className="flex flex-col gap-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-2">
                      <input
                        {...register(`extraBarcodes.${index}.value`)}
                        placeholder={`Barcode ${index + 1}`}
                        className={cn(inputCls, 'flex-1')}
                      />
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="rounded-lg p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

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

            {product ? (
              <VariantsSection productId={product.id} />
            ) : (
              <p className="col-span-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
                Variantlar mahsulot saqlangandan keyin qo&apos;shiladi
              </p>
            )}
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
