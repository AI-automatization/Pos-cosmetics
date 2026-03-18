'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import { useState } from 'react';
import type { Category, Product } from '@/types/catalog';
import { VariantsSection } from './VariantsSection';
import { BundleSection } from './BundleSection';
import { Field, inputCls } from './FormField';
import { MarginBadge } from './MarginBadge';
import { ImageUpload } from './ImageUpload';
import { BarcodeFields } from './BarcodeFields';

const productSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart').max(200),
  barcode: z.string().optional(),
  extraBarcodes: z.array(z.object({ value: z.string() })).optional(),
  sku: z.string().min(1, 'SKU kiritilishi shart').max(100),
  categoryId: z.string().min(1, 'Kategoriya tanlanishi shart'),
  description: z.string().max(2000).optional(),
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

function buildDefaultValues(product?: Product | null): ProductFormData {
  if (!product) return { costPrice: 0, sellPrice: 0, minStockLevel: 0, extraBarcodes: [], description: '', name: '', sku: '', categoryId: '' };
  const p = product as unknown as Record<string, unknown>;
  return {
    name: product.name ?? '',
    barcode: product.barcode ?? '',
    extraBarcodes: (product.extraBarcodes ?? []).map((v) => ({ value: v })),
    sku: product.sku ?? '',
    categoryId: product.categoryId ?? '',
    description: (p.description as string) ?? '',
    costPrice: Number(product.costPrice),
    sellPrice: Number(product.sellPrice),
    minStockLevel: Number(product.minStockLevel ?? 0),
  };
}

export function ProductForm({ product, categories, isPending, onSubmit, onClose }: ProductFormProps) {
  const { register, control, handleSubmit, watch, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as import('react-hook-form').Resolver<ProductFormData>,
    defaultValues: buildDefaultValues(product),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'extraBarcodes' });
  const costPrice = watch('costPrice') ?? 0;
  const sellPrice = watch('sellPrice') ?? 0;
  const [imageUrl, setImageUrl] = useState<string>(
    ((product as unknown as Record<string, unknown>)?.imageUrl as string) ?? '',
  );

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

            <BarcodeFields
              register={register}
              fields={fields}
              append={append}
              remove={remove}
            />

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

            <Field label="Tavsif" error={errors.description?.message} className="col-span-2">
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Mahsulot haqida qisqacha ma'lumot..."
                className={`${inputCls} resize-none`}
              />
            </Field>

            <ImageUpload value={imageUrl} onChange={setImageUrl} />

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

            <MarginBadge costPrice={Number(costPrice)} sellPrice={Number(sellPrice)} />

            <Field label="Minimal zaxira" error={errors.minStockLevel?.message} className="col-span-2">
              <input
                {...register('minStockLevel')}
                type="number"
                min={0}
                className={inputCls}
              />
            </Field>

            {product ? (
              <>
                <VariantsSection productId={product.id} />
                <BundleSection productId={product.id} />
              </>
            ) : (
              <p className="col-span-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
                Variantlar va bundle komponentlari mahsulot saqlangandan keyin qo&apos;shiladi
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
