'use client';

import { Plus, Trash2, Pencil } from 'lucide-react';
import { SearchableDropdown, type DropdownOption } from '@/components/ui/SearchableDropdown';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Product } from '@/types/catalog';
import type { InvoiceItem } from '@/api/warehouse.api';

export interface ItemRow extends InvoiceItem {
  _key: number;
  productName?: string;
}

interface Props {
  items: ItemRow[];
  submitted: boolean;
  productOptions: DropdownOption[];
  allProducts: { id: string; name: string; barcode?: string | null; sku?: string | null; costPrice?: number }[];
  productsData: { items?: Product[] } | Product[] | undefined;
  onAddRow: () => void;
  onRemoveRow: (key: number) => void;
  onUpdateRow: (key: number, patch: Partial<ItemRow>) => void;
  onCreateProduct: (rowKey: number) => void;
  onEditProduct: (product: Product) => void;
}

export function StockInItemsTable({
  items,
  submitted,
  productOptions,
  allProducts,
  productsData,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onCreateProduct,
  onEditProduct,
}: Props) {
  const { t } = useTranslation();
  const totalCost = items.reduce((s, r) => s + r.quantity * r.purchasePrice, 0);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-700">{t('warehouse.goods')}</span>
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
            {items.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onAddRow}
          className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition hover:bg-blue-100"
        >
          <Plus className="h-4 w-4" />
          {t('warehouse.addRow')}
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50/80 sticky top-0 z-10">
            <tr className="text-xs text-gray-500 uppercase tracking-wider">
              <th className="px-4 py-3 text-left min-w-[280px]">{t('warehouse.good')}</th>
              <th className="px-4 py-3 text-right w-24">{t('warehouse.quantity')}</th>
              <th className="px-4 py-3 text-right w-36">{t('warehouse.priceUzs')}</th>
              <th className="px-4 py-3 text-left w-28">{t('warehouse.batch')}</th>
              <th className="px-4 py-3 text-right w-32">{t('warehouse.total')}</th>
              <th className="px-4 py-3 w-12" />
            </tr>
          </thead>
        </table>
        <div className="max-h-[480px] overflow-y-auto">
          <table className="w-full text-sm">
            <colgroup>
              <col className="min-w-[280px]" />
              <col className="w-24" />
              <col className="w-36" />
              <col className="w-28" />
              <col className="w-32" />
              <col className="w-12" />
            </colgroup>
            <tbody className="divide-y divide-gray-50">
              {items.map((row) => {
                const rowInvalid = submitted && !row.productId;
                const qtyInvalid = submitted && row.quantity <= 0;
                const priceInvalid = submitted && row.purchasePrice < 0;
                return (
                  <tr key={row._key} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <SearchableDropdown
                        options={productOptions}
                        value={row.productId}
                        onChange={(val) => {
                          const p = allProducts.find((x) => x.id === val);
                          onUpdateRow(row._key, {
                            productId: val,
                            productName: p?.name,
                            ...(p?.costPrice != null && { purchasePrice: p.costPrice }),
                          });
                        }}
                        placeholder={t('warehouse.selectProduct')}
                        searchPlaceholder={t('warehouse.productSearchPlaceholder')}
                        emptyMessage={t('common.notFound')}
                        clearable={false}
                        className={rowInvalid ? 'ring-2 ring-red-400 rounded-xl' : ''}
                      />
                      {rowInvalid && (
                        <p className="mt-1 text-xs text-red-500">{t('warehouse.productRequired')}</p>
                      )}
                      {!row.productId && !rowInvalid && (
                        <button
                          type="button"
                          onClick={() => onCreateProduct(row._key)}
                          className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {t('warehouse.createNewProduct')}
                        </button>
                      )}
                      {row.productId && (
                        <button
                          type="button"
                          onClick={() => {
                            const rawItems = Array.isArray(productsData) ? productsData : (productsData?.items ?? []);
                            const p = rawItems.find((x: Product) => x.id === row.productId);
                            if (p) onEditProduct(p as Product);
                          }}
                          className="mt-1 flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 font-medium"
                        >
                          <Pencil className="h-3 w-3" /> {t('common.edit')}
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={1}
                        value={row.quantity || ''}
                        placeholder="0"
                        onChange={(e) => onUpdateRow(row._key, { quantity: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className={cn(
                          'w-full text-right rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                          qtyInvalid ? 'border-red-400' : 'border-gray-300',
                        )}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        value={row.purchasePrice || ''}
                        placeholder="0"
                        onChange={(e) => onUpdateRow(row._key, { purchasePrice: e.target.value === '' ? 0 : Number(e.target.value) })}
                        className={cn(
                          'w-full text-right rounded-xl border bg-white px-3 py-2 text-sm shadow-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20',
                          priceInvalid ? 'border-red-400' : 'border-gray-300',
                        )}
                      />
                      {priceInvalid && <p className="mt-1 text-xs text-red-500">{t('warehouse.priceCannotBeNegative')}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={row.batchNumber ?? ''}
                        onChange={(e) => onUpdateRow(row._key, { batchNumber: e.target.value || undefined })}
                        placeholder="—"
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
                        onClick={() => onRemoveRow(row._key)}
                        disabled={items.length === 1}
                        className="rounded-lg p-1.5 text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
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
        {/* Total row — outside scroll area */}
        <div className="flex items-center justify-end gap-4 border-t-2 border-gray-200 bg-gray-50/80 px-4 py-3">
          <span className="text-sm font-semibold uppercase tracking-wider text-gray-600">{t('warehouse.totalAmount')}:</span>
          <span className="text-lg font-bold text-gray-900">{totalCost.toLocaleString('uz-UZ')}</span>
          <span className="text-xs text-gray-500">UZS</span>
        </div>
      </div>
    </div>
  );
}
