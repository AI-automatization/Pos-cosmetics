'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  BarChart2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Eye,
  Search,
} from 'lucide-react';
import { useDebts, useNasiyaSummary } from '@/hooks/customers/useDebts';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Debt } from '@/types/debt';
import { QuickPayModal } from './QuickPayModal';
import { NasiyaDetailModal } from './NasiyaDetailModal';

type FilterTab = 'all' | 'overdue' | 'current';

function DebtStatusBadge({ status }: { status: Debt['status'] }) {
  const { t } = useTranslation();
  const configs: Record<Debt['status'], { label: string; className: string }> = {
    CURRENT: { label: t('nasiya.current'), className: 'bg-green-100 text-green-700' },
    OVERDUE_30: { label: t('nasiya.days1to30'), className: 'bg-yellow-100 text-yellow-700' },
    OVERDUE_60: { label: t('nasiya.days31to60'), className: 'bg-orange-100 text-orange-700' },
    OVERDUE_90: { label: t('nasiya.days61to90'), className: 'bg-red-100 text-red-700' },
    OVERDUE_90PLUS: { label: t('nasiya.days90plus'), className: 'bg-red-200 text-red-800 font-semibold' },
  };
  const { label, className } = configs[status];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs', className)}>
      {label}
    </span>
  );
}

export default function NasiyaPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);
  const [selectedDebtId, setSelectedDebtId] = useState<string | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const { data: allDebts, isLoading } = useDebts({ overdue: tab === 'overdue' });
  const { data: summary } = useNasiyaSummary();

  const filtered = (allDebts ?? []).filter((d) => {
    const matchSearch =
      !search ||
      d.customerName.toLowerCase().includes(search.toLowerCase()) ||
      d.customerPhone.includes(search) ||
      (d.orderNumber ?? '').toLowerCase().includes(search.toLowerCase());
    const matchTab =
      tab === 'all' ||
      (tab === 'overdue' && d.status !== 'CURRENT') ||
      (tab === 'current' && d.status === 'CURRENT');
    return matchSearch && matchTab;
  });

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedData = useMemo(() => {
    if (!sortField) return filtered;
    return [...filtered].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      const bVal = (b as unknown as Record<string, unknown>)[sortField] as string | number | null | undefined;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp =
        typeof aVal === 'string'
          ? aVal.localeCompare(bVal as string)
          : (aVal as number) > (bVal as number)
          ? 1
          : (aVal as number) < (bVal as number)
          ? -1
          : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [filtered, sortField, sortDir]);

  function SortHeader({ field, label }: { field: string; label: string }) {
    const active = sortField === field;
    return (
      <button
        type="button"
        onClick={() => toggleSort(field)}
        className="flex items-center gap-1 hover:text-gray-900 group"
      >
        {label}
        <span
          className={cn(
            'transition-colors',
            active ? 'text-blue-600' : 'text-gray-300 group-hover:text-gray-500',
          )}
        >
          {active && sortDir === 'desc' ? (
            <ChevronDown className="w-3.5 h-3.5" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5" />
          )}
        </span>
      </button>
    );
  }

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'overdue', label: t('nasiya.overdue') },
    { key: 'current', label: t('nasiya.current') },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('nasiya.management')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{t('nasiya.subtitle')}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/customers"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            {t('nasiya.customers')}
          </Link>
          <Link
            href="/nasiya/aging"
            className="flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
          >
            <BarChart2 className="h-4 w-4" />
            {t('nasiya.agingReport')}
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs font-medium text-orange-600">{t('nasiya.totalDebt')}</p>
            <p className="mt-1 text-xl font-bold text-orange-700">{formatPrice(summary.totalDebt)}</p>
            <p className="mt-0.5 text-xs text-orange-500">{summary.totalCustomers} {t('nasiya.customerCount')}</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs font-medium text-red-600">{t('nasiya.overdue')}</p>
            </div>
            <p className="mt-1 text-xl font-bold text-red-700">{formatPrice(summary.overdueDebt)}</p>
            <p className="mt-0.5 text-xs text-red-500">{summary.overdueCustomers} {t('nasiya.customerCount')}</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium text-green-600">{t('nasiya.collectedThisMonth')}</p>
            <p className="mt-1 text-xl font-bold text-green-700">{formatPrice(summary.collectedThisMonth)}</p>
            <p className="mt-0.5 text-xs text-green-500">{t('nasiya.monthlyPayments')}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
        {TABS.map((tabItem) => (
          <button
            key={tabItem.key}
            type="button"
            onClick={() => setTab(tabItem.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition',
              tab === tabItem.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700',
            )}
          >
            {tabItem.label}
            {tabItem.key === 'overdue' && summary && summary.overdueCustomers > 0 && (
              <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                {summary.overdueCustomers}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overdue alert banner */}
      {tab !== 'current' && summary && summary.overdueDebt > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{formatPrice(summary.overdueDebt)}</span> {t('nasiya.overdue').toLowerCase()} —{' '}
            <span className="font-semibold">{summary.overdueCustomers} {t('nasiya.customerCount')}.</span>
          </p>
        </div>
      )}

      {/* Table */}
      <ScrollableTable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('nasiya.searchPlaceholder')}
        totalCount={filtered.length}
        isLoading={isLoading}
      >
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('nasiya.customer')}</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">{t('nasiya.order')}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">{t('nasiya.originalAmount')}</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                <SortHeader field="remainingAmount" label={t('nasiya.remainingDebt')} />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                <SortHeader field="dueDate" label={t('nasiya.dueDate')} />
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">{t('common.status')}</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
              {sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      {search || tab !== 'all' ? (
                        <Search className="h-10 w-10 opacity-40" />
                      ) : (
                        <CheckCircle className="h-10 w-10 opacity-40" />
                      )}
                      <p className="text-sm">
                        {search || tab !== 'all'
                          ? t('common.noSearchResults')
                          : t('nasiya.noDebts')}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedData.map((debt) => (
                  <tr
                    key={debt.id}
                    className={cn(
                      'transition hover:bg-gray-50',
                      debt.status === 'OVERDUE_90PLUS' && 'bg-red-50/50',
                      (debt.status === 'OVERDUE_60' || debt.status === 'OVERDUE_90') &&
                        'bg-orange-50/40',
                      debt.status === 'OVERDUE_30' && 'bg-yellow-50/30',
                    )}
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/customers/${debt.customerId}`}
                        className="font-medium text-blue-700 hover:underline"
                      >
                        {debt.customerName}
                      </Link>
                      <p className="text-xs text-gray-400 font-mono">+{debt.customerPhone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {debt.orderNumber ? `#${debt.orderNumber}` : '—'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(debt.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatPrice(debt.originalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-orange-600">
                      {formatPrice(debt.remainingAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {debt.dueDate ? new Date(debt.dueDate).toLocaleDateString('uz-UZ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DebtStatusBadge status={debt.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedDebtId(debt.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
                          title={t('nasiya.view')}
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayingDebt(debt)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                        >
                          {t('nasiya.pay')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
          </tbody>
        </table>
      </ScrollableTable>

      {/* Pay modal */}
      {payingDebt && <QuickPayModal debt={payingDebt} onClose={() => setPayingDebt(null)} />}

      {/* Detail modal */}
      {selectedDebtId && (
        <NasiyaDetailModal debtId={selectedDebtId} onClose={() => setSelectedDebtId(null)} />
      )}
    </div>
  );
}
