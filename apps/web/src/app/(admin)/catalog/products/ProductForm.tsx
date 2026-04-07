'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Category, Product } from '@/types/catalog';
import { VariantsSection } from './VariantsSection';
import { BundleSection } from './BundleSection';
import { CertificatesSection } from './CertificatesSection';
import { Field, inputCls } from './FormField';
import { MarginBadge } from './MarginBadge';
import { ImageUpload } from './ImageUpload';
import { BarcodeFields } from './BarcodeFields';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';

const productSchema = z.object({
  name: z.string().min(1, 'Nom kiritilishi shart').max(200),
  barcode: z.string().optional(),
  extraBarcodes: z.array(z.object({ value: z.string() })).optional(),
  sku: z.string().max(100).optional(),
  categoryId: z.string().min(1, 'Kategoriya tanlanishi shart'),
  description: z.string().max(2000).optional(),
  costPrice: z.coerce.number().min(0, 'Narx manfiy bo\'lishi mumkin emas'),
  sellPrice: z.coerce.number().min(0, 'Narx manfiy bo\'lishi mumkin emas'),
  minStockLevel: z.coerce.number().min(0),
  expiryTracking: z.boolean().optional(),
  expiryDate: z.string().optional(),
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
  const [showSku, setShowSku] = useState(!!product?.sku);
  const [imageUrl, setImageUrl] = useState<string>(
    ((product as unknown as Record<string, unknown>)?.imageUrl as string) ?? '',
  );

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
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

            {/* SKU — optional with toggle */}
            <div className="col-span-2">
              {showSku ? (
                <Field label="SKU" error={errors.sku?.message}>
                  <div className="flex gap-2">
                    <input {...register('sku')} placeholder="NIV-001" className={`${inputCls} flex-1`} />
                    {!product && (
                      <button
                        type="button"
                        onClick={() => setShowSku(false)}
                        className="rounded-lg px-2 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">Ixtiyoriy — bo&apos;sh qolsa avtomatik yaratiladi</p>
                </Field>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                  <button
                    type="button"
                    onClick={() => setShowSku(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-3.5 py-2.5 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    SKU qo&apos;shish
                  </button>
                  <p className="mt-1 text-xs text-gray-400">Ixtiyoriy — avtomatik generatsiya qilinadi</p>
                </div>
              )}
            </div>

            {/* Extra barcodes only (main barcode removed) */}
            <BarcodeFields
              register={register}
              fields={fields}
              append={append}
              remove={remove}
            />

            {/* Category — SearchableDropdown */}
            <Field
              label="Kategoriya"
              error={errors.categoryId?.message}
              required
              className="col-span-2"
            >
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <SearchableDropdown
                    options={categoryOptions}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Kategoriya tanlang..."
                    searchPlaceholder="Kategoriya qidirish..."
                    required
                  />
                )}
              />
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
                <CertificatesSection productId={product.id} />
              </>
            ) : (
              <p className="col-span-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-400">
                Variantlar, bundle va sertifikatlar mahsulot saqlangandan keyin qo&apos;shiladi
              </p>
            )}
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending ? 'Saqlanmoqda...' : product ? 'Saqlash' : 'Qo\'shish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
