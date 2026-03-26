'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertTriangle } from 'lucide-react';
import { useWriteOff } from '@/hooks/warehouse/useWarehouseInvoices';
import { useProducts } from '@/hooks/catalog/useProducts';
import type { WriteOffReason } from '@/api/warehouse.api';

const REASONS: { value: WriteOffReason; label: string }[] = [
  { value: 'DAMAGED', label: 'Shikastlangan' },
  { value: 'EXPIRED', label: 'Muddati o\'tgan' },
  { value: 'LOST', label: 'Yo\'qolgan' },
  { value: 'OTHER', label: 'Boshqa' },
];

interface ItemRow { _key: number; productId: string; qty: number }

let _k = 0;
const nextKey = () => ++_k;

export default function WriteOffPage() {
  const router = useRouter();
  const { mutate: writeOff, isPending } = useWriteOff();
  const { data: productsData } = useProducts({ limit: 500 });
  const products = productsData?.items ?? productsData ?? [];

  const [reason, setReason] = useState<WriteOffReason>('DAMAGED');
  const [note, setNote] = useState('');
  const [items, setItems] = useState<ItemRow[]>([{ _key: nextKey(), productId: '', qty: 1 }]);

  const addRow = () => setItems((p) => [...p, { _key: nextKey(), productId: '', qty: 1 }]);
  const removeRow = (key: number) => setItems((p) => p.filter((r) => r._key !== key));
  const updateRow = (key: number, patch: Partial<ItemRow>) =>
    setItems((p) => p.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const reasonMeta = REASONS.find((r) => r.value === reason);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter((r) => r.productId && r.qty > 0);
    if (valid.length === 0) return;
    writeOff(
      { reason, note: note || undefined, items: valid.map(({ productId, qty }) => ({ productId, qty })) },
      { onSuccess: () => router.push('/warehouse') },
    );
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertTriangle className="h-6 w-6 text-red-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tovarni hisobdan chiqarish</h1>
          <p className="text-sm text-gray-500">Shikastlangan, muddati o'tgan yoki yo'qolgan tovarlar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reason + Note */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sabab *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value as WriteOffReason)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              {REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Izoh</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Qo'shimcha izoh..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
            />
          </div>
        </div>

        {/* Reason badge */}
        <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Sabab: <span className="font-semibold">{reasonMeta?.label}</span> — Bu amal qaytarib bo'lmaydi!
        </div>

        {/* Items */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Tovarlar</h2>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 font-medium"
            >
              <Plus className="h-4 w-4" /> Qator qo'shish
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-2 text-left">Tovar</th>
                <th className="px-4 py-2 text-right w-28">Miqdor</th>
                <th className="px-4 py-2 w-8"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {items.map((row) => (
                <tr key={row._key}>
                  <td className="px-4 py-2">
                    <select
                      value={row.productId}
                      onChange={(e) => updateRow(row._key, { productId: e.target.value })}
                      className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                    >
                      <option value="">— Tanlang —</option>
                      {(Array.isArray(products) ? products : []).map((p: { id: string; name: string }) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={1}
                      value={row.qty}
                      onChange={(e) => updateRow(row._key, { qty: Number(e.target.value) })}
                      className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-red-400"
                    />
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={() => removeRow(row._key)}
                      disabled={items.length === 1}
                      className="text-gray-400 hover:text-red-500 disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            disabled={isPending || items.every((r) => !r.productId)}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <AlertTriangle className="h-4 w-4" />
            {isPending ? 'Amalga oshirilmoqda...' : 'Hisobdan chiqarish'}
          </button>
        </div>
      </form>
    </div>
  );
}
