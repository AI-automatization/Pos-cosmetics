'use client';

import { Plus, X, Hash, FileText, StickyNote, Package } from 'lucide-react';
import { SearchableDropdown, type DropdownOption } from '@/components/ui/SearchableDropdown';
import { useTranslation } from '@/i18n/i18n-context';
import type { ItemRow } from './StockInItemsTable';

interface SupplierProduct {
  product: { id: string; name: string; isActive: boolean };
}

interface Props {
  invoiceNumber: string;
  showInvoiceNumber: boolean;
  note: string;
  supplierId: string;
  supplierOptions: DropdownOption[];
  supplierProducts: SupplierProduct[];
  showBanner: boolean;
  items: ItemRow[];
  onInvoiceNumberChange: (v: string) => void;
  onShowInvoiceNumber: (v: boolean) => void;
  onNoteChange: (v: string) => void;
  onSupplierChange: (id: string) => void;
  onShowNewSupplier: () => void;
  onAddSupplierProducts: (products: SupplierProduct[]) => void;
  onDismissBanner: () => void;
}

export function StockInMetaCard({
  invoiceNumber,
  showInvoiceNumber,
  note,
  supplierId,
  supplierOptions,
  supplierProducts,
  showBanner,
  items,
  onInvoiceNumberChange,
  onShowInvoiceNumber,
  onNoteChange,
  onSupplierChange,
  onShowNewSupplier,
  onAddSupplierProducts,
  onDismissBanner,
}: Props) {
  const { t } = useTranslation();

  return (
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
                onChange={(e) => onInvoiceNumberChange(e.target.value)}
                placeholder="INV-2026-001"
                className="flex-1 rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                autoFocus
              />
              <button
                type="button"
                onClick={() => { onShowInvoiceNumber(false); onInvoiceNumberChange(''); }}
                className="rounded-lg px-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onShowInvoiceNumber(true)}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 px-3.5 py-2.5 text-sm text-gray-500 transition-colors hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50"
            >
              <Hash className="h-3.5 w-3.5" />
              {t('warehouse.addNumber')}
            </button>
          )}
          <p className="mt-1 text-xs text-gray-400">{t('warehouse.invoiceNumberHint')}</p>
        </div>

        {/* Supplier */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('nav.suppliers')}</label>
          <div className="flex gap-2">
            <SearchableDropdown
              options={supplierOptions}
              value={supplierId}
              onChange={onSupplierChange}
              placeholder={t('warehouse.supplierPlaceholder')}
              searchPlaceholder={t('warehouse.supplierSearchPlaceholder')}
              className="flex-1"
            />
            <button
              type="button"
              onClick={onShowNewSupplier}
              className="flex items-center gap-1 rounded-xl border border-blue-300 bg-blue-50 px-3 py-2.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100 whitespace-nowrap"
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
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={t('warehouse.additionalNote')}
            rows={3}
            className="w-full rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
          />
        </div>
      </div>

      {/* Supplier products banner */}
      {showBanner && (
        <div className="mt-3 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-blue-800">
            <Package className="h-4 w-4 shrink-0 text-blue-600" />
            <span>{t('warehouse.supplierHasProducts', { count: supplierProducts.length })}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onAddSupplierProducts(supplierProducts.filter((ps) => !items.some((r) => r.productId === ps.product.id)))}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700"
            >
              {t('common.add')}
            </button>
            <button
              type="button"
              onClick={onDismissBanner}
              className="rounded-lg p-1.5 text-blue-500 transition hover:bg-blue-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
