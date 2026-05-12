'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle2, UserCircle, ChevronRight } from 'lucide-react';
import { useLoyaltyAccount } from '@/hooks/customers/useLoyalty';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Customer } from '@/types/customer';

const QUICK_CASH = [5000, 10000, 20000, 50000, 100000];

interface SplitPaymentFormProps {
  total: number;
  cashAmount: number;
  cardAmount: number;
  bonusPoints: number;
  splitNasiyaAmount: number;
  redeemRate: number;
  selectedCustomer: Customer | null;
  setCashAmount: (v: number) => void;
  setCardAmount: (v: number) => void;
  setBonusPoints: (v: number) => void;
  setSplitNasiyaAmount: (v: number) => void;
  onSelectCustomer: () => void;
}

export function SplitPaymentForm({
  total,
  cashAmount,
  cardAmount,
  bonusPoints,
  splitNasiyaAmount,
  redeemRate,
  selectedCustomer,
  setCashAmount,
  setCardAmount,
  setBonusPoints,
  setSplitNasiyaAmount,
  onSelectCustomer,
}: SplitPaymentFormProps) {
  const { t } = useTranslation();
  const [splitEnabled, setSplitEnabled] = useState({
    cash: true, card: true, nasiya: false, bonus: false,
  });

  // Reset amounts when a split type is disabled
  useEffect(() => {
    if (!splitEnabled.bonus && bonusPoints !== 0) setBonusPoints(0);
    if (!splitEnabled.nasiya && splitNasiyaAmount !== 0) setSplitNasiyaAmount(0);
    if (!splitEnabled.cash && cashAmount !== 0) setCashAmount(0);
    if (!splitEnabled.card && cardAmount !== 0) setCardAmount(0);
  }, [splitEnabled]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: loyaltyAccount } = useLoyaltyAccount(
    splitEnabled.bonus ? selectedCustomer?.id ?? null : null,
  );

  const splitPaid = cashAmount + cardAmount + splitNasiyaAmount + bonusPoints * redeemRate;
  const remaining = total - splitPaid;
  const needsCustomer = splitEnabled.nasiya || splitEnabled.bonus;

  return (
    <div className="shrink-0 overflow-y-auto border-b border-gray-100">
      {/* Toggle chips */}
      <div className="border-b border-gray-100 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">{t('pos.selectPaymentMethods')}</p>
        <div className="grid grid-cols-4 gap-1.5">
          {([
            { key: 'cash' as const, label: t('pos.cashShort'), color: 'blue' },
            { key: 'card' as const, label: t('pos.card'), color: 'blue' },
            { key: 'bonus' as const, label: t('pos.bonuses'), color: 'violet' },
            { key: 'nasiya' as const, label: t('pos.nasiya'), color: 'orange' },
          ] as { key: keyof typeof splitEnabled; label: string; color: string }[]).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => {
                const next = { ...splitEnabled, [item.key]: !splitEnabled[item.key] };
                setSplitEnabled(next);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-xl border py-2 text-[11px] font-medium transition',
                splitEnabled[item.key]
                  ? item.color === 'violet'
                    ? 'border-violet-400 bg-violet-50 text-violet-700'
                    : item.color === 'orange'
                      ? 'border-orange-400 bg-orange-50 text-orange-700'
                      : 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {splitEnabled[item.key]
                ? <CheckCircle2 className="h-3.5 w-3.5" />
                : <span className="h-3.5 w-3.5 rounded-full border-2 border-current" />}
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Customer selection (needed for nasiya or bonus) */}
      {needsCustomer && (
        <div className="border-b border-gray-100 p-3">
          {selectedCustomer ? (
            <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
              <div className="flex items-center gap-2">
                <UserCircle className="h-4 w-4 text-gray-500" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</p>
                  <p className="text-xs text-gray-400">+{selectedCustomer.phone}</p>
                </div>
              </div>
              <button type="button" onClick={onSelectCustomer}
                className="text-xs text-blue-600 hover:underline">{t('pos.changeCustomer')}</button>
            </div>
          ) : (
            <button type="button" onClick={onSelectCustomer}
              className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 transition hover:border-blue-300 hover:bg-blue-50">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                <UserCircle className="h-4 w-4" />
                {t('pos.selectCustomerForNasiyaBonus')}
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
      )}

      {/* Cash input */}
      {splitEnabled.cash && (
        <div className="border-b border-gray-100 p-3">
          <p className="mb-1.5 text-xs font-medium text-gray-500">{t('pos.cashAmount')}</p>
          <input type="number" value={cashAmount || ''} onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
            placeholder={formatPrice(Math.max(0, remaining + cashAmount))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-900 outline-none focus:border-blue-400" />
          <div className="mt-1.5 flex gap-1">
            {QUICK_CASH.filter((v) => v >= total * 0.2).slice(0, 3).map((v) => (
              <button key={v} type="button" onClick={() => setCashAmount(v)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-blue-50 hover:text-blue-700">
                {(v / 1000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Card input */}
      {splitEnabled.card && (
        <div className="border-b border-gray-100 p-3">
          <p className="mb-1.5 text-xs font-medium text-gray-500">{t('pos.cardAmount')}</p>
          <input type="number" value={cardAmount || ''} onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
            placeholder={formatPrice(Math.max(0, remaining + cardAmount))}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-900 outline-none focus:border-blue-400" />
        </div>
      )}

      {/* Bonus input */}
      {splitEnabled.bonus && selectedCustomer && (
        <div className="border-b border-gray-100 p-3">
          <p className="mb-1.5 text-xs font-medium text-gray-500">
            {t('pos.bonuses')}{loyaltyAccount ? ` (mavjud: ${loyaltyAccount.points} ball)` : ''}
          </p>
          <input type="number" value={bonusPoints || ''} min={0}
            max={loyaltyAccount?.points ?? 0}
            onChange={(e) => setBonusPoints(parseFloat(e.target.value) || 0)}
            placeholder={String(Math.ceil(Math.max(0, remaining + bonusPoints * redeemRate) / redeemRate))}
            className="w-full rounded-xl border border-violet-200 px-3 py-2 text-right text-sm font-bold text-gray-900 outline-none focus:border-violet-400" />
          {bonusPoints > 0 && (
            <p className="mt-1 text-right text-xs text-violet-600">
              = {formatPrice(bonusPoints * redeemRate)}
            </p>
          )}
        </div>
      )}

      {/* Nasiya input */}
      {splitEnabled.nasiya && selectedCustomer && (
        <div className="border-b border-gray-100 p-3">
          <p className="mb-1.5 text-xs font-medium text-gray-500">{t('pos.nasiyaAmount')}</p>
          <input type="number" value={splitNasiyaAmount || ''} onChange={(e) => setSplitNasiyaAmount(parseFloat(e.target.value) || 0)}
            placeholder={formatPrice(Math.max(0, remaining + splitNasiyaAmount))}
            className="w-full rounded-xl border border-orange-200 px-3 py-2 text-right text-sm font-bold text-gray-900 outline-none focus:border-orange-400" />
          {selectedCustomer.hasOverdue && (
            <div className="mt-1 flex items-center gap-1 text-xs text-yellow-700">
              <AlertTriangle className="h-3 w-3" />
              <span>Muddati o&apos;tgan qarz: {formatPrice(selectedCustomer.overdueAmount)}</span>
            </div>
          )}
        </div>
      )}

      {/* Remaining balance indicator */}
      <div className={cn(
        'p-3 flex items-center justify-between text-sm font-semibold',
        remaining === 0 ? 'text-green-700' : remaining > 0 ? 'text-red-600' : 'text-yellow-700',
      )}>
        {remaining === 0 ? (
          <><CheckCircle2 className="h-4 w-4" /> {t('pos.fullyCovered')}</>
        ) : remaining > 0 ? (
          <><AlertTriangle className="h-4 w-4" /> {t('pos.splitShortfall', { amount: formatPrice(remaining) })}</>
        ) : (
          <span>{t('pos.splitExcess', { amount: formatPrice(-remaining) })}</span>
        )}
      </div>
    </div>
  );
}
