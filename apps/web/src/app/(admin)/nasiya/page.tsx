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
  X,
} from 'lucide-react';
import { useDebts, useDebtDetail, useNasiyaSummary, usePayDebt } from '@/hooks/customers/useDebts';
import { ScrollableTable } from '@/components/ui/ScrollableTable';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { Debt, DebtPayment, PayDebtDto } from '@/types/debt';


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

// Backend detail shape (includes order items and full payment history)
interface DebtDetail {
  id: string;
  customerId: string;
  orderId?: string | null;
  totalAmount: number | string;
  paidAmount: number | string;
  remaining: number | string;
  dueDate?: string | null;
  status: string;
  notes?: string | null;
  createdAt: string;
  customer?: { id: string; name: string; phone: string };
  payments: DebtPayment[];
  order?: {
    id: string;
    orderNumber?: string | number | null;
    total: number | string;
    createdAt: string;
    items: {
      id: string;
      quantity: number;
      unitPrice: number | string;
      productName?: string | null;
      product?: { name: string } | null;
    }[];
  } | null;
}

const METHOD_LABELS: Record<string, string> = {
  CASH: 'Naqd',
  CARD: 'Karta',
  TERMINAL: 'Karta',
  TRANSFER: "O'tkazma",
};

function NasiyaDetailModal({ debtId, onClose }: { debtId: string; onClose: () => void }) {
  const { data, isLoading } = useDebtDetail(debtId);
  const detail = data as DebtDetail | undefined;

  const overdueDays = detail?.dueDate
    ? Math.max(0, Math.floor((Date.now() - new Date(detail.dueDate).getTime()) / 86400000))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 flex w-full max-w-2xl flex-col rounded-xl bg-white shadow-2xl max-h-[85vh]">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Nasiya tafsiloti</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {isLoading ? (
            <LoadingSkeleton variant="table" rows={4} />
          ) : detail ? (
            <>
              {/* Customer info */}
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Xaridor</p>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{detail.customer?.name ?? '—'}</p>
                    <p className="mt-0.5 font-mono text-sm text-gray-500">+{detail.customer?.phone ?? '—'}</p>
                  </div>
                  <DebtStatusBadge
                    status={
                      detail.status === 'OVERDUE' && overdueDays > 90
                        ? 'OVERDUE_90PLUS'
                        : detail.status === 'OVERDUE' && overdueDays > 60
                        ? 'OVERDUE_90'
                        : detail.status === 'OVERDUE' && overdueDays > 30
                        ? 'OVERDUE_60'
                        : detail.status === 'OVERDUE'
                        ? 'OVERDUE_30'
                        : 'CURRENT'
                    }
                  />
                </div>
              </div>

              {/* Debt amounts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-gray-100 bg-white p-3 text-center">
                  <p className="text-xs text-gray-400">Asl summa</p>
                  <p className="mt-1 font-bold text-gray-900">{formatPrice(Number(detail.totalAmount))}</p>
                </div>
                <div className="rounded-xl border border-green-100 bg-green-50 p-3 text-center">
                  <p className="text-xs text-green-600">To'langan</p>
                  <p className="mt-1 font-bold text-green-700">{formatPrice(Number(detail.paidAmount))}</p>
                </div>
                <div className="rounded-xl border border-orange-100 bg-orange-50 p-3 text-center">
                  <p className="text-xs text-orange-600">Qolgan qarz</p>
                  <p className="mt-1 font-bold text-orange-700">{formatPrice(Number(detail.remaining))}</p>
                </div>
              </div>

              {/* Due date + overdue */}
              {detail.dueDate && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">Muddat:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(detail.dueDate).toLocaleDateString('uz-UZ')}
                  </span>
                  {overdueDays > 0 && (
                    <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                      {overdueDays} kun kechikkan
                    </span>
                  )}
                </div>
              )}

              {/* Order info */}
              {detail.order && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Buyurtma</p>
                  <div className="rounded-xl border border-gray-100 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-medium text-gray-900">
                        #{detail.order.orderNumber ?? detail.order.id.slice(0, 8)}
                      </p>
                      <p className="text-sm text-gray-400">
                        {new Date(detail.order.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </div>
                    {detail.order.items.length > 0 && (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-100 text-left">
                            <th className="pb-2 font-medium text-gray-500">Mahsulot</th>
                            <th className="pb-2 text-center font-medium text-gray-500">Miqdor</th>
                            <th className="pb-2 text-right font-medium text-gray-500">Narx</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {detail.order.items.map((item) => (
                            <tr key={item.id}>
                              <td className="py-1.5 text-gray-900">
                                {item.productName ?? item.product?.name ?? '—'}
                              </td>
                              <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                              <td className="py-1.5 text-right text-gray-900">
                                {formatPrice(Number(item.unitPrice))}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* Payment history */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
                  To'lov tarixi ({detail.payments.length})
                </p>
                {detail.payments.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
                    To'lovlar mavjud emas
                  </p>
                ) : (
                  <div className="rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100 text-left">
                          <th className="px-4 py-2 font-medium text-gray-500">Sana</th>
                          <th className="px-4 py-2 text-center font-medium text-gray-500">Tur</th>
                          <th className="px-4 py-2 text-right font-medium text-gray-500">Miqdor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {detail.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="px-4 py-2 text-gray-600">
                              {new Date(p.createdAt).toLocaleDateString('uz-UZ')}
                            </td>
                            <td className="px-4 py-2 text-center">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-700">
                                {METHOD_LABELS[p.method] ?? p.method}
                              </span>
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-green-700">
                              +{formatPrice(p.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="py-10 text-center text-sm text-gray-400">Ma'lumot topilmadi</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NasiyaPage() {
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
    { key: 'all', label: "Barchasi" },
    { key: 'overdue', label: "Muddati o'tgan" },
    { key: 'current', label: "Joriy" },
  ];

  return (
    <div className="h-full flex flex-col gap-6 overflow-y-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Nasiya boshqaruvi</h1>
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

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg border border-gray-200 bg-gray-50 p-1 w-fit">
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
      <ScrollableTable
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Xaridor ism, telefon yoki buyurtma..."
        totalCount={filtered.length}
        isLoading={isLoading}
      >
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Xaridor</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Buyurtma</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">Asl summa</th>
              <th className="px-4 py-3 text-right font-medium text-gray-600">
                <SortHeader field="remainingAmount" label="Qolgan" />
              </th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">
                <SortHeader field="dueDate" label="Muddat" />
              </th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Holat</th>
              <th className="px-4 py-3 text-center font-medium text-gray-600">Amal</th>
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
                          ? 'Qidiruv bo\'yicha natija topilmadi'
                          : 'Faol qarzlar yo\'q'}
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
                      {new Date(debt.dueDate).toLocaleDateString('uz-UZ')}
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
                          title="Ko'rish"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setPayingDebt(debt)}
                          className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-green-700"
                        >
                          To'lash
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
