'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Save, Package, X, Hash, FileText, StickyNote } from 'lucide-react';
import { useCreateInvoice } from '@/hooks/warehouse/useWarehouseInvoices';
import { useProducts, useCreateProduct } from '@/hooks/catalog/useProducts';
import { useSuppliers, useCreateSupplier } from '@/hooks/catalog/useSuppliers';
import { useCategories } from '@/hooks/catalog/useCategories';
import { ProductForm } from '@/app/(admin)/catalog/products/ProductForm';
import type { ProductFormData } from '@/app/(admin)/catalog/products/ProductForm';
import { SearchableDropdown, type DropdownOption } from '@/components/ui/SearchableDropdown';
import type { CreateInvoiceDto, InvoiceItem } from '@/api/warehouse.api';
import { cn } from '@/lib/utils';

interface ItemRow extends InvoiceItem {
  _key: number;
  productName?: string;
}

let _keyCounter = 0;
const nextKey = () => ++_keyCounter;

export default function StockInPage() {
  const router = useRouter();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { data: productsData } = useProducts({ limit: 500 });
  const { data: suppliers } = useSuppliers();
  const { mutate: createSupplier, isPending: isCreatingSupplier } = useCreateSupplier();
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProduct();
  const { data: categories } = useCategories();
  const allProducts = (productsData?.items ?? (Array.isArray(productsData) ? productsData : [])) as { id: string; name: string; barcode?: string | null; sku?: string | null }[];

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [showInvoiceNumber, setShowInvoiceNumber] = useState(false);
  const [note, setNote] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState({ name: '', phone: '', company: '', address: '' });

  const [productModal, setProductModal] = useState<{ rowKey: number } | null>(null);
  const [items, setItems] = useState<ItemRow[]>([
    { _key: nextKey(), productId: '', quantity: 1, purchasePrice: 0, expiryDate: undefined },
  ]);

  const supplierOptions: DropdownOption[] = useMemo(
    () => (suppliers ?? []).map((s) => ({ value: s.id, label: s.name, sublabel: s.company || s.phone })),
    [suppliers],
  );

  const productOptions: DropdownOption[] = useMemo(
    () => allProducts.map((p) => ({ value: p.id, label: p.name, sublabel: p.barcode ?? p.sku ?? undefined })),
    [allProducts],
  );

  const addRow = () =>
    setItems((prev) => [...prev, { _key: nextKey(), productId: '', quantity: 1, purchasePrice: 0, expiryDate: undefined }]);

  const removeRow = (key: number) =>
    setItems((prev) => prev.filter((r) => r._key !== key));

  const updateRow = (key: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const totalCost = items.reduce((s, r) => s + r.quantity * r.purchasePrice, 0);

  const handleCreateProduct = (formData: ProductFormData) => {
    createProduct(
      {
        name: formData.name,
        sku: formData.sku || undefined,
        categoryId: formData.categoryId || undefined,
        costPrice: formData.costPrice,
        sellPrice: formData.sellPrice,
        minStockLevel: formData.minStockLevel,
        barcode: formData.barcode || undefined,
        extraBarcodes: formData.extraBarcodes?.map((b) => b.value).filter((v) => v.trim().length > 0),
      },
      {
        onSuccess: (newProduct) => {
          if (productModal) {
            updateRow(productModal.rowKey, {
              productId: newProduct.id,
              productName: newProduct.name,
              purchasePrice: formData.costPrice,
            });
          }
          setProductModal(null);
        },
      },
    );
  };

  const handleCreateSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    createSupplier(
      { name: supplierForm.name, phone: supplierForm.phone, company: supplierForm.company || undefined, address: supplierForm.address || undefined },
      {
        onSuccess: (newSupplier) => {
          setSupplierId(newSupplier.id);
          setShowSupplierModal(false);
          setSupplierForm({ name: '', phone: '', company: '', address: '' });
        },
      },
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const valid = items.filter((r) => r.productId && r.quantity > 0);
    if (valid.length === 0) return;

    const dto: CreateInvoiceDto = {
      invoiceNumber: invoiceNumber || undefined,
      note: note || undefined,
      supplierId: supplierId || undefined,
      items: valid.map(({ productId, quantity, purchasePrice, warehouseId, batchNumber, expiryDate }) => ({
        productId, quantity, purchasePrice, warehouseId, batchNumber,
        expiryDate: expiryDate || undefined,
      })),
    };

    createInvoice(dto, { onSuccess: () => router.push('/warehouse/invoices') });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100">
          <Package className="h-5 w-5 text-amber-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tovar qabul qilish</h1>
          <p className="text-sm text-gray-500">Yangi nakladnoy yaratish</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice meta — card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">Nakladnoy ma&apos;lumotlari</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Invoice number — optional toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nakladnoy raqami</label>
              {showInvoiceNumber ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="INV-2026-001"
                    className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => { setShowInvoiceNumber(false); setInvoiceNumber(''); }}
                    className="rounded-lg px-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowInvoiceNumber(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-3.5 py-2.5 text-sm text-gray-500 transition-colors hover:border-amber-400 hover:text-amber-600 hover:bg-amber-50/50"
                >
                  <Hash className="h-3.5 w-3.5" />
                  Raqam qo&apos;shish
                </button>
              )}
              <p className="mt-1 text-xs text-gray-400">Ixtiyoriy — bo&apos;sh qolsa avtomatik yaratiladi</p>
            </div>

            {/* Supplier — SearchableDropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Yetkazib beruvchi</label>
              <div className="flex gap-2">
                <SearchableDropdown
                  options={supplierOptions}
                  value={supplierId}
                  onChange={setSupplierId}
                  placeholder="Kontragent tanlang..."
                  searchPlaceholder="Nomi yoki kompaniya..."
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(true)}
                  className="flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Yangi
                </button>
              </div>
            </div>

            {/* Note */}
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

        {/* Items table — card */}
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-gray-400" />
              <h2 className="text-sm font-semibold text-gray-700">Tovarlar</h2>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
                {items.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addRow}
              className="flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-1.5 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
            >
              <Plus className="h-4 w-4" />
              Qator qo&apos;shish
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50/80">
                <tr className="text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3 text-left min-w-[280px]">Tovar</th>
                  <th className="px-4 py-3 text-right w-24">Miqdor</th>
                  <th className="px-4 py-3 text-right w-32">Narx (UZS)</th>
                  <th className="px-4 py-3 text-left w-28">Partiya</th>
                  <th className="px-4 py-3 text-left w-32">Muddat</th>
                  <th className="px-4 py-3 text-right w-32">Jami</th>
                  <th className="px-4 py-3 w-12" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((row) => (
                  <tr key={row._key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <SearchableDropdown
                        options={productOptions}
                        value={row.productId}
                        onChange={(val) => {
                          const p = allProducts.find((x) => x.id === val);
                          updateRow(row._key, { productId: val, productName: p?.name });
                        }}
                        placeholder="Mahsulot tanlang..."
                        searchPlaceholder="Nomi yoki barcode..."
                        emptyMessage="Topilmadi"
                        clearable={false}
                      />
                      {!row.productId && (
                        <button
                          type="button"
                          onClick={() => setProductModal({ rowKey: row._key })}
                          className="mt-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
                        >
                          + Yangi mahsulot yaratish
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity}
                        onChange={(e) => updateRow(row._key, { quantity: Number(e.target.value) })}
                        className="w-full text-right rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={row.purchasePrice}
                        onChange={(e) => updateRow(row._key, { purchasePrice: Number(e.target.value) })}
                        className="w-full text-right rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.batchNumber ?? ''}
                        onChange={(e) => updateRow(row._key, { batchNumber: e.target.value || undefined })}
                        placeholder="—"
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="date"
                        value={row.expiryDate ?? ''}
                        onChange={(e) => updateRow(row._key, { expiryDate: e.target.value || undefined })}
                        className="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-gray-900">
                        {(row.quantity * row.purchasePrice).toLocaleString('uz-UZ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => removeRow(row._key)}
                        disabled={items.length === 1}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t-2 border-gray-200 bg-gray-50/80">
                <tr>
                  <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Jami summa:
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-lg font-bold text-gray-900">
                      {totalCost.toLocaleString('uz-UZ')}
                    </span>
                    <span className="ml-1 text-xs text-gray-500">UZS</span>
                  </td>
                  <td />
                </tr>
              </tfoot>
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
                'bg-amber-600 hover:bg-amber-700 active:scale-[0.98]',
                'disabled:opacity-50 disabled:cursor-not-allowed',
              )}
            >
              <Save className="h-4 w-4" />
              {isPending ? 'Saqlanmoqda...' : 'Nakladnoyni saqlash'}
            </button>
          </div>
        </div>
      </form>

      {/* Product create modal */}
      {productModal && (
        <ProductForm
          product={null}
          categories={categories ?? []}
          isPending={isCreatingProduct}
          onSubmit={handleCreateProduct}
          onClose={() => setProductModal(null)}
        />
      )}

      {/* Supplier create modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md mx-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900">Yangi kontragent</h3>
              <button
                type="button"
                onClick={() => setShowSupplierModal(false)}
                className="rounded-lg p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSupplier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomi *</label>
                <input
                  type="text"
                  required
                  value={supplierForm.name}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telefon *</label>
                <input
                  type="text"
                  required
                  placeholder="+998XXXXXXXXX"
                  value={supplierForm.phone}
                  onChange={(e) => setSupplierForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Kompaniya</label>
                  <input
                    type="text"
                    value={supplierForm.company}
                    onChange={(e) => setSupplierForm((f) => ({ ...f, company: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Manzil</label>
                  <input
                    type="text"
                    value={supplierForm.address}
                    onChange={(e) => setSupplierForm((f) => ({ ...f, address: e.target.value }))}
                    className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  Bekor
                </button>
                <button
                  type="submit"
                  disabled={isCreatingSupplier}
                  className="rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-700 disabled:opacity-50"
                >
                  {isCreatingSupplier ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
