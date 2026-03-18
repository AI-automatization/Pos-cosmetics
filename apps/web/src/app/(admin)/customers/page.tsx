'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UserCircle,
  AlertTriangle,
  ShieldOff,
  TrendingUp,
  Search,
} from 'lucide-react';
import { useCustomersList } from '@/hooks/customers/useDebts';
import { useNasiyaSummary } from '@/hooks/customers/useDebts';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { CustomerWithDebt } from '@/types/debt';

function StatusBadge({ customer }: { customer: CustomerWithDebt }) {
  if (customer.isBlocked) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
        <ShieldOff className="h-3 w-3" />
        Bloklangan
      </span>
    );
  }
  if (customer.hasOverdue) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
        <AlertTriangle className="h-3 w-3" />
        Muddati o'tgan
      </span>
    );
  }
  if (customer.debtBalance > 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
        Nasiyada
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
      Toza
    </span>
  );
}

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const { data: customers, isLoading } = useCustomersList(search || undefined);
  const { data: summary } = useNasiyaSummary();

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Xaridorlar</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {customers ? `${customers.length} ta xaridor` : 'Yuklanmoqda...'}
          </p>
        </div>
        <Link
          href="/nasiya"
          className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          <TrendingUp className="h-4 w-4" />
          Nasiya boshqaruv
        </Link>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-4 gap-4">
          {[
            {
              label: 'Jami nasiya',
              value: formatPrice(summary.totalDebt),
              sub: `${summary.totalCustomers} ta xaridor`,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
            },
            {
              label: 'Muddati o\'tgan',
              value: formatPrice(summary.overdueDebt),
              sub: `${summary.overdueCustomers} ta xaridor`,
              color: 'text-red-600',
              bg: 'bg-red-50',
            },
            {
              label: 'Bu oy yig\'ilgan',
              value: formatPrice(summary.collectedThisMonth),
              sub: 'Jami to\'lovlar',
              color: 'text-green-600',
              bg: 'bg-green-50',
            },
            {
              label: 'Nasiya xaridorlar',
              value: summary.totalCustomers.toString(),
              sub: `${summary.overdueCustomers} ta muddati o'tgan`,
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

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Ism yoki telefon..."
          className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Xaridor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Telefon</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Jami qarz</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Limit</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">So'nggi tashrif</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {!customers || customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    <UserCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
                    {search ? 'Qidiruv bo\'yicha natija topilmadi' : 'Xaridorlar yo\'q'}
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
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
                            {customer.totalPurchases} ta xarid · {customer.activeDebtsCount} ta qarz
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-600">
                      +{customer.phone}
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
                        {customer.debtBalance > 0
                          ? formatPrice(customer.debtBalance)
                          : '—'}
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
                        Ko'rish
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
