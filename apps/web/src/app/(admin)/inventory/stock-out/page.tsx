'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react';
import { useStockOut } from '@/hooks/inventory/useInventory';
import { useProducts } from '@/hooks/catalog/useProducts';
import type { StockOutItem, StockOutReason } from '@/types/inventory';

const REASONS: { value: StockOutReason; label: string }[] = [
  { value: 'DAMAGE', label: 'Shikastlangan' },
  { value: 'WRITE_OFF', label: 'Hisobdan chiqarish' },
  { value: 'OTHER', label: 'Boshqa sabab' },
];

interface ItemRow extends StockOutItem {
  _key: number;
}

let _keyCounter = 0;
function newRow(): ItemRow {
  return { _key: ++_keyCounter, productId: '', quantity: 1 };
}

export default function StockOutPage() {
  const router = useRouter();
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.items ?? [];
  const { mutate: submitStockOut, isPending } = useStockOut();

  const [reason, setReason] = useState<StockOutReason>('DAMAGE');
  const [notes, setNotes] = useState('');
  const [rows, setRows] = useState<ItemRow[]>([newRow()]);

  const addRow = useCallback(() => setRows((prev) => [...prev, newRow()]), []);

  const removeRow = useCallback((key: number) => {
    setRows((prev) => prev.filter((r) => r._key !== key));
  }, []);

  const updateRow = useCallback((key: number, patch: Partial<ItemRow>) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));
  }, []);

  const canSubmit =
    rows.length > 0 && rows.every((r) => r.productId && r.quantity > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    submitStockOut(
      {
        reason,
        notes: notes.trim() || undefined,
        items: rows.map(({ productId, quantity }) => ({ productId, quantity })),
      },
      { onSuccess: () => router.push('/inventory') },
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          aria-label="Orqaga"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Chiqim</h1>
          <p className="text-sm text-gray-500">Ombordan tovar chiqarish (zarar, hisobdan o&apos;chirish)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Reason + Notes */}
        <div className="grid grid-cols-2 gap-4 rounded-xl border border-gray-200 bg-white p-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-gray-700">
              Sabab <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as StockOutReason)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
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
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
            <h2 className="text-sm font-medium text-gray-700">
              Mahsulotlar ({rows.length} ta)
            </h2>
          </div>

          <div className="divide-y divide-gray-100">
            {/* Column headers */}
            <div className="grid grid-cols-[3fr_1fr_40px] gap-3 bg-gray-50/80 px-5 py-2 text-xs font-medium text-gray-500">
              <span>Mahsulot *</span>
              <span>Miqdor *</span>
              <span />
            </div>

            {rows.map((row) => (
              <div
                key={row._key}
                className="grid grid-cols-[3fr_1fr_40px] items-center gap-3 px-5 py-3"
              >
                <select
                  value={row.productId}
                  onChange={(e) => updateRow(row._key, { productId: e.target.value })}
                  required
                  className="rounded-lg border border-gray-300 px-2 py-2 text-sm outline-none transition focus:border-blue-500"
                >
                  <option value="">— Mahsulot tanlang —</option>
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={!canSubmit || isPending}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Saqlanmoqda...' : 'Chiqimni saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
