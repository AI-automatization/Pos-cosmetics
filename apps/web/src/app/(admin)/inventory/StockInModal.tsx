'use client';

import { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { useStockIn } from '@/hooks/inventory/useInventory';
import { SupplierSearchSelect } from './SupplierSearchSelect';
import { ProductSearchSelect } from './ProductSearchSelect';
import { cn } from '@/lib/utils';

interface ItemRow {
  _key: number;
  productId: string;
  productUnit: string;
  quantity: string;   // string — qulay kiritish uchun
  costPrice: string;  // string — qulay kiritish uchun
  batchNumber: string;
  expiryDate: string;
}

let _keyCounter = 0;
function newRow(): ItemRow {
  return {
    _key: ++_keyCounter,
    productId: '',
    productUnit: '',
    quantity: '',
    costPrice: '',
    batchNumber: '',
    expiryDate: '',
  };
}

interface StockInModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StockInModal({ isOpen, onClose }: StockInModalProps) {
  const { mutate: submitStockIn, isPending } = useStockIn();

  const [supplier, setSupplier] = useState('');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<ItemRow[]>([newRow()]);

  useEffect(() => {
    if (isOpen) {
      setSupplier('');
      setNotes('');
      setRows([newRow()]);
    }
  }, [isOpen]);

  const addRow = useCallback(() => setRows((prev) => [...prev, newRow()]), []);

  const removeRow = useCallback((key: number) => {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r._key !== key) : prev));
  }, []);

  const updateRow = useCallback((key: number, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }, []);

  const parsedRows = rows.map((r) => ({
    ...r,
    qtyNum: parseFloat(r.quantity) || 0,
    priceNum: parseFloat(r.costPrice) || 0,
  }));

  const canSubmit =
    supplier.trim().length > 0 &&
    parsedRows.length > 0 &&
    parsedRows.every((r) => r.productId && r.qtyNum > 0 && r.priceNum >= 0);

  const totalSum = parsedRows.reduce((s, r) => s + r.qtyNum * r.priceNum, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    submitStockIn(
      {
        supplier: supplier.trim(),
        notes: notes.trim() || undefined,
        items: parsedRows.map(({ productId, qtyNum, priceNum, batchNumber, expiryDate }) => ({
          productId,
          quantity: qtyNum,
          costPrice: priceNum,
          batchNumber: batchNumber || undefined,
          expiryDate: expiryDate || undefined,
        })),
      },
      { onSuccess: onClose },
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto py-6">
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-3xl mx-4 flex flex-col rounded-2xl bg-white shadow-2xl">
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
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex flex-col gap-5 p-6">

            {/* Supplier + Notes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">
                  Yetkazib beruvchi <span className="text-red-500">*</span>
                </label>
                <SupplierSearchSelect value={supplier} onChange={setSupplier} required />
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

            {/* Items — card per row */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-700">
                  Mahsulotlar ({rows.length} ta)
                </h3>
                <button
                  type="button"
                  onClick={addRow}
                  className="flex items-center gap-1.5 text-sm font-medium text-blue-600 transition hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  Qo&apos;shish
                </button>
              </div>

              {rows.map((row, idx) => (
                <div
                  key={row._key}
                  className="rounded-xl border border-gray-200 bg-gray-50/50 p-4"
                >
                  {/* Row header */}
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-400">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeRow(row._key)}
                      disabled={rows.length === 1}
                      className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Product search — full width */}
                  <div className="mb-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Mahsulot <span className="text-red-500">*</span>
                    </label>
                    <ProductSearchSelect
                      value={row.productId}
                      onChange={(id, p) =>
                        updateRow(row._key, { productId: id, productUnit: p?.unit ?? '' })
                      }
                      required
                    />
                  </div>

                  {/* Miqdor | Narx | Partiya | Muddati */}
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">
                        Miqdor{row.productUnit ? ` (${row.productUnit})` : ''} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={row.quantity}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateRow(row._key, { quantity: e.target.value })}
                        placeholder="0"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">
                        Narx (so&apos;m) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="any"
                        value={row.costPrice}
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => updateRow(row._key, { costPrice: e.target.value })}
                        placeholder="0"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Partiya №</label>
                      <input
                        type="text"
                        value={row.batchNumber}
                        onChange={(e) => updateRow(row._key, { batchNumber: e.target.value })}
                        placeholder="Ixtiyoriy"
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-gray-500">Muddati</label>
                      <input
                        type="date"
                        value={row.expiryDate}
                        onChange={(e) => updateRow(row._key, { expiryDate: e.target.value })}
                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  {/* Row subtotal */}
                  {row.quantity && row.costPrice && (
                    <div className="mt-2 text-right text-xs text-gray-400">
                      Jami:{' '}
                      <span className="font-semibold text-gray-600">
                        {new Intl.NumberFormat('uz-UZ').format(
                          (parseFloat(row.quantity) || 0) * (parseFloat(row.costPrice) || 0),
                        )}{' '}
                        so&apos;m
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between rounded-b-2xl border-t border-gray-200 bg-gray-50 px-6 py-4">
            <div className="text-sm text-gray-600">
              Umumiy jami:{' '}
              <span className="font-bold text-gray-900">
                {new Intl.NumberFormat('uz-UZ').format(totalSum)} so&apos;m
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
