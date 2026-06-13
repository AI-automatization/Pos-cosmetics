'use client';

import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Loader2 } from 'lucide-react';
import { useState, useMemo } from 'react';
import type { Category, Product } from '@/types/catalog';
import { Field, inputCls, inputErrorCls } from './FormField';
import { MarginBadge } from './MarginBadge';
import { ImageUpload } from './ImageUpload';
import { BarcodeFields } from './BarcodeFields';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useSuppliers } from '@/hooks/catalog/useSuppliers';
import { useUnits } from '@/hooks/catalog/useProducts';
import { catalogApi } from '@/api/catalog.api';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

const productSchema = z.object({
  name: z.string().min(1, 'Mahsulot nomi kiritilishi shart').max(200, 'Nom 200 belgidan oshmasligi kerak'),
  extraBarcodes: z.array(z.object({ value: z.string() })).optional(),
  sku: z.string().max(100, 'SKU 100 belgidan oshmasligi kerak').optional(),
  categoryId: z.string().min(1, 'Kategoriya tanlanishi shart'),
  supplierId: z.string().optional(),
  unitId: z.string().optional(),
  description: z.string().max(2000).optional(),
  costPrice: z.coerce.number().min(0, 'Kelish narxi manfiy bo\'lishi mumkin emas'),
  sellPrice: z.coerce.number().min(1, 'Sotuv narxi kiritilishi shart'),
  minStockLevel: z.coerce.number().min(0, 'Manfiy bo\'lishi mumkin emas'),
  initialStock: z.coerce.number().min(0, 'Manfiy bo\'lishi mumkin emas').optional(),
  expiryTracking: z.boolean().optional(),
  expiryDate: z.string().optional(),
}).refine((data) => data.sellPrice >= data.costPrice, {
  message: 'Sotuv narxi kelish narxidan kam bo\'lishi mumkin emas',
  path: ['sellPrice'],
});

export type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  product?: Product | null;
  categories: Category[];
  isPending: boolean;
  onSubmit: (data: ProductFormData) => void;
  onClose: () => void;
  initialSupplierId?: string;
}

function buildDefaultValues(product?: Product | null, initialSupplierId?: string): ProductFormData {
  if (!product) {
    return {
      costPrice: 0, sellPrice: 0, minStockLevel: 0, initialStock: 0,
      extraBarcodes: [{ value: '' }], description: '', name: '', sku: '', categoryId: '',
      supplierId: initialSupplierId ?? '', unitId: '',
    };
  }
  const barcodes: { value: string }[] = [];
  if (product.barcode) barcodes.push({ value: product.barcode });
  (product.extraBarcodes ?? []).forEach((v) => barcodes.push({ value: v }));
  return {
    name: product.name ?? '',
    extraBarcodes: barcodes,
    sku: product.sku ?? '',
    categoryId: product.categoryId ?? '',
    supplierId: initialSupplierId ?? product.productSuppliers?.[0]?.supplierId ?? '',
    unitId: product.unitId ?? '',
    description: product.description ?? '',
    costPrice: Number(product.costPrice),
    sellPrice: Number(product.sellPrice),
    minStockLevel: Number(product.minStockLevel ?? 0),
    expiryDate: product.expiryDate ? product.expiryDate.slice(0, 10) : '',
  };
}

export function ProductForm({ product, categories, isPending, onSubmit, onClose, initialSupplierId }: ProductFormProps) {
  const { t } = useTranslation();
  const { register, control, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as import('react-hook-form').Resolver<ProductFormData>,
    defaultValues: buildDefaultValues(product, initialSupplierId),
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'extraBarcodes' });
  const costPrice = watch('costPrice') ?? 0;
  const sellPrice = watch('sellPrice') ?? 0;
  const selectedUnitId = watch('unitId') ?? '';

  const [showSku, setShowSku] = useState(!!product?.sku);
  const [imageUrl, setImageUrl] = useState<string>(
    product?.imageUrl ?? '',
  );

  const [unitMode, setUnitMode] = useState<'existing' | 'custom'>('existing');
  const [customUnitName, setCustomUnitName] = useState('');
  const [customUnitShort, setCustomUnitShort] = useState('');
  const [isCreatingUnit, setIsCreatingUnit] = useState(false);

  const { data: units = [] } = useUnits();
  const { data: suppliers } = useSuppliers();

  const categoryOptions = useMemo(
    () => categories.map((c) => ({ value: c.id, label: c.name })),
    [categories],
  );

  const supplierOptions = useMemo(
    () => (suppliers ?? []).map((s) => ({ value: s.id, label: s.name, sublabel: s.company ?? s.phone ?? undefined })),
    [suppliers],
  );

  const handleFormSubmit = async (data: ProductFormData) => {
    if (unitMode === 'custom' && customUnitName.trim() && customUnitShort.trim()) {
      setIsCreatingUnit(true);
      try {
        const newUnit = await catalogApi.createUnit({
          name: customUnitName.trim(),
          shortName: customUnitShort.trim(),
        });
        onSubmit({ ...data, unitId: newUnit.id });
      } finally {
        setIsCreatingUnit(false);
      }
    } else {
      onSubmit(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 flex max-h-[90vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-bold text-gray-900">
            {product ? t('products.editProduct') : t('products.addProduct')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">

            {/* Row 1: Name full width */}
            <Field label={t('products.productName')} error={errors.name?.message} required className="col-span-1 sm:col-span-2 lg:col-span-3">
              <input
                {...register('name')}
                placeholder={t('products.productNamePlaceholder')}
                className={errors.name ? inputErrorCls : inputCls}
              />
            </Field>

            {/* Row 2: Category | Supplier | SKU */}
            <Field label={t('products.category')} error={errors.categoryId?.message} required>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => (
                  <SearchableDropdown
                    options={categoryOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder={t('products.categoryPlaceholder')}
                    searchPlaceholder={t('common.search')}
                    required
                  />
                )}
              />
            </Field>

            <Field label={t('products.supplier')}>
              <Controller
                control={control}
                name="supplierId"
                render={({ field }) => (
                  <SearchableDropdown
                    options={supplierOptions}
                    value={field.value ?? ''}
                    onChange={field.onChange}
                    placeholder={t('products.supplierPlaceholder')}
                    searchPlaceholder={t('common.search')}
                    clearable
                  />
                )}
              />
            </Field>

            <div>
              {showSku ? (
                <Field label="SKU" error={errors.sku?.message}>
                  <div className="flex gap-1.5">
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
                </Field>
              ) : (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                  <button
                    type="button"
                    onClick={() => setShowSku(true)}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-300 px-3 py-2.5 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {t('products.addSku')}
                  </button>
                </div>
              )}
            </div>

            {/* Row 3: Barcode (span-2) | Unit (span-1) */}
            <BarcodeFields
              register={register}
              fields={fields}
              append={append}
              remove={remove}
              setValue={(name, value) => setValue(name, value)}
              getValues={getValues}
              className="col-span-2"
            />

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {t('products.unit')}
                <span className="ml-1 text-xs font-normal text-gray-400">({t('common.optional')})</span>
              </label>
              <div className="flex flex-wrap gap-1">
                {units.map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => {
                      setValue('unitId', u.id);
                      setUnitMode('existing');
                    }}
                    className={cn(
                      'rounded-lg border px-2 py-1 text-xs font-medium transition',
                      selectedUnitId === u.id && unitMode === 'existing'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    {u.shortName}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setValue('unitId', '');
                    setUnitMode('custom');
                  }}
                  className={cn(
                    'rounded-lg border px-2 py-1 text-xs font-medium transition',
                    unitMode === 'custom'
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-dashed border-gray-300 text-gray-500 hover:border-orange-300',
                  )}
                >
                  + {t('common.other')}
                </button>
              </div>
            </div>

            {/* Custom unit row — full width, only when needed */}
            {unitMode === 'custom' && (
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 grid grid-cols-2 gap-3 rounded-xl border border-orange-200 bg-orange-50/50 p-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    {t('common.name')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customUnitName}
                    onChange={(e) => setCustomUnitName(e.target.value)}
                    placeholder="Kilogram"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    {t('products.shortName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={customUnitShort}
                    onChange={(e) => setCustomUnitShort(e.target.value)}
                    placeholder="kg"
                    className={inputCls}
                  />
                </div>
              </div>
            )}

            {/* Row 4: Description (span-2) | Image (span-1) */}
            <Field label={t('products.description')} error={errors.description?.message} className="col-span-2">
              <textarea
                {...register('description')}
                rows={2}
                placeholder={t('products.descriptionPlaceholder')}
                className={`${inputCls} resize-none`}
              />
            </Field>

            <ImageUpload value={imageUrl} onChange={setImageUrl} className="col-span-1" />

            {/* Row 5: Cost | Sell | Margin */}
            <Field label={t('products.costPrice')} error={errors.costPrice?.message} required>
              <input
                {...register('costPrice')}
                type="number"
                min={0}
                step={100}
                className={errors.costPrice ? inputErrorCls : inputCls}
              />
            </Field>

            <Field label={t('products.sellPrice')} error={errors.sellPrice?.message} required>
              <input
                {...register('sellPrice')}
                type="number"
                min={0}
                step={100}
                className={errors.sellPrice ? inputErrorCls : inputCls}
              />
            </Field>

            <MarginBadge
              costPrice={Number(costPrice)}
              sellPrice={Number(sellPrice)}
              className="col-span-1 self-end"
            />

            {/* Row 6: Min stock | Initial stock */}
            <Field label={t('products.minStock')} error={errors.minStockLevel?.message}>
              <input
                {...register('minStockLevel')}
                type="number"
                min={0}
                className={inputCls}
              />
            </Field>

            {!product && (
              <Field label={t('products.initialStock')} error={errors.initialStock?.message}>
                <input
                  {...register('initialStock')}
                  type="number"
                  min={0}
                  placeholder="10"
                  className={inputCls}
                />
              </Field>
            )}

            <Field label={t('products.expiryDate')} error={errors.expiryDate?.message}>
              <input
                {...register('expiryDate')}
                type="date"
                className={inputCls}
              />
            </Field>

          </div>

          <div className="mt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isPending || isCreatingUnit}
              className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isPending || isCreatingUnit}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
            >
              {(isPending || isCreatingUnit) && <Loader2 className="h-4 w-4 animate-spin" />}
              {isPending || isCreatingUnit ? t('common.saving') : product ? t('common.save') : t('common.add')}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
}
