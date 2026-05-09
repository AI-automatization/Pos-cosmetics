'use client';

import { Star, ChevronRight } from 'lucide-react';
import { useLoyaltyAccount, pointsToMoney } from '@/hooks/customers/useLoyalty';
import { formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Customer } from '@/types/customer';

interface Props {
  selectedCustomer: Customer | null;
  bonusPoints: number;
  redeemRate: number;
  total: number;
  onSelectCustomer: () => void;
  onChangeCustomer: () => void;
  onSetBonusPoints: (points: number) => void;
}

export function BonusSection({
  selectedCustomer,
  bonusPoints,
  redeemRate,
  total,
  onSelectCustomer,
  onChangeCustomer,
  onSetBonusPoints,
}: Props) {
  const { t } = useTranslation();
  const { data: loyaltyAccount } = useLoyaltyAccount(selectedCustomer?.id ?? null);

  if (!selectedCustomer) {
    return (
      <div className="shrink-0 border-b border-gray-100 p-3">
        <button
          type="button"
          onClick={onSelectCustomer}
          className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 py-3 transition hover:border-violet-400 hover:bg-violet-100"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
            <Star className="h-5 w-5" />
            {t('pos.selectCustomer')}
          </div>
          <ChevronRight className="h-4 w-4 text-violet-400" />
        </button>
      </div>
    );
  }

  return (
    <div className="shrink-0 border-b border-gray-100 p-3">
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-violet-600" />
            <div>
              <p className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</p>
              <p className="text-xs text-gray-500">+{selectedCustomer.phone}</p>
            </div>
          </div>
          <button type="button" onClick={onChangeCustomer} className="text-xs text-blue-600 hover:underline">
            {t('pos.changeCustomer')}
          </button>
        </div>

        {loyaltyAccount ? (
          <>
            <div className="mb-2 flex gap-2 text-xs">
              <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
                <p className="text-gray-500">{t('pos.availablePoints')}</p>
                <p className="font-bold text-violet-700">{loyaltyAccount.points} ball</p>
                <p className="text-gray-400">≈ {formatPrice(pointsToMoney(loyaltyAccount.points, redeemRate))}</p>
              </div>
              <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
                <p className="text-gray-500">{t('pos.spendPoints')}</p>
                <p className="font-bold text-violet-700">{bonusPoints} ball</p>
                <p className="text-gray-400">= {formatPrice(pointsToMoney(bonusPoints, redeemRate))}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-gray-600">
                {t('pos.bonusSpendPrompt')} ({t('pos.bonusRequired', { count: Math.ceil(total / redeemRate) })})
              </p>
              <input
                type="number"
                value={bonusPoints || ''}
                min={0}
                max={loyaltyAccount.points}
                onChange={(e) => onSetBonusPoints(parseFloat(e.target.value) || 0)}
                placeholder={String(Math.ceil(total / redeemRate))}
                className="w-full rounded-lg border border-violet-200 px-3 py-1.5 text-right text-sm font-bold text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
              />
              <div className="mt-1.5 flex gap-1.5">
                <button
                  type="button"
                  onClick={() => onSetBonusPoints(Math.ceil(total / redeemRate))}
                  className="flex-1 rounded-lg border border-violet-200 bg-violet-100 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-200"
                >
                  {t('pos.bonusRequired', { count: Math.ceil(total / redeemRate) })}
                </button>
                <button
                  type="button"
                  onClick={() => onSetBonusPoints(loyaltyAccount.points)}
                  className="flex-1 rounded-lg border border-gray-200 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
                >
                  {t('pos.bonusAll', { count: loyaltyAccount.points })}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-lg bg-white/80 px-3 py-2 text-xs text-gray-400 text-center">
            {t('pos.noBonusAccount')}
          </div>
        )}
      </div>
    </div>
  );
}
