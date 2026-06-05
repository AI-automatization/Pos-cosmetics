'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  UserCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ShieldOff,
  TrendingUp,
  Plus,
} from 'lucide-react';
import { useCustomersList, useNasiyaSummary } from '@/hooks/customers/useDebts';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { formatPrice, cn, getField, compareSortValues } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { CustomerWithDebt } from '@/types/debt';
import { CustomerFormModal } from './CustomerFormModal';

function StatusBadge({ customer }: { customer: CustomerWithDebt }) {
  const { t } = useTranslation();
  if (customer.isBlocked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <ShieldOff className="h-3 w-3" />
        {t('customers.statusBlocked')}
      </span>
    );
  }
  if (customer.hasOverdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        <AlertTriangle className="h-3 w-3" />
        {t('nasiya.overdue')}
      </span>
    );
  }
  if (customer.debtBalance > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        {t('customers.statusInDebt')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      {t('customers.statusClean')}
    </span>
  );
}

export default function CustomersPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const { data: customers, isLoading } = useCustomersList(search || undefined);
  const { data: summary } = useNasiyaSummary();

  function toggleSort(field: string) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedCustomers = useMemo(() => {
    if (!sortField || !customers) return customers ?? [];
    return [...customers].sort((a, b) => {
      const aVal = getField(a, sortField as keyof CustomerWithDebt);
      const bVal = getField(b, sortField as keyof CustomerWithDebt);
      return compareSortValues(aVal, bVal, sortDir);
    });
  }, [customers, sortField, sortDir]);

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

  return (
    <div className="flex flex-col gap-4 sm:gap-6 h-full overflow-y-auto p-3 sm:p-6">
      {showCreate && <CustomerFormModal onClose={() => setShowCreate(false)} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{t('customers.title')}</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {customers ? `${customers.length} ${t('common.unit')}` : t('common.loading')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            {t('customers.addCustomer')}
          </button>
          <Link
            href="/nasiya"
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
          >
            <TrendingUp className="h-4 w-4" />
            {t('nasiya.management')}
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            {
              label: t('nasiya.totalDebt'),
              value: formatPrice(summary.totalDebt),
              sub: `${summary.totalCustomers} ${t('common.unit')}`,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
            {
              label: t('nasiya.overdue'),
              value: formatPrice(summary.overdueDebt),
              sub: `${summary.overdueCustomers} ${t('common.unit')}`,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: t('nasiya.collectedThisMonth'),
              value: formatPrice(summary.collectedThisMonth),
              sub: t('payments.total'),
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: t('customers.totalCustomers'),
              value: summary.totalCustomers.toString(),
              sub: `${summary.overdueCustomers} ${t('customers.overdueCount')}`,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
            },
          ].map((card) => (
            <div
              key={card.label}
              className={cn('rounded-xl border border-gray-100 p-4', card.bg)}
            >
              <p className="text-xs font-medium text-gray-500">{card.label}</p>
              <p className={cn('mt-1 text-lg font-bold', card.color)}>{card.value}</p>
              <p className="mt-0.5 text-xs text-gray-500">{card.sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <ScrollableTable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder={t('customers.searchPlaceholder')}
        totalCount={customers?.length}
        isLoading={isLoading}
      >
        <table className="w-full text-sm">
          <thead className="sticky top-0 border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('customers.title')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('customers.phone')}</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">{t('common.branch')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                <SortHeader field="debtBalance" label={t('customers.totalDebt')} />
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">{t('customers.debtLimit')}</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('common.status')}</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                <SortHeader field="lastVisitAt" label={t('customers.lastVisit')} />
              </th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-500">{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedCustomers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  <UserCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                  {search ? t('common.noSearchResults') : t('customers.empty')}
                </td>
              </tr>
            ) : (
              sortedCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className={cn(
                    'transition hover:bg-gray-50',
                    customer.isBlocked && 'bg-red-50/40',
                    !customer.isBlocked && customer.hasOverdue && 'bg-yellow-50/30',
                  )}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                        <span className="text-xs font-semibold text-gray-600">
                          {customer.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-xs text-gray-400">
                          {t('customers.purchaseCount', { count: customer.totalPurchases })} · {t('customers.debtCount', { count: customer.activeDebtsCount })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {customer.phone ? `+${customer.phone}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {customer.branch?.name ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className={cn(
                        'font-semibold',
                        customer.debtBalance > customer.debtLimit
                          ? 'text-red-600'
                          : customer.debtBalance > 0
                          ? 'text-orange-600'
                          : 'text-gray-500',
                      )}
                    >
                      {customer.debtBalance > 0 ? formatPrice(customer.debtBalance) : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-gray-500">
                    {formatPrice(customer.debtLimit)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <StatusBadge customer={customer} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-gray-500">
                    {customer.lastVisitAt
                      ? new Date(customer.lastVisitAt).toLocaleDateString('uz-UZ')
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Link
                      href={`/customers/${customer.id}`}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {t('common.show')}
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </ScrollableTable>
    </div>
  );
}
