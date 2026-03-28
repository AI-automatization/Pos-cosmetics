'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  AlertTriangle,
  BarChart2,
  CheckCircle,
  X,
} from 'lucide-react';
import { useDebts, useNasiyaSummary, usePayDebt } from '@/hooks/customers/useDebts';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { Debt, PayDebtDto } from '@/types/debt';

type FilterTab = 'all' | 'overdue' | 'current';

type PayMethod = 'CASH' | 'CARD' | 'TRANSFER';

function DebtStatusBadge({ status }: { status: Debt['status'] }) {
  const configs: Record<Debt['status'], { label: string; className: string }> = {
    CURRENT: { label: 'Joriy', className: 'bg-green-100 text-green-700' },
    OVERDUE_30: { label: '0–30 kun', className: 'bg-yellow-100 text-yellow-700' },
    OVERDUE_60: { label: '31–60 kun', className: 'bg-orange-100 text-orange-700' },
    OVERDUE_90: { label: '61–90 kun', className: 'bg-red-100 text-red-700' },
    OVERDUE_90PLUS: { label: '90+ kun', className: 'bg-red-200 text-red-800 font-semibold' },
  };
  const { label, className } = configs[status];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs', className)}>
      {label}
    </span>
  );
}

function QuickPayModal({ debt, onClose }: { debt: Debt; onClose: () => void }) {
  const [amount, setAmount] = useState(debt.remainingAmount);
  const [method, setMethod] = useState<PayMethod>('CASH');
  const { mutate: payDebt, isPending } = usePayDebt();

  const METHODS: { key: PayMethod; label: string }[] = [
    { key: 'CASH', label: 'Naqd' },
    { key: 'CARD', label: 'Karta' },
    { key: 'TRANSFER', label: 'O\'tkazma' },
  ];

  const handlePay = () => {
    const dto: PayDebtDto = { amount, method };
    payDebt({ debtId: debt.id, dto }, { onSuccess: onClose });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Qarz to'lash</h2>
            <p className="text-xs text-gray-400">
              {debt.customerName} · {debt.orderNumber ?? debt.orderId.slice(0, 8)}
            </p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="mb-4 rounded-xl bg-orange-50 px-4 py-3">
            <p className="text-xs text-orange-600">Qolgan qarz</p>
            <p className="text-xl font-bold text-orange-700">{formatPrice(debt.remainingAmount)}</p>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Miqdor</label>
            <input
              type="number"
              value={amount}
              min={1}
              max={debt.remainingAmount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-right text-base font-bold outline-none focus:border-blue-400"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(Math.round(debt.remainingAmount / 2))}
                className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 hover:bg-gray-50"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setAmount(debt.remainingAmount)}
                className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
              >
                To'liq
              </button>
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-gray-700">To'lov turi</p>
            <div className="flex gap-2">
              {METHODS.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMethod(m.key)}
                  className={cn(
                    'flex-1 rounded-lg border py-2 text-sm font-medium transition',
                    method === m.key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50',
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handlePay}
            disabled={isPending || amount <= 0}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
          >
            <CheckCircle className="h-4 w-4" />
            {isPending ? 'Saqlanmoqda...' : `${formatPrice(amount)} to'lash`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NasiyaPage() {
  const [tab, setTab] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

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

  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all', label: "Barchasi" },
    { key: 'overdue', label: "Muddati o'tgan" },
    { key: 'current', label: "Joriy" },
  ];

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nasiya boshqaruv</h1>
          <p className="mt-0.5 text-sm text-gray-500">Qarzlar va to'lovlar</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/customers"
            className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Xaridorlar
          </Link>
          <Link
            href="/nasiya/aging"
            className="flex items-center gap-1.5 rounded-lg border border-orange-300 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700 transition hover:bg-orange-100"
          >
            <BarChart2 className="h-4 w-4" />
            Aging hisobot
          </Link>
        </div>
      </div>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
            <p className="text-xs font-medium text-orange-600">Jami nasiya</p>
            <p className="mt-1 text-xl font-bold text-orange-700">{formatPrice(summary.totalDebt)}</p>
            <p className="mt-0.5 text-xs text-orange-500">{summary.totalCustomers} ta xaridor</p>
          </div>
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
              <p className="text-xs font-medium text-red-600">Muddati o'tgan</p>
            </div>
            <p className="mt-1 text-xl font-bold text-red-700">{formatPrice(summary.overdueDebt)}</p>
            <p className="mt-0.5 text-xs text-red-500">{summary.overdueCustomers} ta xaridor</p>
          </div>
          <div className="rounded-xl border border-green-200 bg-green-50 p-4">
            <p className="text-xs font-medium text-green-600">Bu oy yig'ilgan</p>
            <p className="mt-1 text-xl font-bold text-green-700">{formatPrice(summary.collectedThisMonth)}</p>
            <p className="mt-0.5 text-xs text-green-500">Joriy oy to'lovlar</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium transition',
                tab === t.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {t.label}
              {t.key === 'overdue' && summary && summary.overdueCustomers > 0 && (
                <span className="ml-1.5 rounded-full bg-red-100 px-1.5 py-0.5 text-xs font-medium text-red-600">
                  {summary.overdueCustomers}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Xaridor ism, telefon yoki buyurtma..."
            className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
        </div>
      </div>

      {/* Overdue alert banner */}
      {tab !== 'current' && summary && summary.overdueDebt > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertTriangle className="h-5 w-5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">
            <span className="font-semibold">{formatPrice(summary.overdueDebt)}</span> muddati o'tgan qarz
            bor — <span className="font-semibold">{summary.overdueCustomers} ta xaridor.</span>{' '}
            Darhol to'lov talab qiling!
          </p>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton variant="table" rows={6} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Xaridor</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Buyurtma</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Asl summa</th>
                <th className="px-4 py-3 text-right font-medium text-gray-600">Qolgan</th>
                <th className="px-4 py-3 text-left font-medium text-gray-600">Muddat</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
                <th className="px-4 py-3 text-center font-medium text-gray-600">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    {search || tab !== 'all'
                      ? 'Qidiruv bo\'yicha natija topilmadi'
                      : 'Faol qarzlar yo\'q'}
                  </td>
                </tr>
              ) : (
                filtered.map((debt) => (
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
                        {debt.orderNumber
                          ? `#${debt.orderNumber}`
                          : debt.orderId
                          ? `#${debt.orderId.slice(0, 8)}`
                          : '—'}
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
                      {new Date(debt.dueDate).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DebtStatusBadge status={debt.status} />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => setPayingDebt(debt)}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                      >
                        To'lash
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Pay modal */}
      {payingDebt && <QuickPayModal debt={payingDebt} onClose={() => setPayingDebt(null)} />}
    </div>
  );
}
