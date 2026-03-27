'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Package } from 'lucide-react';
import { useCreateInvoice } from '@/hooks/warehouse/useWarehouseInvoices';
import { useProducts } from '@/hooks/catalog/useProducts';
import { useSuppliers } from '@/hooks/catalog/useSuppliers';
import type { CreateInvoiceDto, InvoiceItem } from '@/api/warehouse.api';

interface ItemRow extends InvoiceItem {
  _key: number;
  productName?: string;
  productSearch?: string;
}

let _keyCounter = 0;
const nextKey = () => ++_keyCounter;

export default function StockInPage() {
  const router = useRouter();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { data: productsData } = useProducts({ limit: 500 });
  const { data: suppliers } = useSuppliers();
  const products = productsData?.items ?? productsData ?? [];

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [note, setNote] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [items, setItems] = useState<ItemRow[]>([
    { _key: nextKey(), productId: '', quantity: 1, purchasePrice: 0 },
  ]);

  const addRow = () =>
    setItems((prev) => [...prev, { _key: nextKey(), productId: '', quantity: 1, purchasePrice: 0 }]);

  const removeRow = (key: number) =>
    setItems((prev) => prev.filter((r) => r._key !== key));

  const updateRow = (key: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const totalCost = items.reduce((s, r) => s + r.quantity * r.purchasePrice, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter((r) => r.productId && r.quantity > 0);
    if (valid.length === 0) return;

    const dto: CreateInvoiceDto = {
      invoiceNumber: invoiceNumber || undefined,
      note: note || undefined,
      supplierId: supplierId || undefined,
      items: valid.map(({ productId, quantity, purchasePrice, warehouseId, batchNumber, expiryDate }) => ({
        productId, quantity, purchasePrice, warehouseId, batchNumber, expiryDate,
      })),
    };

    createInvoice(dto, { onSuccess: () => router.push('/warehouse/invoices') });
  };

  const allProducts = Array.isArray(products) ? products : [];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Package className="h-6 w-6 text-amber-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tovar qabul qilish</h1>
          <p className="text-sm text-gray-500">Yangi nakladnoy yaratish (snapshot)</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice meta */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nakladnoy raqami</label>
            <input
              type="text"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              placeholder="INV-2026-001"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yetkazib beruvchi</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">— Tanlang —</option>
              {(suppliers ?? []).map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Tovarlar ({items.length})</h2>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1 text-sm text-amber-600 hover:text-amber-700 font-medium"
            >
              <Plus className="h-4 w-4" />
              Qator qo'shish
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-3 py-2 text-left w-56">Tovar</th>
                  <th className="px-3 py-2 text-right w-20">Miqdor</th>
                  <th className="px-3 py-2 text-right w-28">Narx (UZS)</th>
                  <th className="px-3 py-2 text-left w-24">Partiya №</th>
                  <th className="px-3 py-2 text-left w-32">Muddat</th>
                  <th className="px-3 py-2 text-right w-28">Jami</th>
                  <th className="px-3 py-2 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((row) => {
                  const filtered = row.productSearch
                    ? allProducts.filter((p: { id: string; name: string }) =>
                        p.name.toLowerCase().includes(row.productSearch!.toLowerCase()),
                      )
                    : allProducts;

                  return (
                    <tr key={row._key}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          placeholder="Qidirish..."
                          value={row.productSearch ?? ''}
                          onChange={(e) => updateRow(row._key, { productSearch: e.target.value })}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-xs mb-1 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                        <select
                          value={row.productId}
                          onChange={(e) => {
                            const p = allProducts.find(
                              (x: { id: string; name: string }) => x.id === e.target.value,
                            );
                            updateRow(row._key, { productId: e.target.value, productName: p?.name });
                          }}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        >
                          <option value="">— Tanlang —</option>
                          {filtered.map((p: { id: string; name: string }) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(e) => updateRow(row._key, { quantity: Number(e.target.value) })}
                          className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min={0}
                          value={row.purchasePrice}
                          onChange={(e) => updateRow(row._key, { purchasePrice: Number(e.target.value) })}
                          className="w-full text-right border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={row.batchNumber ?? ''}
                          onChange={(e) => updateRow(row._key, { batchNumber: e.target.value || undefined })}
                          placeholder="Batch-001"
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="date"
                          value={row.expiryDate ?? ''}
                          onChange={(e) => updateRow(row._key, { expiryDate: e.target.value || undefined })}
                          className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-gray-900">
                        {(row.quantity * row.purchasePrice).toLocaleString('uz-UZ')}
                      </td>
                      <td className="px-3 py-2">
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
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t border-gray-200">
                <tr>
                  <td colSpan={5} className="px-3 py-2 text-right text-sm font-semibold text-gray-700">
                    JAMI:
                  </td>
                  <td className="px-3 py-2 text-right font-bold text-gray-900">
                    {totalCost.toLocaleString('uz-UZ')} UZS
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
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
            className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {isPending ? 'Saqlanmoqda...' : 'Nakladnoyni saqlash'}
          </button>
        </div>
      </form>
    </div>
  );
}
