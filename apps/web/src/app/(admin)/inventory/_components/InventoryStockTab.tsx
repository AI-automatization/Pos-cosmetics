'use client';

import { PackageOpen } from 'lucide-react';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { ErrorState } from '@/components/common/ErrorState';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { StockLevel, StockStatus } from '@/types/inventory';

function StatusBadge({ status }: { status: StockStatus }) {
  const { t } = useTranslation();
  const config: Record<string, { label: string; className: string }> = {
    OK: { label: t('inventory.statusOk'), className: 'bg-green-100 text-green-700' },
    LOW: { label: t('inventory.statusLow'), className: 'bg-yellow-100 text-yellow-700' },
    OUT: { label: t('inventory.statusOut'), className: 'bg-red-100 text-red-700' },
  };
  const item = config[status] ?? { label: status, className: 'bg-gray-100 text-gray-600' };
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', item.className)}>
      {item.label}
    </span>
  );
}

function StockQty({ value, status }: { value: number; status: StockStatus }) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums',
        status === 'OUT' ? 'text-red-600' : status === 'LOW' ? 'text-yellow-600' : 'text-gray-900',
      )}
    >
      {value}
    </span>
  );
}

interface InventoryStockTabProps {
  stock: StockLevel[] | undefined;
  isLoading: boolean;
  isError: boolean;
  search: string;
  onSearchChange: (v: string) => void;
  onSelectProduct: (item: StockLevel) => void;
  onRetry: () => void;
}

export function InventoryStockTab({
  stock,
  isLoading,
  isError,
  search,
  onSearchChange,
  onSelectProduct,
  onRetry,
}: InventoryStockTabProps) {
  const { t } = useTranslation();

  if (isError) return <ErrorState compact onRetry={onRetry} />;

  return (
    <ScrollableTable
      searchValue={search}
      onSearchChange={onSearchChange}
      searchPlaceholder={t('inventory.searchPlaceholder')}
      totalCount={stock?.length}
      isLoading={isLoading}
    >
      <table className="w-full text-sm">
        <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('inventory.colProduct')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('inventory.colBarcode')}</th>
            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('inventory.colCategory')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">{t('inventory.colStock')}</th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">{t('inventory.colMin')}</th>
            <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('inventory.colStatus')}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {!stock || stock.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <PackageOpen className="h-10 w-10 opacity-40" />
                  <p className="text-sm">{search ? t('common.noSearchResults') : t('common.noData')}</p>
                </div>
              </td>
            </tr>
          ) : (
            stock.map((item) => (
              <tr
                key={item.productId}
                onClick={() => onSelectProduct(item)}
                className={cn(
                  'cursor-pointer transition hover:bg-blue-50/60',
                  item.status === 'OUT' && 'bg-red-50/40',
                  item.status === 'LOW' && 'bg-yellow-50/40',
                )}
              >
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{item.productName}</div>
                  <div className="text-xs text-gray-400">{item.sku} · {item.unit}</div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{item.barcode ?? '—'}</td>
                <td className="px-4 py-3 text-gray-600">{item.categoryName}</td>
                <td className="px-4 py-3 text-right">
                  <StockQty value={item.currentStock} status={item.status} />
                  <span className="ml-1 text-xs text-gray-400">{item.unit}</span>
                </td>
                <td className="px-4 py-3 text-right text-gray-500">{item.minStock}</td>
                <td className="px-4 py-3 text-center">
                  <StatusBadge status={item.status} />
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </ScrollableTable>
  );
}
