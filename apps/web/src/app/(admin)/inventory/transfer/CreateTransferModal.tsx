'use client';

import { useState, useMemo } from 'react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { SearchableDropdown } from '@/components/ui/SearchableDropdown';
import { useBranches } from '@/hooks/settings/useBranches';
import { useProducts } from '@/hooks/catalog/useProducts';
import { useCreateTransfer } from '@/hooks/inventory/useInventory';
import { inputCls } from '@/app/(admin)/catalog/products/FormField';

interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

interface CreateTransferModalProps {
  onClose: () => void;
}

export function CreateTransferModal({ onClose }: CreateTransferModalProps) {
  const [fromBranchId, setFromBranchId] = useState('');
  const [toBranchId, setToBranchId] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<TransferItem[]>([
    { productId: '', productName: '', quantity: 1 },
  ]);
  const { data: branches = [] } = useBranches();
  const { data: productsData } = useProducts({ limit: 200 });
  const { mutate: createTransfer, isPending } = useCreateTransfer();

  const branchOptions = useMemo(
    () => branches.map((b) => ({ value: b.id, label: b.name })),
    [branches],
  );

  const productOptions = useMemo(
    () =>
      (productsData?.items ?? []).map((p) => ({
        value: p.id,
        label: p.name,
        sublabel: p.sku ?? undefined,
      })),
    [productsData],
  );

  const addItem = () =>
    setItems((prev) => [...prev, { productId: '', productName: '', quantity: 1 }]);

  const removeItem = (idx: number) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const updateItem = (idx: number, patch: Partial<TransferItem>) =>
    setItems((prev) => prev.map((item, i) => (i === idx ? { ...item, ...patch } : item)));

  const handleSubmit = () => {
    if (!fromBranchId || !toBranchId) return;
    const validItems = items.filter((i) => i.productId && i.quantity > 0);
    if (validItems.length === 0) return;

    createTransfer(
      {
        fromBranchId,
        toBranchId,
        items: validItems.map(({ productId, quantity }) => ({ productId, quantity })),
        notes: notes.trim() || undefined,
      },
      { onSuccess: onClose },
    );
  };

  const isValid =
    fromBranchId &&
    toBranchId &&
    fromBranchId !== toBranchId &&
    items.some((i) => i.productId && i.quantity > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-base font-bold text-gray-900">Yangi transfer so&apos;rovi</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-5 space-y-4">
          {/* Branches */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Qaysi filialdan <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={branchOptions}
                value={fromBranchId}
                onChange={setFromBranchId}
                placeholder="Filial tanlang..."
                searchPlaceholder="Qidirish..."
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                Qaysi filialga <span className="text-red-500">*</span>
              </label>
              <SearchableDropdown
                options={branchOptions.filter((b) => b.value !== fromBranchId)}
                value={toBranchId}
                onChange={setToBranchId}
                placeholder="Filial tanlang..."
                searchPlaceholder="Qidirish..."
              />
            </div>
          </div>

          {/* Items */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                Mahsulotlar <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={addItem}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50"
              >
                <Plus className="h-3.5 w-3.5" />
                Qo&apos;shish
              </button>
            </div>

            <div className="space-y-2">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-end gap-2">
                  <div className="flex-1">
                    <SearchableDropdown
                      options={productOptions}
                      value={item.productId}
                      onChange={(val) => {
                        const prod = productsData?.items.find((p) => p.id === val);
                        updateItem(idx, { productId: val, productName: prod?.name ?? '' });
                      }}
                      placeholder="Mahsulot tanlang..."
                      searchPlaceholder="Qidirish..."
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => updateItem(idx, { quantity: Number(e.target.value) })}
                      placeholder="Miqdor"
                      className={inputCls}
                    />
                  </div>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(idx)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Izoh <span className="text-xs font-normal text-gray-400">(ixtiyoriy)</span>
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ko'chirish sababi yoki qo'shimcha ma'lumot..."
              className={`${inputCls} resize-none`}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-gray-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isValid || isPending}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            So&apos;rov yuborish
          </button>
        </div>
      </div>
    </div>
  );
}
