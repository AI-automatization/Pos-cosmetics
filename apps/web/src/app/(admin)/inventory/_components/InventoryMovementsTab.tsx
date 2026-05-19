'use client';

import { PackageOpen, User } from 'lucide-react';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';

interface Movement {
  id: string;
  type: string;
  createdAt: string;
  productName?: string;
  quantity: number;
  note?: string | null;
  userName: string;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

interface InventoryMovementsTabProps {
  movements: Movement[] | undefined;
  isLoading: boolean;
}

export function InventoryMovementsTab({ movements, isLoading }: InventoryMovementsTabProps) {
  const { t } = useTranslation();

  if (isLoading) return <LoadingSkeleton variant="table" rows={8} />;

  if (!movements || movements.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center text-gray-400">
        <PackageOpen className="h-12 w-12 opacity-40" />
        <p className="text-sm">{t('inventory.noMovements')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('inventory.colDate')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('inventory.colType')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('inventory.colProduct')}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">{t('inventory.colQuantity')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('inventory.supplier')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {t('inventory.enteredBy')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {movements.map((m) => {
              const isIn = m.type === 'IN';
              const noteSupplier = isIn
                ? (m.note?.split(' | ')[0] ?? m.note ?? '—')
                : '—';
              return (
                <tr key={m.id} className="transition hover:bg-gray-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                    {formatDate(m.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'rounded-full px-2.5 py-0.5 text-xs font-medium',
                        isIn ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700',
                      )}
                    >
                      {isIn ? t('inventory.stockIn') : t('inventory.stockOut')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{m.productName ?? '—'}</td>
                  <td
                    className={cn(
                      'px-4 py-3 text-right font-semibold tabular-nums',
                      isIn ? 'text-green-600' : 'text-red-600',
                    )}
                  >
                    {isIn ? '+' : '-'}
                    {m.quantity}
                  </td>
                  <td className="max-w-[140px] truncate px-4 py-3 text-gray-600">{noteSupplier}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-gray-700">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                        <User className="h-3.5 w-3.5" />
                      </div>
                      {m.userName}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
