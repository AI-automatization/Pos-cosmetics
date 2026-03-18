'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Plus, Barcode, Upload, ImageIcon } from 'lucide-react';
import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';
import type { Category, Product } from '@/types/catalog';
import { VariantsSection } from './VariantsSection';

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

/* ─── Margin Calculator ─── */

function MarginBadge({ costPrice, sellPrice }: { costPrice: number; sellPrice: number }) {
  if (!sellPrice || sellPrice <= 0) return null;
  const margin = ((sellPrice - costPrice) / sellPrice) * 100;
  const profit = sellPrice - costPrice;
  const isNegative = margin < 0;
  const isLow = margin >= 0 && margin < 15;

  return (
    <div
      className={cn(
        'col-span-2 flex items-center justify-between rounded-lg border px-4 py-2.5 text-sm',
        isNegative
          ? 'border-red-200 bg-red-50 text-red-700'
          : isLow
            ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
            : 'border-green-200 bg-green-50 text-green-700',
      )}
    >
      <span>
        Margin: <strong>{margin.toFixed(1)}%</strong>
      </span>
      <span>
        Foyda: <strong>{profit.toLocaleString('uz-UZ')} so&#39;m</strong>
      </span>
    </div>
  );
}

/* ─── Image Upload (drag & drop + preview) ─── */

function ImageUpload({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (file.size > 5 * 1024 * 1024) return; // 5MB max

      setUploading(true);
      try {
        // Preview via local URL for now — real S3 upload can be added later
        const localUrl = URL.createObjectURL(file);
        onChange(localUrl);
      } finally {
        setUploading(false);
      }
    },
    [onChange],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  return (
    <div className="col-span-2">
      <label className="mb-1 block text-sm font-medium text-gray-700">Rasm</label>

      {value ? (
        <div className="relative inline-block">
          <img
            src={value}
            alt="Mahsulot rasmi"
            className="h-28 w-28 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute -right-2 -top-2 rounded-full bg-white p-1 shadow-md transition hover:bg-red-50"
          >
            <X className="h-3.5 w-3.5 text-red-500" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileRef.current?.click()}
          className={cn(
            'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed py-6 text-sm transition',
            dragging
              ? 'border-blue-400 bg-blue-50 text-blue-600'
              : 'border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500',
          )}
        >
          {uploading ? (
            <span className="text-blue-500">Yuklanmoqda...</span>
          ) : (
            <>
              {dragging ? (
                <Upload className="h-8 w-8" />
              ) : (
                <ImageIcon className="h-8 w-8" />
              )}
              <span>Rasm tashlang yoki bosing</span>
              <span className="text-xs text-gray-300">PNG, JPG — max 5MB</span>
            </>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </div>
  );
}

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
    watch,
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
          description: ((product as unknown as Record<string, unknown>).description as string) ?? '',
          costPrice: Number(product.costPrice),
          sellPrice: Number(product.sellPrice),
          minStockLevel: Number(product.minStockLevel ?? 0),
        }
      : { costPrice: 0, sellPrice: 0, minStockLevel: 0, extraBarcodes: [], description: '' },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'extraBarcodes',
  });

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

            <Field label="Tavsif" error={errors.description?.message} className="col-span-2">
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Mahsulot haqida qisqacha ma'lumot..."
                className={cn(inputCls, 'resize-none')}
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
