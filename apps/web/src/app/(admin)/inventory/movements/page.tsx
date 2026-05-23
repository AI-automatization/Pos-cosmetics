'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, PackageOpen, User } from 'lucide-react';
import { useMovementsWithUsers } from '@/hooks/inventory/useInventory';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { MovementType } from '@/types/inventory';

const TYPE_STYLES: Record<MovementType, string> = {
  IN:         'bg-green-100 text-green-700',
  OUT:        'bg-red-100 text-red-700',
  ADJUSTMENT: 'bg-yellow-100 text-yellow-700',
  RETURN:     'bg-blue-100 text-blue-700',
  TRANSFER:   'bg-purple-100 text-purple-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function MovementsPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { data: movements, isLoading } = useMovementsWithUsers();

  const typeLabels: Record<MovementType, string> = {
    IN: t('inventory.typeIn'),
    OUT: t('inventory.typeOut'),
    ADJUSTMENT: t('inventory.typeAdjustment'),
    RETURN: t('inventory.typeReturn'),
    TRANSFER: t('inventory.typeTransfer'),
  };

  const filtered = (movements ?? []).filter((m) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (m.productName ?? '').toLowerCase().includes(q) ||
      (m.note ?? '').toLowerCase().includes(q) ||
      m.type.toLowerCase().includes(q)
    );
  });

  const total = filtered.length;
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      <div className="flex items-center gap-3">
        <Link href="/inventory" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('inventory.movementsTitle')}</h1>
          <p className="text-sm text-gray-500">
            {movements ? `${t('common.total')}: ${movements.length}` : t('common.loading')}
          </p>
        </div>
      </div>

      <ScrollableTable
        searchValue={search}
        onSearchChange={(v) => { setSearch(v); setPage(1); }}
        searchPlaceholder={t('inventory.movementsSearch')}
        totalCount={total}
        isLoading={isLoading}
        pagination={{
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (s) => { setPageSize(s); setPage(1); },
        }}
      >
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('common.date')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('common.type')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('products.productName')}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">{t('common.quantity')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('common.note')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                <div className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {t('common.createdBy')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <PackageOpen className="mx-auto mb-2 h-10 w-10 opacity-30" />
                  <p className="text-sm text-gray-400">
                    {search ? t('common.noSearchResults') : t('inventory.noMovements')}
                  </p>
                </td>
              </tr>
            ) : (
              paginated.map((m) => {
                const isIn = m.type === 'IN' || m.type === 'RETURN';
                const style = TYPE_STYLES[m.type as MovementType] ?? 'bg-gray-100 text-gray-600';
                const label = typeLabels[m.type as MovementType] ?? m.type;
                return (
                  <tr key={m.id} className="transition hover:bg-gray-50">
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-500">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-medium', style)}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {m.productName ?? '—'}
                    </td>
                    <td className={cn(
                      'px-4 py-3 text-right font-semibold tabular-nums',
                      isIn ? 'text-green-600' : 'text-red-600',
                    )}>
                      {isIn ? '+' : '−'}{m.quantity}
                    </td>
                    <td className="max-w-[180px] truncate px-4 py-3 text-gray-500">
                      {m.note ?? '—'}
                    </td>
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
              })
            )}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}
