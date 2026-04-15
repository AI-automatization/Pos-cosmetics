'use client';

import { useState, useEffect } from 'react';
import {
  Banknote,
  CreditCard,
  SplitSquareVertical,
  Check,
  Tag,
  UserCircle,
  AlertTriangle,
  ChevronRight,
  Star,
  CheckCircle2,
} from 'lucide-react';
import { useLoyaltyAccount, useLoyaltyConfig, pointsToMoney } from '@/hooks/customers/useLoyalty';
import { DEFAULT_LOYALTY_CONFIG } from '@/types/loyalty';
import { usePOSStore } from '@/store/pos.store';
import { useCompleteSale } from '@/hooks/pos/useCompleteSale';
import { useCurrentUser } from '@/hooks/auth/useAuth';
import { formatPrice, cn } from '@/lib/utils';
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

  // Split mode: which payment types are active
  const [splitEnabled, setSplitEnabled] = useState({
    cash: true, card: true, nasiya: false, bonus: false,
  });

  // Reset split state when switching away from split
  useEffect(() => {
    if (paymentMethod !== 'split') {
      setSplitEnabled({ cash: true, card: true, nasiya: false, bonus: false });
      setSplitNasiyaAmount(0);
      if (paymentMethod !== 'nasiya' && paymentMethod !== 'bonus') setBonusPoints(0);
    }
  }, [paymentMethod]);

  const { data: loyaltyAccount } = useLoyaltyAccount(
    (paymentMethod === 'bonus' || (paymentMethod === 'split' && splitEnabled.bonus))
      ? selectedCustomer?.id
      : null,
  );
  const { data: loyaltyConfig } = useLoyaltyConfig();
  const redeemRate = loyaltyConfig?.redeemRate ?? DEFAULT_LOYALTY_CONFIG.redeemRate;

  const { data: user } = useCurrentUser();
  const isCashier = user?.role === 'CASHIER';

  const { subtotal, discountAmount, total, change } = totals();
  const { mutate: completeSale, isPending, canComplete } = useCompleteSale(
    (order) => onSaleComplete(order, change),
  );

  const [discountInput, setDiscountInput] = useState(String(orderDiscount));
  const [discountType, setDiscountType] = useState<DiscountType>(orderDiscountType);

  const discountVal = parseFloat(discountInput) || 0;
  const discountPct = discountType === 'percent'
    ? discountVal
    : subtotal > 0 ? (discountVal / subtotal) * 100 : 0;
  const overLimit = isCashier && discountPct > 5;
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Sync local state when store resets after clearCart()
  useEffect(() => {
    setDiscountInput(String(orderDiscount));
    setDiscountType(orderDiscountType);
  }, [orderDiscount, orderDiscountType]);

  const handleDiscountApply = () => {
    const val = parseFloat(discountInput) || 0;
    setOrderDiscount(val, discountType);
  };

  const METHODS: { key: PaymentMethod; label: string; icon: React.ReactNode; shortcut: string }[] = [
    { key: 'cash', label: 'Naqd', icon: <Banknote className="h-4 w-4" />, shortcut: 'F5' },
    { key: 'card', label: 'Karta', icon: <CreditCard className="h-4 w-4" />, shortcut: 'F6' },
    { key: 'split', label: 'Aralash', icon: <SplitSquareVertical className="h-4 w-4" />, shortcut: 'F7' },
    { key: 'nasiya', label: 'Nasiya', icon: <UserCircle className="h-4 w-4" />, shortcut: 'F8' },
    { key: 'bonus', label: 'Bonuslar', icon: <Star className="h-4 w-4" />, shortcut: 'F9' },
  ];

  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <p className="text-sm text-gray-400">Savatcha bo'sh</p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Totals */}
      <div className="shrink-0 space-y-1 border-b border-gray-100 p-4">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Jami ({items.reduce((s, i) => s + i.quantity, 0)} ta)</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex items-center justify-between text-sm text-green-600">
            <span>Chegirma</span>
            <span>− {formatPrice(discountAmount)}</span>
          </div>
        )}
        <div className="flex items-center justify-between border-t border-gray-100 pt-2 text-lg font-bold text-gray-900">
          <span>TO'LOV</span>
          <span className="text-blue-600">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Discount */}
      <div className="shrink-0 border-b border-gray-100 p-3">
        <p className="mb-2 flex items-center gap-1 text-xs font-medium text-gray-500">
          <Tag className="h-3 w-3" /> Chegirma
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
              So'm
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
              ? '⚠️ Chegirma limitdan oshib ketdi (max 5%)'
              : '⚠️ Kassir uchun maksimal chegirma: 5%'}
          </p>
        )}
      </div>

      {/* Payment method — 2×2 grid */}
      <div className="shrink-0 border-b border-gray-100 p-3">
        <p className="mb-2 text-xs font-medium text-gray-500">To'lov turi</p>
        <div className="grid grid-cols-2 gap-1.5">
          {METHODS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => {
                setPaymentMethod(m.key);
                if (m.key !== 'nasiya' && m.key !== 'bonus') setSelectedCustomer(null);
              }}
              className={cn(
                'flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition',
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
              <span>{m.label}</span>
              <span className="text-gray-400">{m.shortcut}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Cash input — cash only mode */}
      {paymentMethod === 'cash' && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          <p className="mb-2 text-xs font-medium text-gray-500">Mijoz berdi</p>
          <input
            type="number"
            value={cashAmount || ''}
            onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
            placeholder={formatPrice(total)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right text-base font-bold text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
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
              Teng
            </button>
          </div>
          {change > 0 && (
            <div className="mt-2 rounded-lg bg-green-50 px-3 py-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-700">Qaytim:</span>
                <span className="font-bold text-green-700">{formatPrice(change)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── ARALASH (split) — 4-way payment ─── */}
      {paymentMethod === 'split' && (() => {
        const splitPaid = cashAmount + cardAmount + splitNasiyaAmount + bonusPoints * 100;
        const remaining = total - splitPaid;
        const needsCustomer = splitEnabled.nasiya || splitEnabled.bonus;
        return (
          <div className="shrink-0 overflow-y-auto border-b border-gray-100">
            {/* Toggle chips */}
            <div className="border-b border-gray-100 p-3">
              <p className="mb-2 text-xs font-medium text-gray-500">To&apos;lov usullarini tanlang</p>
              <div className="grid grid-cols-4 gap-1.5">
                {([
                  { key: 'cash' as const, label: 'Naqd', color: 'blue' },
                  { key: 'card' as const, label: 'Karta', color: 'blue' },
                  { key: 'bonus' as const, label: 'Bonus', color: 'violet' },
                  { key: 'nasiya' as const, label: 'Nasiya', color: 'orange' },
                ] as { key: keyof typeof splitEnabled; label: string; color: string }[]).map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => {
                      const next = { ...splitEnabled, [t.key]: !splitEnabled[t.key] };
                      setSplitEnabled(next);
                      if (!next[t.key]) {
                        if (t.key === 'cash') setCashAmount(0);
                        if (t.key === 'card') setCardAmount(0);
                        if (t.key === 'bonus') setBonusPoints(0);
                        if (t.key === 'nasiya') setSplitNasiyaAmount(0);
                      }
                    }}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-xl border py-2 text-[11px] font-medium transition',
                      splitEnabled[t.key]
                        ? t.color === 'violet'
                          ? 'border-violet-400 bg-violet-50 text-violet-700'
                          : t.color === 'orange'
                            ? 'border-orange-400 bg-orange-50 text-orange-700'
                            : 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50',
                    )}
                  >
                    {splitEnabled[t.key]
                      ? <CheckCircle2 className="h-3.5 w-3.5" />
                      : <span className="h-3.5 w-3.5 rounded-full border-2 border-current" />}
                    {t.label}
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
                    <button type="button" onClick={() => setShowCustomerModal(true)}
                      className="text-xs text-blue-600 hover:underline">O&apos;zgartirish</button>
                  </div>
                ) : (
                  <button type="button" onClick={() => setShowCustomerModal(true)}
                    className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 px-4 py-2.5 transition hover:border-blue-300 hover:bg-blue-50">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                      <UserCircle className="h-4 w-4" />
                      Xaridorni tanlang (Nasiya/Bonus uchun)
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </button>
                )}
              </div>
            )}

            {/* Cash input */}
            {splitEnabled.cash && (
              <div className="border-b border-gray-100 p-3">
                <p className="mb-1.5 text-xs font-medium text-gray-500">Naqd miqdori</p>
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
                <p className="mb-1.5 text-xs font-medium text-gray-500">Karta miqdori</p>
                <input type="number" value={cardAmount || ''} onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
                  placeholder={formatPrice(Math.max(0, remaining + cardAmount))}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-right text-sm font-bold text-gray-900 outline-none focus:border-blue-400" />
              </div>
            )}

            {/* Bonus input */}
            {splitEnabled.bonus && selectedCustomer && (
              <div className="border-b border-gray-100 p-3">
                <p className="mb-1.5 text-xs font-medium text-gray-500">
                  Bonuslar{loyaltyAccount ? ` (mavjud: ${loyaltyAccount.points} ball)` : ''}
                </p>
                <input type="number" value={bonusPoints || ''} min={0}
                  max={loyaltyAccount?.points ?? 0}
                  onChange={(e) => setBonusPoints(parseFloat(e.target.value) || 0)}
                  placeholder={String(Math.ceil(Math.max(0, remaining + bonusPoints * 100) / 100))}
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
                <p className="mb-1.5 text-xs font-medium text-gray-500">Nasiya miqdori</p>
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
                <><CheckCircle2 className="h-4 w-4" /> To&apos;liq qoplandi</>
              ) : remaining > 0 ? (
                <><AlertTriangle className="h-4 w-4" /> {formatPrice(remaining)} yetishmaydi</>
              ) : (
                <span>Ortiqcha: {formatPrice(-remaining)}</span>
              )}
            </div>
          </div>
        );
      })()}

      {/* Nasiya — customer selection */}
      {paymentMethod === 'nasiya' && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          {selectedCustomer ? (
            /* Customer selected — show info card */
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-500">+{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  O'zgartirish
                </button>
              </div>
              <div className="flex gap-2 text-xs">
                <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
                  <p className="text-gray-500">Joriy qarz</p>
                  <p className={cn('font-bold', selectedCustomer.debtBalance > 0 ? 'text-red-600' : 'text-green-600')}>
                    {formatPrice(selectedCustomer.debtBalance)}
                  </p>
                </div>
                <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
                  <p className="text-gray-500">Yangi qarz</p>
                  <p className="font-bold text-orange-700">{formatPrice(total)}</p>
                </div>
              </div>
              {selectedCustomer.hasOverdue && (
                <div className="mt-2 flex items-start gap-1.5 rounded-lg bg-yellow-100 px-2 py-1.5 text-xs text-yellow-700">
                  <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                  <span>Muddati o'tgan qarz: {formatPrice(selectedCustomer.overdueAmount)}</span>
                </div>
              )}
            </div>
          ) : (
            /* No customer — show select button */
            <button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-orange-300 bg-orange-50 px-4 py-3 transition hover:border-orange-400 hover:bg-orange-100"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-orange-700">
                <UserCircle className="h-5 w-5" />
                Xaridorni tanlang
              </div>
              <ChevronRight className="h-4 w-4 text-orange-400" />
            </button>
          )}
        </div>
      )}

      {/* Bonus payment panel */}
      {paymentMethod === 'bonus' && (
        <div className="shrink-0 border-b border-gray-100 p-3">
          {!selectedCustomer ? (
            <button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="flex w-full items-center justify-between rounded-xl border-2 border-dashed border-violet-300 bg-violet-50 px-4 py-3 transition hover:border-violet-400 hover:bg-violet-100"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-violet-700">
                <Star className="h-5 w-5" />
                Xaridorni tanlang
              </div>
              <ChevronRight className="h-4 w-4 text-violet-400" />
            </button>
          ) : (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-violet-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{selectedCustomer.name}</p>
                    <p className="text-xs text-gray-500">+{selectedCustomer.phone}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(true)}
                  className="text-xs text-blue-600 hover:underline"
                >
                  O'zgartirish
                </button>
              </div>
              {loyaltyAccount ? (
                <>
                  <div className="mb-2 flex gap-2 text-xs">
                    <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-gray-500">Mavjud bonuslar</p>
                      <p className="font-bold text-violet-700">
                        {loyaltyAccount.points} ball
                      </p>
                      <p className="text-gray-400">
                        ≈ {formatPrice(pointsToMoney(loyaltyAccount.points, redeemRate))}
                      </p>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/80 px-2 py-1.5">
                      <p className="text-gray-500">Sarflash</p>
                      <p className="font-bold text-violet-700">
                        {bonusPoints} ball
                      </p>
                      <p className="text-gray-400">
                        = {formatPrice(pointsToMoney(bonusPoints, redeemRate))}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="mb-1 text-xs font-medium text-gray-600">
                      Nechta ball sarflamoqchi? (kerak: {Math.ceil(total / 100)} ball)
                    </p>
                    <input
                      type="number"
                      value={bonusPoints || ''}
                      min={0}
                      max={loyaltyAccount.points}
                      onChange={(e) => setBonusPoints(parseFloat(e.target.value) || 0)}
                      placeholder={String(Math.ceil(total / 100))}
                      className="w-full rounded-lg border border-violet-200 px-3 py-1.5 text-right text-sm font-bold text-gray-900 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/20"
                    />
                    <div className="mt-1.5 flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBonusPoints(Math.ceil(total / 100))}
                        className="flex-1 rounded-lg border border-violet-200 bg-violet-100 py-1 text-xs font-medium text-violet-700 transition hover:bg-violet-200"
                      >
                        Kerakli: {Math.ceil(total / 100)} ball
                      </button>
                      <button
                        type="button"
                        onClick={() => setBonusPoints(loyaltyAccount.points)}
                        className="flex-1 rounded-lg border border-gray-200 py-1 text-xs text-gray-600 transition hover:bg-gray-50"
                      >
                        Hammasi: {loyaltyAccount.points}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-lg bg-white/80 px-3 py-2 text-xs text-gray-400 text-center">
                  Bonus hisobi topilmadi
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Complete button */}
      <div className="mt-auto shrink-0 p-3">
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
            'Saqlanmoqda...'
          ) : (
            <>
              <Check className="h-5 w-5" />
              {paymentMethod === 'nasiya'
                ? 'Nasiyaga berish'
                : paymentMethod === 'bonus'
                ? 'Bonuslar bilan to\'lash'
                : 'Sotuv yakunlash'}
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
