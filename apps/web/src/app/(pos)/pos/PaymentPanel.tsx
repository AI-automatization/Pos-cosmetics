'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Banknote,
  CreditCard,
  SplitSquareVertical,
  Check,
  Tag,
  UserCircle,
  Star,
} from 'lucide-react';
import { HotkeysPanel } from './HotkeysPanel';
import { BonusSection } from './BonusSection';
import { SplitPaymentForm } from './SplitPaymentForm';
import { NasiyaCustomerSection } from './NasiyaCustomerSection';
import { useLoyaltyConfig } from '@/hooks/customers/useLoyalty';
import { DEFAULT_LOYALTY_CONFIG } from '@/types/loyalty';
import { useGlobalPromo } from '@/hooks/promotions/usePromotions';
import { usePOSStore } from '@/store/pos.store';
import { useCompleteSale } from '@/hooks/pos/useCompleteSale';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { formatPrice, cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import { CustomerSearchModal } from './CustomerSearchModal';
import type { Order } from '@/types/sales';
import type { PaymentMethod, DiscountType } from '@/types/sales';

interface PaymentPanelProps {
  onSaleComplete: (order: Order, change: number) => void;
}

const QUICK_CASH = [5000, 10000, 20000, 50000, 100000];

export function PaymentPanel({ onSaleComplete }: PaymentPanelProps) {
  const store = usePOSStore();
  const cart = store.carts[store.activeCartId];
  const { items, paymentMethod, cashAmount, cardAmount, orderDiscount, orderDiscountType, selectedCustomer, bonusPoints, splitNasiyaAmount } = cart;
  const { setPaymentMethod, setCashAmount, setCardAmount, setOrderDiscount, setSelectedCustomer, setBonusPoints, setSplitNasiyaAmount, totals } = store;

  // Reset bonus/nasiya amounts when leaving their payment methods
  useEffect(() => {
    if (paymentMethod !== 'split') {
      if (splitNasiyaAmount !== 0) setSplitNasiyaAmount(0);
      if (paymentMethod !== 'nasiya' && paymentMethod !== 'bonus' && bonusPoints !== 0) setBonusPoints(0);
    }
  }, [paymentMethod]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: loyaltyConfig } = useLoyaltyConfig();
  const redeemRate = loyaltyConfig?.redeemRate ?? DEFAULT_LOYALTY_CONFIG.redeemRate;

  const { data: user } = useCurrentUser();
  const isCashier = user?.role === 'CASHIER';
  const globalPromo = useGlobalPromo();
  const { t } = useTranslation();

  const { subtotal, discountAmount, total, change } = totals();
  const { mutate: completeSale, isPending, canComplete } = useCompleteSale(
    (order) => onSaleComplete(order, change),
  );

  const [discountInput, setDiscountInput] = useState(String(orderDiscount));
  const [discountType, setDiscountType] = useState<DiscountType>(orderDiscountType);
  // Ref so we can read latest globalPromo inside effect without adding it to deps
  const globalPromoRef = useRef(globalPromo);
  globalPromoRef.current = globalPromo;

  const discountVal = parseFloat(discountInput) || 0;
  const discountPct = discountType === 'percent'
    ? discountVal
    : subtotal > 0 ? (discountVal / subtotal) * 100 : 0;
  const overLimit = isCashier && discountPct > 5;
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Sync local state when store resets after clearCart().
  // Also auto-applies an active global PERCENT/FIXED promo when discount is 0.
  useEffect(() => {
    const promo = globalPromoRef.current;
    if (promo && orderDiscount === 0) {
      const rules = promo.rules as Record<string, number>;
      if (promo.type === 'PERCENT' && (rules.percent ?? 0) > 0) {
        const pct = rules.percent;
        setDiscountInput(String(pct));
        setDiscountType('percent');
        setOrderDiscount(pct, 'percent');
        return;
      }
      if (promo.type === 'FIXED' && (rules.amount ?? 0) > 0) {
        const amt = rules.amount;
        setDiscountInput(String(amt));
        setDiscountType('fixed');
        setOrderDiscount(amt, 'fixed');
        return;
      }
    }
    setDiscountInput(String(orderDiscount));
    setDiscountType(orderDiscountType);
  }, [orderDiscount, orderDiscountType]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDiscountApply = () => {
    const val = parseFloat(discountInput) || 0;
    setOrderDiscount(val, discountType);
  };

  const METHODS: { key: PaymentMethod; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { key: 'cash', label: t('pos.cashShort'), icon: <Banknote className="h-4 w-4" />, shortcut: 'F5' },
    { key: 'card', label: t('pos.card'), icon: <CreditCard className="h-4 w-4" />, shortcut: 'F6' },
    { key: 'split', label: t('pos.mixed'), icon: <SplitSquareVertical className="h-4 w-4" />, shortcut: 'F7' },
    { key: 'nasiya', label: t('pos.nasiya'), icon: <UserCircle className="h-4 w-4" />, shortcut: 'F8' },
    { key: 'bonus', label: t('pos.bonuses'), icon: <Star className="h-4 w-4" />, shortcut: 'F9' },
  ];

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

      {/* Discount */}
      <div className="shrink-0 border-b border-gray-100 p-3">
        {/* Active global promotion banner */}
        {globalPromo && (
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-2.5 py-1.5">
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
        )}
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
          <Tag className="h-3 w-3" /> {t('pos.discount')}
        </p>
        <div className="flex gap-2">
          <div className="flex overflow-hidden rounded-lg border border-gray-200 text-xs">
            <button
              type="button"
              onClick={() => setDiscountType('percent')}
              className={cn(
                'px-2.5 py-1.5 transition',
                discountType === 'percent' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              %
            </button>
            <button
              type="button"
              onClick={() => setDiscountType('fixed')}
              className={cn(
                'px-2.5 py-1.5 transition',
                discountType === 'fixed' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50',
              )}
            >
              {t('pos.discountFixed')}
            </button>
          </div>
          <input
            type="number"
            value={discountInput}
            min={0}
            onChange={(e) => setDiscountInput(e.target.value)}
            onBlur={handleDiscountApply}
            onKeyDown={(e) => e.key === 'Enter' && handleDiscountApply()}
            placeholder="0"
            className={cn(
              'flex-1 rounded-lg border px-2 py-1.5 text-sm outline-none',
              overLimit ? 'border-red-400 bg-red-50 focus:border-red-500' : 'border-gray-200 focus:border-blue-400',
            )}
          />
        </div>
        {isCashier && (
          <p className={cn('mt-1.5 text-xs', overLimit ? 'font-medium text-red-600' : 'text-amber-600')}>
            {overLimit
              ? `⚠️ ${t('pos.discountLimitExceeded')}`
              : `⚠️ ${t('pos.maxDiscountWarning')}`}
          </p>
        )}
      </div>

      {/* Payment method — 2×2 grid */}
      <div className="shrink-0 border-b border-gray-100 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">{t('pos.paymentType')}</p>
        <div className="grid grid-cols-5 gap-1">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setPaymentMethod(m.key);
                if (m.key !== 'nasiya' && m.key !== 'bonus') setSelectedCustomer(null);
              }}
              className={cn(
                'flex flex-col items-center gap-0.5 rounded-lg border py-1.5 px-1 text-[10px] font-medium transition',
                paymentMethod === m.key
                  ? m.key === 'nasiya'
                    ? 'border-orange-400 bg-orange-50 text-orange-700'
                    : m.key === 'bonus'
                    ? 'border-violet-400 bg-violet-50 text-violet-700'
                    : 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {m.icon}
              <span className="truncate w-full text-center">{m.label}</span>
              <span className="text-gray-400 text-[9px]">{m.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable payment details area */}
      <div className="min-h-0 flex-1 overflow-y-auto">

      {/* Cash input — cash only mode */}
      {paymentMethod === 'cash' && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">{t('pos.customerPaid')}</p>
          <input
            type="text"
            inputMode="numeric"
            value={cashAmount || ''}
            onChange={(e) => {
              const raw = e.target.value.replace(/\s/g, '').replace(',', '.');
              if (/^\d*\.?\d*$/.test(raw)) setCashAmount(parseFloat(raw) || 0);
            }}
            placeholder={formatPrice(total)}
            className="w-full rounded-xl border border-gray-200 px-4 py-4 text-right text-xl font-bold text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {QUICK_CASH.filter((v) => v >= total * 0.5).slice(0, 4).map((v) => (
              <button key={v} type="button" onClick={() => setCashAmount(v)}
                className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
                {(v / 1000).toFixed(0)}K
              </button>
            ))}
            <button type="button" onClick={() => setCashAmount(total)}
              className="rounded-lg border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 transition hover:bg-blue-100">
              {t('pos.exact')}
            </button>
          </div>
          {change > 0 && (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">{t('pos.change')}:</span>
                <span className="font-bold text-green-700">{formatPrice(change)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ARALASH (split) — 4-way payment ─── */}
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

      {/* Nasiya — customer selection */}
      {paymentMethod === 'nasiya' && (
        <NasiyaCustomerSection
          selectedCustomer={selectedCustomer}
          total={total}
          onSelectCustomer={() => setShowCustomerModal(true)}
        />
      )}

      {/* Bonus payment panel */}
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

      </div>{/* end scrollable area */}

      {/* Hotkeys reference panel */}
      <HotkeysPanel />

      {/* Complete button */}
      <div className="shrink-0 border-t border-gray-100 p-3">
        <button
          type="button"
          onClick={() => completeSale()}
          disabled={!canComplete || isPending || overLimit}
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

      {/* Customer search modal */}
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
