'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, AlertTriangle, StickyNote } from 'lucide-react';
import { useWriteOff } from '@/hooks/warehouse/useWarehouseInvoices';
import { useProducts } from '@/hooks/catalog/useProducts';
import { SearchableDropdown, type DropdownOption } from '@/components/ui/SearchableDropdown';
import type { WriteOffReason } from '@/api/warehouse.api';
import { cn } from '@/lib/utils';

const REASONS: { value: WriteOffReason; label: string }[] = [
  { value: 'DAMAGED', label: 'Shikastlangan' },
  { value: 'EXPIRED', label: 'Muddati o\'tgan' },
  { value: 'LOST', label: 'Yo\'qolgan' },
  { value: 'OTHER', label: 'Boshqa' },
];

const reasonOptions: DropdownOption[] = REASONS.map((r) => ({ value: r.value, label: r.label }));

interface ItemRow { _key: number; productId: string; qty: number }

let _k = 0;
const nextKey = () => ++_k;

export default function WriteOffPage() {
  const router = useRouter();
  const { mutate: writeOff, isPending } = useWriteOff();
  const { data: productsData } = useProducts({ limit: 500 });
  const products = (productsData?.items ?? (Array.isArray(productsData) ? productsData : [])) as { id: string; name: string; barcode?: string | null; sku?: string | null }[];

  const [reason, setReason] = useState<string>('DAMAGED');
  const [note, setNote] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [items, setItems] = useState<ItemRow[]>([{ _key: nextKey(), productId: '', qty: 1 }]);

  const productOptions: DropdownOption[] = useMemo(
    () => products.map((p) => ({ value: p.id, label: p.name, sublabel: p.barcode ?? p.sku ?? undefined })),
    [products],
  );

  const addRow = () => setItems((p) => [...p, { _key: nextKey(), productId: '', qty: 1 }]);
  const removeRow = (key: number) => setItems((p) => p.filter((r) => r._key !== key));
  const updateRow = (key: number, patch: Partial<ItemRow>) =>
    setItems((p) => p.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const reasonLabel = REASONS.find((r) => r.value === reason)?.label;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    const valid = items.filter((r) => r.productId && r.qty > 0);
    if (valid.length === 0) return;
    writeOff(
      { reason: reason as WriteOffReason, note: note || undefined, items: valid.map(({ productId, qty }) => ({ productId, qty })) },
      { onSuccess: () => router.push('/warehouse') },
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hisobdan chiqarish</h1>
          <p className="text-sm text-gray-500">Shikastlangan, muddati o&apos;tgan yoki yo&apos;qolgan tovarlar</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Reason + Note — card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Sabab *</label>
              <SearchableDropdown
                options={reasonOptions}
                value={reason}
                onChange={setReason}
                placeholder="Sababni tanlang..."
                searchable={false}
                clearable={false}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Izoh</label>
              <div className="relative">
                <StickyNote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Qo'shimcha izoh..."
                  className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-9 pr-3.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Warning banner */}
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <div className="text-sm text-red-700">
            Sabab: <span className="font-bold">{reasonLabel}</span> — Bu amal qaytarib bo&apos;lmaydi!
          </div>
        </div>

        {/* Items — card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-gray-700">Tovarlar</h2>
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                {items.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:bg-red-100"
            >
              <Plus className="h-4 w-4" />
              Qator qo&apos;shish
            </button>
          </div>

          <table className="w-full text-sm">
            <thead className="bg-gray-50/80 sticky top-0 z-10">
              <tr className="text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3 text-left">Tovar</th>
                <th className="px-4 py-3 text-right w-32">Miqdor</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
          </table>
          <div className="max-h-[480px] overflow-y-auto">
            <table className="w-full text-sm">
              <colgroup>
                <col />
                <col className="w-32" />
                <col className="w-12" />
              </colgroup>
              <tbody className="divide-y divide-gray-50">
                {items.map((row) => {
                  const rowInvalid = submitted && !row.productId;
                  const qtyInvalid = submitted && row.qty <= 0;
                  return (
                  <tr key={row._key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <SearchableDropdown
                        options={productOptions}
                        value={row.productId}
                        onChange={(val) => updateRow(row._key, { productId: val })}
                        placeholder="Mahsulot tanlang..."
                        searchPlaceholder="Nomi yoki barcode..."
                        clearable={false}
                        className={rowInvalid ? 'ring-2 ring-red-400 rounded-xl' : ''}
                      />
                      {rowInvalid && (
                        <p className="mt-1 text-xs text-red-500">Mahsulot tanlanishi shart</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={row.qty}
                        onChange={(e) => updateRow(row._key, { qty: Number(e.target.value) })}
                        className={cn(
                          'w-full text-right rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                          qtyInvalid ? 'border-red-400' : 'border-gray-300',
                        )}
                      />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row._key)}
                        disabled={items.length === 1}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Submit bar */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            {items.filter((r) => r.productId).length} ta tovar tanlangan
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isPending || items.every((r) => !r.productId)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition',
                'bg-red-600 hover:bg-red-700 active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <AlertTriangle className="h-4 w-4" />
              {isPending ? 'Amalga oshirilmoqda...' : 'Hisobdan chiqarish'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
