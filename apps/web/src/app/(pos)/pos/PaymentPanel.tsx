'use client';

import { useState, useEffect } from 'react';
import { Check, Tag } from 'lucide-react';
import { HotkeysPanel } from './HotkeysPanel';
import { BonusSection } from './BonusSection';
import { SplitPaymentForm } from './SplitPaymentForm';
import { NasiyaCustomerSection } from './NasiyaCustomerSection';
import { PaymentMethodButtons, CashInputSection, CardInputSection } from './PaymentMethods';
import { useLoyaltyConfig } from '@/hooks/customers/useLoyalty';
import { DEFAULT_LOYALTY_CONFIG } from '@/types/loyalty';
import { useGlobalPromo } from '@/hooks/promotions/usePromotions';
import { usePOSStore } from '@/store/pos.store';
import { useCompleteSale } from '@/hooks/pos/useCompleteSale';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { CustomerSearchModal } from './CustomerSearchModal';
import { useActiveProviders } from '@/hooks/settings/usePaymentConfig';
import type { Order } from '@/types/sales';

interface PaymentPanelProps {
  onSaleComplete: (order: Order, change: number) => void;
}

export function PaymentPanel({ onSaleComplete }: PaymentPanelProps) {
  const { data: activeProviders } = useActiveProviders();
  const store = usePOSStore();
  const cart = store.carts[store.activeCartId];
  const { items, paymentMethod, cashAmount, cardAmount, selectedCustomer, bonusPoints, splitNasiyaAmount } = cart;
  const { setPaymentMethod, setCashAmount, setCardAmount, setCardType, setSelectedCustomer, setBonusPoints, setSplitNasiyaAmount, totals } = store;

  // Reset bonus/nasiya amounts when leaving their payment methods
  useEffect(() => {
    if (paymentMethod !== 'split') {
      if (splitNasiyaAmount !== 0) setSplitNasiyaAmount(0);
      if (paymentMethod !== 'nasiya' && paymentMethod !== 'bonus' && bonusPoints !== 0) setBonusPoints(0);
    }
  }, [paymentMethod]);

  const { data: loyaltyConfig } = useLoyaltyConfig();
  const redeemRate = loyaltyConfig?.redeemRate ?? DEFAULT_LOYALTY_CONFIG.redeemRate;

  const globalPromo = useGlobalPromo();
  const { t } = useTranslation();

  const { subtotal, discountAmount, total, change } = totals();
  const { mutate: completeSale, isPending, canComplete } = useCompleteSale(
    (order) => onSaleComplete(order, change),
  );

  const cardType = cart.cardType ?? 'terminal';
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Dynamic provider flags — show only configured methods
  const hasTerminal = activeProviders?.some((p) => p.provider === 'TERMINAL') ?? false;
  const hasPayme = activeProviders?.some((p) => p.provider === 'PAYME') ?? false;
  const hasClick = activeProviders?.some((p) => p.provider === 'CLICK') ?? false;
  const hasCard = hasTerminal || hasPayme || hasClick;

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-400">{t('pos.emptyCart')}</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Totals */}
      <div className="shrink-0 space-y-1 border-b border-gray-100 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{t('pos.total')} ({items.reduce((s, i) => s + i.quantity, 0)} ta)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>{t('pos.discount')}</span>
            <span>− {formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">
          <span>{t('pos.payment')}</span>
          <span className="text-blue-600">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Global promo banner (if active) */}
      {globalPromo && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
            <Tag className="h-3.5 w-3.5 shrink-0 text-red-600" />
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-red-700">
              {globalPromo.name}
            </span>
            <span className="shrink-0 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
              {globalPromo.type === 'PERCENT'
                ? `−${(globalPromo.rules as { percent: number }).percent ?? 0}%`
                : `−${formatPrice((globalPromo.rules as { amount: number }).amount ?? 0)}`}
            </span>
          </div>
        </div>
      )}

      {/* Payment method buttons */}
      <PaymentMethodButtons
        paymentMethod={paymentMethod}
        hasCard={hasCard}
        onSelect={setPaymentMethod}
        onClearCustomer={() => setSelectedCustomer(null)}
      />

      {/* Scrollable payment details area */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {paymentMethod === 'cash' && (
          <CashInputSection
            cashAmount={cashAmount}
            total={total}
            change={change}
            onSetCashAmount={setCashAmount}
          />
        )}

        {paymentMethod === 'card' && (
          <CardInputSection
            cardType={cardType}
            total={total}
            hasTerminal={hasTerminal}
            hasPayme={hasPayme}
            hasClick={hasClick}
            onSetCardType={setCardType}
          />
        )}

        {paymentMethod === 'split' && (
          <SplitPaymentForm
            total={total}
            cashAmount={cashAmount}
            cardAmount={cardAmount}
            bonusPoints={bonusPoints}
            splitNasiyaAmount={splitNasiyaAmount}
            redeemRate={redeemRate}
            selectedCustomer={selectedCustomer}
            setCashAmount={setCashAmount}
            setCardAmount={setCardAmount}
            setBonusPoints={setBonusPoints}
            setSplitNasiyaAmount={setSplitNasiyaAmount}
            onSelectCustomer={() => setShowCustomerModal(true)}
          />
        )}

        {paymentMethod === 'nasiya' && (
          <NasiyaCustomerSection
            selectedCustomer={selectedCustomer}
            total={total}
            onSelectCustomer={() => setShowCustomerModal(true)}
          />
        )}

        {paymentMethod === 'bonus' && (
          <BonusSection
            selectedCustomer={selectedCustomer}
            bonusPoints={bonusPoints}
            redeemRate={redeemRate}
            total={total}
            onSelectCustomer={() => setShowCustomerModal(true)}
            onChangeCustomer={() => setShowCustomerModal(true)}
            onSetBonusPoints={setBonusPoints}
          />
        )}
      </div>

      <HotkeysPanel />

      {/* Complete button */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        <button
          id="pos-complete-sale-btn"
          type="button"
          onClick={() => completeSale()}
          disabled={!canComplete || isPending}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl py-4 text-base font-bold transition',
            canComplete && !isPending
              ? paymentMethod === 'nasiya'
                ? 'bg-orange-500 text-white hover:bg-orange-600 active:scale-98 shadow-lg shadow-orange-200'
                : paymentMethod === 'bonus'
                ? 'bg-violet-600 text-white hover:bg-violet-700 active:scale-98 shadow-lg shadow-violet-200'
                : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-98 shadow-lg shadow-blue-200'
              : 'cursor-not-allowed bg-gray-100 text-gray-400',
          )}
        >
          {isPending ? (
            t('common.saving')
          ) : (
            <>
              <Check className="h-5 w-5" />
              {paymentMethod === 'nasiya'
                ? t('pos.giveNasiya')
                : paymentMethod === 'bonus'
                ? t('pos.payWithBonus')
                : t('pos.completeSale')}
              <span className={cn(
                'ml-1 rounded px-1.5 py-0.5 text-xs font-normal',
                paymentMethod === 'nasiya'
                  ? 'bg-orange-400'
                  : paymentMethod === 'bonus'
                  ? 'bg-violet-500'
                  : 'bg-blue-500',
              )}>
                F10
              </span>
            </>
          )}
        </button>
      </div>

      {showCustomerModal && (
        <CustomerSearchModal
          onSelect={(customer) => {
            setSelectedCustomer(customer);
            setShowCustomerModal(false);
          }}
          onClose={() => setShowCustomerModal(false)}
        />
      )}
    </div>
  );
}
