'use client';

import { useState } from 'react';
import { X, CheckCircle } from 'lucide-react';
import { usePayDebt } from '@/hooks/customers/useDebts';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Debt, PayDebtDto } from '@/types/debt';

type PayMethod = 'CASH' | 'CARD' | 'TRANSFER';

interface Props {
  debt: Debt;
  onClose: () => void;
}

export function QuickPayModal({ debt, onClose }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState(debt.remainingAmount);
  const [method, setMethod] = useState<PayMethod>('CASH');
  const { mutate: payDebt, isPending } = usePayDebt();

  const METHODS: { key: PayMethod; label: string }[] = [
    { key: 'CASH', label: t('payments.cash') },
    { key: 'CARD', label: t('payments.card') },
    { key: 'TRANSFER', label: t('payments.bankTransfer') },
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
            <h2 className="text-base font-semibold text-gray-900">{t('nasiya.payDebtLabel')}</h2>
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
            <p className="text-xs text-orange-600">{t('nasiya.remainingDebt')}</p>
            <p className="text-xl font-bold text-orange-700">{formatPrice(debt.remainingAmount)}</p>
          </div>

          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">{t('common.quantity')}</label>
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
                {t('nasiya.fullyPaid')}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <p className="mb-2 text-sm font-medium text-gray-700">{t('payments.method')}</p>
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
            {isPending ? t('common.saving') : `${formatPrice(amount)} ${t('nasiya.pay')}`}
          </button>
        </div>
      </div>
    </div>
  );
}
