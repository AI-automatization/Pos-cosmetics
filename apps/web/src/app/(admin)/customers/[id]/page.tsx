'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCircle,
  Phone,
  CreditCard,
  ShoppingBag,
  AlertTriangle,
  ShieldOff,
  CheckCircle,
  X,
} from 'lucide-react';
import { useDebts, usePayDebt } from '@/hooks/customers/useDebts';
import { useCustomersList } from '@/hooks/customers/useDebts';
import { LoadingSkeleton } from '@/components/common/LoadingSkeleton';
import { formatPrice, cn } from '@/lib/utils';
import type { Debt, PayDebtDto } from '@/types/debt';

type PayMethod = 'CASH' | 'CARD' | 'TRANSFER';

function DebtAgeBadge({ status, ageDays }: { status: Debt['status']; ageDays: number }) {
  const configs: Record<Debt['status'], { label: string; className: string }> = {
    CURRENT: { label: 'Joriy', className: 'bg-green-100 text-green-700' },
    OVERDUE_30: { label: `${ageDays} kun`, className: 'bg-yellow-100 text-yellow-700' },
    OVERDUE_60: { label: `${ageDays} kun`, className: 'bg-orange-100 text-orange-700' },
    OVERDUE_90: { label: `${ageDays} kun`, className: 'bg-red-100 text-red-700' },
    OVERDUE_90PLUS: { label: `${ageDays} kun`, className: 'bg-red-200 text-red-800' },
  };
  const { label, className } = configs[status];
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', className)}>
      {label}
    </span>
  );
}

function PayDebtModal({
  debt,
  onClose,
}: {
  debt: Debt;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(debt.remainingAmount);
  const [method, setMethod] = useState<PayMethod>('CASH');
  const [note, setNote] = useState('');
  const { mutate: payDebt, isPending } = usePayDebt();

  const handlePay = () => {
    const dto: PayDebtDto = { amount, method, note: note || undefined };
    payDebt({ debtId: debt.id, dto }, { onSuccess: onClose });
  };

  const METHODS: { key: PayMethod; label: string }[] = [
    { key: 'CASH', label: 'Naqd' },
    { key: 'CARD', label: 'Karta' },
    { key: 'TRANSFER', label: 'O\'tkazma' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Qarz to'lash</h2>
            <p className="text-xs text-gray-400">{debt.customerName} · {debt.orderNumber ?? `#${(debt.orderId ?? '').slice(0, 8)}`}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {/* Remaining */}
          <div className="mb-4 rounded-xl bg-orange-50 px-4 py-3">
            <p className="text-xs text-orange-600">Qolgan qarz</p>
            <p className="text-xl font-bold text-orange-700">{formatPrice(debt.remainingAmount)}</p>
          </div>

          {/* Amount */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              To'lov miqdori
            </label>
            <input
              type="number"
              value={amount}
              min={1}
              max={debt.remainingAmount}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-right text-base font-bold outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
            />
            <div className="mt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setAmount(Math.round(debt.remainingAmount * 0.5))}
                className="flex-1 rounded-lg border border-gray-200 py-1.5 text-xs text-gray-600 transition hover:bg-gray-50"
              >
                50%
              </button>
              <button
                type="button"
                onClick={() => setAmount(debt.remainingAmount)}
                className="flex-1 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
              >
                To'liq ({formatPrice(debt.remainingAmount)})
              </button>
            </div>
          </div>

          {/* Method */}
          <div className="mb-4">
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

          {/* Note */}
          <div className="mb-5">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Izoh (ixtiyoriy)
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="To'lov haqida qo'shimcha ma'lumot..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none transition focus:border-blue-400"
            />
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

export default function CustomerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

  const { data: customers, isLoading: loadingCustomer } = useCustomersList();
  const { data: debts, isLoading: loadingDebts } = useDebts({ customerId: id });

  const customer = customers?.find((c) => c.id === id);

  if (loadingCustomer) return <LoadingSkeleton variant="table" rows={4} />;

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12">
        <p className="text-gray-500">Xaridor topilmadi</p>
        <Link
          href="/customers"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          Orqaga
        </Link>
      </div>
    );
  }

  const activeDebts = debts?.filter((d) => d.remainingAmount > 0) ?? [];
  const totalRemaining = activeDebts.reduce((s, d) => s + d.remainingAmount, 0);

  return (
    <div className="flex flex-col gap-6 overflow-y-auto p-6">
      {/* Back */}
      <Link
        href="/customers"
        className="flex w-fit items-center gap-1.5 text-sm text-gray-500 transition hover:text-gray-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Xaridorlar ro'yxati
      </Link>

      {/* Customer info card */}
      <div
        className={cn(
          'rounded-2xl border p-6',
          customer.isBlocked
            ? 'border-red-200 bg-red-50'
            : customer.hasOverdue
            ? 'border-yellow-200 bg-yellow-50'
            : 'border-gray-200 bg-white',
        )}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
              <span className="text-xl font-bold text-gray-700">
                {customer.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-gray-900">{customer.name}</h1>
                {customer.isBlocked && (
                  <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    <ShieldOff className="h-3 w-3" />
                    Bloklangan
                  </span>
                )}
                {!customer.isBlocked && customer.hasOverdue && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                    <AlertTriangle className="h-3 w-3" />
                    Muddati o'tgan
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Phone className="h-3.5 w-3.5" />
                  +{customer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {customer.totalPurchases} ta xarid
                </span>
                <span className="flex items-center gap-1">
                  <UserCircle className="h-3.5 w-3.5" />
                  {customer.lastVisitAt
                    ? `So'nggi tashrif: ${new Date(customer.lastVisitAt).toLocaleDateString('uz-UZ')}`
                    : 'Hali tashrif yo\'q'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Debt stats */}
        <div className="mt-5 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white/80 p-4">
            <p className="text-xs text-gray-500">Joriy qarz</p>
            <p className={cn('mt-1 text-lg font-bold', customer.debtBalance > 0 ? 'text-orange-600' : 'text-green-600')}>
              {formatPrice(customer.debtBalance)}
            </p>
          </div>
          <div className="rounded-xl bg-white/80 p-4">
            <p className="text-xs text-gray-500">Qarz limiti</p>
            <p className="mt-1 text-lg font-bold text-gray-700">
              {formatPrice(customer.debtLimit)}
            </p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  customer.debtBalance > customer.debtLimit ? 'bg-red-500' : 'bg-blue-500',
                )}
                style={{
                  width: `${Math.min(100, (customer.debtBalance / customer.debtLimit) * 100)}%`,
                }}
              />
            </div>
          </div>
          <div className="rounded-xl bg-white/80 p-4">
            <p className="text-xs text-gray-500">Muddati o'tgan</p>
            <p className={cn('mt-1 text-lg font-bold', customer.overdueAmount > 0 ? 'text-red-600' : 'text-gray-400')}>
              {customer.overdueAmount > 0 ? formatPrice(customer.overdueAmount) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Active debts */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">
            Faol qarzlar
            {activeDebts.length > 0 && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                ({activeDebts.length} ta · jami {formatPrice(totalRemaining)})
              </span>
            )}
          </h2>
        </div>

        {loadingDebts ? (
          <LoadingSkeleton variant="table" rows={3} />
        ) : activeDebts.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-6 py-10 text-center">
            <CreditCard className="mx-auto mb-2 h-8 w-8 text-gray-300" />
            <p className="text-sm text-gray-400">Faol qarz yo'q</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Buyurtma</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Asl summa</th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600">Qolgan</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600">Muddat</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Yosh</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600">Amal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {activeDebts.map((debt) => (
                  <tr
                    key={debt.id}
                    className={cn(
                      'transition hover:bg-gray-50',
                      debt.status !== 'CURRENT' && 'bg-red-50/30',
                    )}
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">
                        {debt.orderNumber ?? `#${debt.orderId.slice(0, 8)}`}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(debt.createdAt).toLocaleDateString('uz-UZ')}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500">
                      {formatPrice(debt.originalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-orange-600">
                      {formatPrice(debt.remainingAmount)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(debt.dueDate).toLocaleDateString('uz-UZ')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <DebtAgeBadge status={debt.status} ageDays={debt.ageDays} />
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
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay debt modal */}
      {payingDebt && (
        <PayDebtModal debt={payingDebt} onClose={() => setPayingDebt(null)} />
      )}
    </div>
  );
}
