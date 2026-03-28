'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useStockIn } from '@/hooks/inventory/useInventory';
import { useProducts } from '@/hooks/catalog/useProducts';
import { SupplierSearchSelect } from './SupplierSearchSelect';
import { cn } from '@/lib/utils';
import type { StockInItem } from '@/types/inventory';

interface ItemRow extends StockInItem {
  _key: number;
}

let _keyCounter = 0;
function newRow(): ItemRow {
  return { _key: ++_keyCounter, productId: '', quantity: 1, costPrice: 0 };
}

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StockInModal({ isOpen, onClose }: StockInModalProps) {
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.items ?? [];
  const { mutate: submitStockIn, isPending } = useStockIn();

  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<ItemRow[]>([newRow()]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setSupplier('');
      setNotes('');
      setRows([newRow()]);
    }
  }, [isOpen]);

  const addRow = useCallback(() => setRows((prev) => [...prev, newRow()]), []);

  const removeRow = useCallback((key: number) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  }, []);

  const updateRow = useCallback((key: number, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }, []);

  const canSubmit =
    supplier.trim().length > 0 &&
    rows.length > 0 &&
    rows.every((r) => r.productId && r.quantity > 0 && r.costPrice >= 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    submitStockIn(
      {
        supplier: supplier.trim(),
        notes: notes.trim() || undefined,
        items: rows.map(({ productId, quantity, costPrice, batchNumber, expiryDate }) => ({
          productId,
          quantity,
          costPrice,
          batchNumber: batchNumber || undefined,
          expiryDate: expiryDate || undefined,
        })),
      },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative z-10 flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Kirim (Nakladnoy)</h2>
            <p className="text-sm text-gray-500">Omborga yangi tovar qabul qilish</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            aria-label="Yopish"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-5 p-6">
            {/* Supplier + Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Yetkazib beruvchi <span className="text-red-500">*</span>
                </label>
                <SupplierSearchSelect
                  value={supplier}
                  onChange={setSupplier}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Izoh</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Qo'shimcha ma'lumot..."
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Items table */}
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                <h3 className="text-sm font-medium text-gray-700">
                  Mahsulotlar ({rows.length} ta)
                </h3>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] gap-3 bg-gray-50/80 px-5 py-2 text-xs font-medium text-gray-500">
                  <span>Mahsulot *</span>
                  <span>Miqdor *</span>
                  <span>Narx (so&apos;m) *</span>
                  <span>Partiya №</span>
                  <span>Muddati</span>
                  <span />
                </div>

                {rows.map((row) => (
                  <div
                    key={row._key}
                    className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_40px] items-center gap-3 px-5 py-3"
                  >
                    <select
                      value={row.productId}
                      onChange={(e) => updateRow(row._key, { productId: e.target.value })}
                      required
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-blue-500"
                    >
                      <option value="">— Tanlang —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.barcode ? `(${p.barcode})` : ''}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      step={0.001}
                      value={row.quantity}
                      onChange={(e) =>
                        updateRow(row._key, { quantity: parseFloat(e.target.value) || 1 })
                      }
                      required
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-blue-500"
                    />

                    <input
                      type="number"
                      min={0}
                      step={1}
                      value={row.costPrice}
                      onChange={(e) =>
                        updateRow(row._key, { costPrice: parseFloat(e.target.value) || 0 })
                      }
                      required
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-blue-500"
                    />

                    <input
                      type="text"
                      value={row.batchNumber ?? ''}
                      onChange={(e) => updateRow(row._key, { batchNumber: e.target.value })}
                      placeholder="Ixtiyoriy"
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-blue-500"
                    />

                    <input
                      type="date"
                      value={row.expiryDate ?? ''}
                      onChange={(e) => updateRow(row._key, { expiryDate: e.target.value })}
                      className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-blue-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeRow(row._key)}
                      disabled={rows.length === 1}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                      aria-label="Qatorni o'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 px-5 py-3">
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Mahsulot qo&apos;shish
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-sm text-gray-600">
              Jami:{' '}
              <span className="font-semibold text-gray-900">
                {new Intl.NumberFormat('uz-UZ').format(
                  rows.reduce((sum, r) => sum + r.quantity * r.costPrice, 0),
                )}{' '}
                so&apos;m
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                disabled={!canSubmit || isPending}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold text-white transition',
                  'bg-blue-600 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50',
                )}
              >
                <Save className="h-4 w-4" />
                {isPending ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
