'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, X, Grid3X3, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import {
  useVariants,
  useCreateVariant,
  useUpdateVariant,
  useDeleteVariant,
  useGenerateVariantMatrix,
} from '@/hooks/catalog/useVariants';
import type { ProductVariant, GenerateVariantMatrixDto } from '@/types/catalog';

const inputCls =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20';

interface AddFormState {
  name: string;
  sku: string;
  barcode: string;
  costPrice: string;
  sellPrice: string;
  attrColor: string;
  attrSize: string;
  attrVolume: string;
}

const EMPTY_FORM: AddFormState = {
  name: '', sku: '', barcode: '', costPrice: '', sellPrice: '',
  attrColor: '', attrSize: '', attrVolume: '',
};

function buildAttributes(form: AddFormState): Record<string, string> {
  const attrs: Record<string, string> = {};
  if (form.attrColor.trim()) attrs.color = form.attrColor.trim();
  if (form.attrSize.trim()) attrs.size = form.attrSize.trim();
  if (form.attrVolume.trim()) attrs.volume = form.attrVolume.trim();
  return attrs;
}

function AttributeBadges({ attributes }: { attributes: Record<string, string> }) {
  const entries = Object.entries(attributes);
  if (entries.length === 0) return null;
  return (
    <span className="inline-flex gap-1">
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="inline-flex items-center gap-0.5 rounded-full bg-blue-50 px-1.5 py-0.5 text-[10px] font-medium text-blue-700"
        >
          <Tag className="h-2.5 w-2.5" />
          {value}
        </span>
      ))}
    </span>
  );
}

function VariantRow({ variant, productId }: { variant: ProductVariant; productId: string }) {
  const [editing, setEditing] = useState(false);
  const attrs = (variant.attributes ?? {}) as Record<string, string>;
  const [form, setForm] = useState<AddFormState>({
    name: variant.name,
    sku: variant.sku ?? '',
    barcode: variant.barcode ?? '',
    costPrice: String(variant.costPrice),
    sellPrice: String(variant.sellPrice),
    attrColor: attrs.color ?? '',
    attrSize: attrs.size ?? '',
    attrVolume: attrs.volume ?? '',
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
          attributes: buildAttributes(form),
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="sm:col-span-3">
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Variant nomi *" className={inputCls} />
          </div>
          <input value={form.attrColor} onChange={(e) => setForm((f) => ({ ...f, attrColor: e.target.value }))}
            placeholder="Rang (color)" className={inputCls} />
          <input value={form.attrSize} onChange={(e) => setForm((f) => ({ ...f, attrSize: e.target.value }))}
            placeholder="O'lcham (size)" className={inputCls} />
          <input value={form.attrVolume} onChange={(e) => setForm((f) => ({ ...f, attrVolume: e.target.value }))}
            placeholder="Hajm (volume)" className={inputCls} />
          <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
            placeholder="SKU" className={inputCls} />
          <input value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
            type="number" min={0} placeholder="Kelish narxi" className={inputCls} />
          <input value={form.sellPrice} onChange={(e) => setForm((f) => ({ ...f, sellPrice: e.target.value }))}
            type="number" min={0} placeholder="Sotuv narxi" className={inputCls} />
        </div>
        <div className="mt-2 flex justify-end gap-2">
          <button type="button" onClick={() => setEditing(false)}
            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
          <button type="button" onClick={handleSave}
            disabled={updateVariant.isPending || !form.name.trim()}
            className="rounded-md p-1.5 text-green-600 hover:bg-green-50 disabled:opacity-40">
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
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-gray-900">{variant.name}</p>
          <AttributeBadges attributes={attrs} />
        </div>
        <p className="text-xs text-gray-400">
          {variant.sku ? `${variant.sku} · ` : ''}
          {variant.barcode ? `${variant.barcode} · ` : ''}
          {Number(variant.sellPrice).toLocaleString()} so&apos;m
        </p>
      </div>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); deleteVariant.mutate(variant.id); }}
        disabled={deleteVariant.isPending}
        className="ml-2 rounded-md p-1.5 text-gray-300 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

// ─── Matrix Generator Modal ─────────────────────────────────────

interface MatrixModalProps {
  productId: string;
  onClose: () => void;
}

function MatrixGeneratorModal({ productId, onClose }: MatrixModalProps) {
  const { t } = useTranslation();
  const generateMatrix = useGenerateVariantMatrix(productId);
  const [rows, setRows] = useState([
    { name: 'color', values: '' },
    { name: 'size', values: '' },
  ]);
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');

  const addRow = () => setRows((r) => [...r, { name: '', values: '' }]);
  const removeRow = (i: number) => setRows((r) => r.filter((_, idx) => idx !== i));
  const updateRow = (i: number, field: 'name' | 'values', val: string) =>
    setRows((r) => r.map((row, idx) => (idx === i ? { ...row, [field]: val } : row)));

  const validRows = rows.filter((r) => r.name.trim() && r.values.trim());
  const combinations = validRows.length > 0
    ? validRows.reduce((acc, row) => {
        const vals = row.values.split(',').map((v) => v.trim()).filter(Boolean);
        return acc * vals.length;
      }, 1)
    : 0;

  const handleGenerate = () => {
    const attributes: Record<string, string[]> = {};
    for (const row of validRows) {
      attributes[row.name.trim()] = row.values.split(',').map((v) => v.trim()).filter(Boolean);
    }
    const dto: GenerateVariantMatrixDto = {
      attributes,
      ...(costPrice ? { costPrice: Number(costPrice) } : {}),
      ...(sellPrice ? { sellPrice: Number(sellPrice) } : {}),
    };
    generateMatrix.mutate(dto, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center gap-2">
          <Grid3X3 className="h-5 w-5 text-blue-600" />
          <h3 className="text-base font-semibold text-gray-900">{t('products.generateMatrix')}</h3>
        </div>

        <div className="space-y-2">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={row.name}
                onChange={(e) => updateRow(i, 'name', e.target.value)}
                placeholder={t('products.attrName')}
                className={cn(inputCls, 'w-1/3')}
              />
              <input
                value={row.values}
                onChange={(e) => updateRow(i, 'values', e.target.value)}
                placeholder={t('products.attrValues')}
                className={cn(inputCls, 'flex-1')}
              />
              {rows.length > 1 && (
                <button type="button" onClick={() => removeRow(i)}
                  className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <button type="button" onClick={addRow}
          className="mt-2 flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700">
          <Plus className="h-3.5 w-3.5" /> {t('products.addAttribute')}
        </button>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-500">{t('products.costPrice')}</label>
            <input value={costPrice} onChange={(e) => setCostPrice(e.target.value)}
              type="number" min={0} placeholder={t('products.fromProduct')} className={inputCls} />
          </div>
          <div>
            <label className="mb-1 block text-xs text-gray-500">{t('products.sellPrice')}</label>
            <input value={sellPrice} onChange={(e) => setSellPrice(e.target.value)}
              type="number" min={0} placeholder={t('products.fromProduct')} className={inputCls} />
          </div>
        </div>

        {combinations > 0 && (
          <p className="mt-3 text-xs text-gray-500">
            {t('products.matrixPreview', { count: combinations })}
          </p>
        )}

        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={onClose}
            className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100">
            {t('common.cancel')}
          </button>
          <button type="button" onClick={handleGenerate}
            disabled={generateMatrix.isPending || combinations === 0}
            className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {generateMatrix.isPending ? t('common.saving') : t('products.generateVariants', { count: combinations })}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Section ───────────────────────────────────────────────

interface VariantsSectionProps {
  productId: string;
}

export function VariantsSection({ productId }: VariantsSectionProps) {
  const { t } = useTranslation();
  const [showAddForm, setShowAddForm] = useState(false);
  const [showMatrix, setShowMatrix] = useState(false);
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
        attributes: buildAttributes(form),
        costPrice: form.costPrice ? Number(form.costPrice) : undefined,
        sellPrice: form.sellPrice ? Number(form.sellPrice) : undefined,
      },
      { onSuccess: () => { setForm(EMPTY_FORM); setShowAddForm(false); } },
    );
  };

  return (
    <div className="col-span-2 border-t border-gray-100 pt-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{t('products.variants')}</p>
        <div className="flex gap-1">
          <button type="button" onClick={() => setShowMatrix(true)}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-purple-600 transition hover:bg-purple-50">
            <Grid3X3 className="h-3.5 w-3.5" /> {t('products.matrix')}
          </button>
          {!showAddForm && (
            <button type="button" onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 transition hover:bg-blue-50">
              <Plus className="h-3.5 w-3.5" /> {t('common.add')}
            </button>
          )}
        </div>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-12 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      )}

      {!isLoading && variants.length === 0 && !showAddForm && (
        <button type="button" onClick={() => setShowAddForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 py-2.5 text-sm text-gray-400 transition hover:border-blue-400 hover:text-blue-500">
          <Plus className="h-4 w-4" /> {t('products.addVariant')}
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="sm:col-span-3">
              <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Variant nomi * (masalan: Lavanda 50ml)" className={cn(inputCls, 'bg-white')} autoFocus />
            </div>
            <input value={form.attrColor} onChange={(e) => setForm((f) => ({ ...f, attrColor: e.target.value }))}
              placeholder="Rang" className={cn(inputCls, 'bg-white')} />
            <input value={form.attrSize} onChange={(e) => setForm((f) => ({ ...f, attrSize: e.target.value }))}
              placeholder="O'lcham" className={cn(inputCls, 'bg-white')} />
            <input value={form.attrVolume} onChange={(e) => setForm((f) => ({ ...f, attrVolume: e.target.value }))}
              placeholder="Hajm" className={cn(inputCls, 'bg-white')} />
            <input value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
              placeholder="SKU" className={cn(inputCls, 'bg-white')} />
            <input value={form.costPrice} onChange={(e) => setForm((f) => ({ ...f, costPrice: e.target.value }))}
              type="number" min={0} placeholder="Kelish narxi" className={cn(inputCls, 'bg-white')} />
            <input value={form.sellPrice} onChange={(e) => setForm((f) => ({ ...f, sellPrice: e.target.value }))}
              type="number" min={0} placeholder="Sotuv narxi" className={cn(inputCls, 'bg-white')} />
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <button type="button" onClick={() => { setForm(EMPTY_FORM); setShowAddForm(false); }}
              className="rounded-md px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-100">
              {t('common.cancel')}
            </button>
            <button type="button" onClick={handleAdd}
              disabled={createVariant.isPending || !form.name.trim()}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50">
              {createVariant.isPending ? t('common.saving') : t('common.add')}
            </button>
          </div>
        </div>
      )}

      {showMatrix && (
        <MatrixGeneratorModal productId={productId} onClose={() => setShowMatrix(false)} />
      )}
    </div>
  );
}
