'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useVariants, useCreateVariant, useUpdateVariant, useDeleteVariant } from '@/hooks/catalog/useVariants';
import type { ProductVariant } from '@/types/catalog';

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

interface AddFormState {
  name: string;
  sku: string;
  barcode: string;
  costPrice: string;
  sellPrice: string;
}

const EMPTY_FORM: AddFormState = { name: '', sku: '', barcode: '', costPrice: '', sellPrice: '' };

interface VariantRowProps {
  variant: ProductVariant;
  productId: string;
}

function VariantRow({ variant, productId }: VariantRowProps) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<AddFormState>({
    name: variant.name,
    sku: variant.sku ?? '',
    barcode: variant.barcode ?? '',
    costPrice: String(variant.costPrice),
    sellPrice: String(variant.sellPrice),
  });

  const updateVariant = useUpdateVariant(productId);
  const deleteVariant = useDeleteVariant(productId);

  const handleSave = () => {
    if (!form.name.trim()) return;
    updateVariant.mutate(
      {
        variantId: variant.id,
        dto: {
          name: form.name.trim(),
          sku: form.sku.trim() || undefined,
          barcode: form.barcode.trim() || undefined,
          costPrice: form.costPrice ? Number(form.costPrice) : undefined,
          sellPrice: form.sellPrice ? Number(form.sellPrice) : undefined,
        },
      },
      { onSuccess: () => setEditing(false) },
    );
  };

  if (editing) {
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="col-span-2">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Variant nomi *"
              className={inputCls}
            />
          </div>
          <input
            value={form.sku}
            onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="SKU"
            className={inputCls}
          />
          <input
            value={form.barcode}
            onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
            placeholder="Barcode"
            className={inputCls}
          />
          <input
            value={form.costPrice}
            onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
            type="number"
            min={0}
            placeholder="Kelish narxi"
            className={inputCls}
          />
          <input
            value={form.sellPrice}
            onChange={(e) => setForm((f) => ({ ...f, sellPrice: e.target.value }))}
            type="number"
            min={0}
            placeholder="Sotuv narxi"
            className={inputCls}
          />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateVariant.isPending || !form.name.trim()}
            className="rounded-md p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 bg-white px-3 py-2 transition hover:border-blue-300 hover:bg-blue-50"
      onClick={() => setEditing(true)}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">{variant.name}</p>
        <p className="text-xs text-gray-400">
          {variant.barcode ? `${variant.barcode} · ` : ''}
          {Number(variant.sellPrice).toLocaleString()} so'm
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          deleteVariant.mutate(variant.id);
        }}
        disabled={deleteVariant.isPending}
        className="ml-2 rounded-md p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

interface VariantsSectionProps {
  productId: string;
}

export function VariantsSection({ productId }: VariantsSectionProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<AddFormState>(EMPTY_FORM);

  const { data: variants = [], isLoading } = useVariants(productId);
  const createVariant = useCreateVariant(productId);

  const handleAdd = () => {
    if (!form.name.trim()) return;
    createVariant.mutate(
      {
        name: form.name.trim(),
        sku: form.sku.trim() || undefined,
        barcode: form.barcode.trim() || undefined,
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        sellPrice: form.sellPrice ? Number(form.sellPrice) : undefined,
      },
      {
        onSuccess: () => {
          setForm(EMPTY_FORM);
          setShowAddForm(false);
        },
      },
    );
  };

  return (
    <div className="col-span-2 border-t border-gray-100 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">Variantlar</p>
        {!showAddForm && (
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50"
          >
            <Plus className="h-3.5 w-3.5" />
            Qo&apos;shish
          </button>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {!isLoading && variants.length === 0 && !showAddForm && (
        <button
          type="button"
          onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-400 transition hover:border-blue-400 hover:text-blue-500"
        >
          <Plus className="h-4 w-4" />
          Variant qo&apos;shish (rang, hajm, tur...)
        </button>
      )}

      {variants.length > 0 && (
        <div className="flex flex-col gap-1.5 mb-2">
          {variants.map((v) => (
            <VariantRow key={v.id} variant={v} productId={productId} />
          ))}
        </div>
      )}

      {showAddForm && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Variant nomi * (masalan: Lavanda 50ml)"
                className={cn(inputCls, 'bg-white')}
                autoFocus
              />
            </div>
            <input
              value={form.sku}
              onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="SKU"
              className={cn(inputCls, 'bg-white')}
            />
            <input
              value={form.barcode}
              onChange={(e) => setForm((f) => ({ ...f, barcode: e.target.value }))}
              placeholder="Barcode"
              className={cn(inputCls, 'bg-white')}
            />
            <input
              value={form.costPrice}
              onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
              type="number"
              min={0}
              placeholder="Kelish narxi"
              className={cn(inputCls, 'bg-white')}
            />
            <input
              value={form.sellPrice}
              onChange={(e) => setForm((f) => ({ ...f, sellPrice: e.target.value }))}
              type="number"
              min={0}
              placeholder="Sotuv narxi"
              className={cn(inputCls, 'bg-white')}
            />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setForm(EMPTY_FORM);
                setShowAddForm(false);
              }}
              className="rounded-md px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100"
            >
              Bekor
            </button>
            <button
              type="button"
              onClick={handleAdd}
              disabled={createVariant.isPending || !form.name.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {createVariant.isPending ? 'Saqlanmoqda...' : 'Qo\'shish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
