'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Save, Package, X, Hash, FileText, StickyNote } from 'lucide-react';
import { useCreateInvoice } from '@/hooks/warehouse/useWarehouseInvoices';
import { useProducts, useCreateProduct, useUpdateProduct } from '@/hooks/catalog/useProducts';
import { useSuppliers, useSupplier } from '@/hooks/catalog/useSuppliers';
import { useCategories } from '@/hooks/catalog/useCategories';
import { ProductForm } from '@/app/(admin)/catalog/products/ProductForm';
import type { ProductFormData } from '@/app/(admin)/catalog/products/ProductForm';
import { SearchableDropdown, type DropdownOption } from '@/components/ui/SearchableDropdown';
import type { CreateInvoiceDto } from '@/api/warehouse.api';
import type { Product } from '@/types/catalog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useTranslation } from '@/i18n/i18n-context';
import { NewSupplierModal } from './NewSupplierModal';
import { StockInItemsTable, type ItemRow } from './StockInItemsTable';

let _keyCounter = 0;
const nextKey = () => ++_keyCounter;

let _batchCounter = 0;
function nextBatchNumber(): string {
  _batchCounter++;
  const d = new Date();
  const date = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(d.getDate()).padStart(2, '0')}`;
  return `P-${date}-${String(_batchCounter).padStart(3, '0')}`;
}

export default function StockInPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const { mutate: createInvoice, isPending } = useCreateInvoice();
  const { data: productsData } = useProducts({ limit: 500 });
  const { data: suppliers } = useSuppliers();
  const { mutate: createProduct, isPending: isCreatingProduct } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdatingProduct } = useUpdateProduct();
  const { data: categories } = useCategories();
  const allProducts = (productsData?.items ?? (Array.isArray(productsData) ? productsData : [])) as { id: string; name: string; barcode?: string | null; sku?: string | null; costPrice?: number }[];

  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [showInvoiceNumber, setShowInvoiceNumber] = useState(false);
  const [note, setNote] = useState('');
  const [supplierId, setSupplierId] = useState('');

  const [submitted, setSubmitted] = useState(false);
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);

  const [productModal, setProductModal] = useState<{ rowKey: number } | null>(null);
  const [editProductModal, setEditProductModal] = useState<Product | null>(null);

  const [items, setItems] = useState<ItemRow[]>([
    { _key: nextKey(), productId: '', quantity: 1, purchasePrice: 0, batchNumber: nextBatchNumber() },
  ]);

  const { data: supplierDetail } = useSupplier(supplierId || null);
  // Reset banner when supplier changes
  useEffect(() => { setBannerDismissed(false); }, [supplierId]);
  // Auto-populate: when supplier's products loaded and table is empty (1 blank row) → auto-add
  useEffect(() => {
    if (!supplierDetail?.productSuppliers?.length) return;
    const hasFilledRows = items.some((r) => r.productId);
    if (hasFilledRows) return; // let banner handle it
    const newRows = supplierDetail.productSuppliers
      .filter((ps) => ps.product.isActive)
      .map((ps) => {
        const p = allProducts.find((x) => x.id === ps.product.id);
        return { _key: nextKey(), productId: ps.product.id, productName: ps.product.name, quantity: 1, purchasePrice: p?.costPrice ?? 0, batchNumber: nextBatchNumber() };
      });
    if (newRows.length > 0) {
      setItems(newRows);
      setBannerDismissed(true);
    }
  }, [supplierDetail]); // eslint-disable-line react-hooks/exhaustive-deps
  const supplierProducts = supplierDetail?.productSuppliers?.filter((ps) => ps.product.isActive) ?? [];
  const showBanner = !!supplierId && !bannerDismissed && supplierProducts.length > 0
    && !supplierProducts.every((ps) => items.some((r) => r.productId === ps.product.id));

  const supplierOptions: DropdownOption[] = useMemo(
    () => (suppliers ?? []).map((s) => ({ value: s.id, label: s.name, sublabel: s.company || s.phone })),
    [suppliers],
  );

  const productOptions: DropdownOption[] = useMemo(
    () => allProducts.map((p) => ({ value: p.id, label: p.name, sublabel: p.barcode ?? p.sku ?? undefined })),
    [allProducts],
  );

  const addRow = () =>
    setItems((prev) => [...prev, { _key: nextKey(), productId: '', quantity: 1, purchasePrice: 0, batchNumber: nextBatchNumber() }]);

  const removeRow = (key: number) =>
    setItems((prev) => prev.filter((r) => r._key !== key));

  const updateRow = (key: number, patch: Partial<ItemRow>) =>
    setItems((prev) => prev.map((r) => (r._key === key ? { ...r, ...patch } : r)));

  const handleCreateProduct = (formData: ProductFormData) => {
    const allBarcodes = (formData.extraBarcodes ?? []).map((b) => b.value).filter((v) => v.trim().length > 0);
    createProduct(
      {
        name: formData.name,
        sku: formData.sku || undefined,
        categoryId: formData.categoryId || undefined,
        costPrice: formData.costPrice,
        sellPrice: formData.sellPrice,
        minStockLevel: formData.minStockLevel,
        barcode: allBarcodes[0] || undefined,
        extraBarcodes: allBarcodes.slice(1),
        supplierId: formData.supplierId || undefined,
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

  const handleUpdateProduct = (formData: ProductFormData) => {
    if (!editProductModal) return;
    const allBarcodes = (formData.extraBarcodes ?? []).map((b) => b.value).filter((v) => v.trim().length > 0);
    updateProduct(
      {
        id: editProductModal.id,
        dto: {
          name: formData.name,
          sku: formData.sku || undefined,
          categoryId: formData.categoryId || undefined,
          costPrice: formData.costPrice,
          sellPrice: formData.sellPrice,
          minStockLevel: formData.minStockLevel,
          barcode: allBarcodes[0] || undefined,
          extraBarcodes: allBarcodes.slice(1),
        },
      },
      {
        onSuccess: () => {
          // Update the row's purchasePrice if this product is in the table
          setItems((prev) => prev.map((r) =>
            r.productId === editProductModal.id ? { ...r, purchasePrice: formData.costPrice } : r
          ));
          setEditProductModal(null);
        },
      },
    );
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    const noProduct = items.filter((r) => !r.productId);
    if (noProduct.length === items.length) {
      toast.error(t('warehouse.selectAtLeastOneProduct'));
      return;
    }

    const invalidQty = items.filter((r) => r.productId && r.quantity <= 0);
    if (invalidQty.length > 0) {
      toast.error(t('warehouse.qtyMustBePositive'));
      return;
    }

    const invalidPrice = items.filter((r) => r.productId && r.purchasePrice < 0);
    if (invalidPrice.length > 0) {
      toast.error(t('warehouse.priceCannotBeNegative'));
      return;
    }

    const valid = items.filter((r) => r.productId && r.quantity > 0 && r.purchasePrice >= 0);
    if (valid.length === 0) return;

    const dto: CreateInvoiceDto = {
      invoiceNumber: invoiceNumber || undefined,
      note: note || undefined,
      supplierId: supplierId || undefined,
      items: valid.map(({ productId, quantity, purchasePrice, warehouseId, batchNumber, expiryDate }) => ({
        productId,
        quantity: Math.max(1, Math.round(quantity)),
        purchasePrice: Math.max(0, purchasePrice),
        warehouseId: warehouseId || undefined,
        batchNumber: batchNumber?.trim() || undefined,
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
          <h1 className="text-2xl font-bold text-gray-900">{t('warehouse.stockInTitle')}</h1>
          <p className="text-sm text-gray-500">{t('warehouse.stockInSubtitle')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice meta — card */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-4 w-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-700">{t('warehouse.invoiceMeta')}</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Invoice number — optional toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('warehouse.invoiceNumberLabel')}</label>
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
                  {t('warehouse.addNumber')}
                </button>
              )}
              <p className="mt-1 text-xs text-gray-400">{t('warehouse.invoiceNumberHint')}</p>
            </div>

            {/* Supplier — SearchableDropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('nav.suppliers')}</label>
              <div className="flex gap-2">
                <SearchableDropdown
                  options={supplierOptions}
                  value={supplierId}
                  onChange={setSupplierId}
                  placeholder={t('warehouse.supplierPlaceholder')}
                  searchPlaceholder={t('warehouse.supplierSearchPlaceholder')}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(true)}
                  className="flex items-center gap-1 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs font-medium text-amber-700 transition hover:bg-amber-100 whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {t('common.new')}
                </button>
              </div>
            </div>

            {/* Note */}
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 mb-1.5">
                <StickyNote className="h-4 w-4 text-gray-400" />
                {t('warehouse.note')}
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('warehouse.additionalNote')}
                rows={3}
                className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
              />
            </div>
          </div>

          {/* Supplier products banner */}
          {showBanner && (
            <div className="mt-3 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-amber-800">
                <Package className="h-4 w-4 shrink-0 text-amber-600" />
                <span>
                  {t('warehouse.supplierHasProducts', { count: supplierProducts.length })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newRows = supplierProducts
                      .filter((ps) => !items.some((r) => r.productId === ps.product.id))
                      .map((ps) => {
                        const p = allProducts.find((x) => x.id === ps.product.id);
                        return {
                          _key: nextKey(),
                          productId: ps.product.id,
                          productName: ps.product.name,
                          quantity: 1,
                          purchasePrice: p?.costPrice ?? 0,
                          batchNumber: nextBatchNumber(),
                        };
                      });
                    setItems((prev) => {
                      const filtered = prev.filter((r) => r.productId);
                      return [...filtered, ...newRows];
                    });
                    setBannerDismissed(true);
                  }}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
                >
                  {t('common.add')}
                </button>
                <button
                  type="button"
                  onClick={() => setBannerDismissed(true)}
                  className="rounded-lg p-1.5 text-amber-500 transition hover:bg-amber-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Items table — card */}
        <StockInItemsTable
          items={items}
          submitted={submitted}
          productOptions={productOptions}
          allProducts={allProducts}
          productsData={productsData}
          onAddRow={addRow}
          onRemoveRow={removeRow}
          onUpdateRow={updateRow}
          onCreateProduct={(rowKey) => setProductModal({ rowKey })}
          onEditProduct={setEditProductModal}
        />


        {/* Submit bar */}
        <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">
            {items.filter((r) => r.productId).length} {t('warehouse.goodsSelected')}
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              {t('common.cancel')}
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
              {isPending ? t('common.saving') : t('warehouse.saveInvoice')}
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
          initialSupplierId={supplierId || undefined}
        />
      )}

      {/* Product edit modal */}
      {editProductModal && (
        <ProductForm
          product={editProductModal}
          categories={categories ?? []}
          isPending={isUpdatingProduct}
          onSubmit={handleUpdateProduct}
          onClose={() => setEditProductModal(null)}
        />
      )}

      {/* Supplier create modal */}
      {showSupplierModal && (
        <NewSupplierModal
          allProducts={allProducts}
          onCreated={(newSupplierId) => {
            setSupplierId(newSupplierId);
          }}
          onClose={() => setShowSupplierModal(false)}
        />
      )}
    </div>
  );
}
