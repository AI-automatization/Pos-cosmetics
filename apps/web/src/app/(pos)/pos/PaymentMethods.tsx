'use client';

import { useMemo } from 'react';
import {
  Banknote,
  CreditCard,
  SplitSquareVertical,
  UserCircle,
  Star,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { PaymentMethod } from '@/types/sales';

interface PaymentMethodsProps {
  paymentMethod: PaymentMethod;
  hasCard: boolean;
  onSelect: (method: PaymentMethod) => void;
  onClearCustomer: () => void;
}

export function PaymentMethodButtons({
  paymentMethod,
  hasCard,
  onSelect,
  onClearCustomer,
}: PaymentMethodsProps) {
  const { t } = useTranslation();

  const METHODS = useMemo(() => {
    const methods: { key: PaymentMethod; label: string; icon: React.ReactNode; shortcut: string }[] = [
      { key: 'cash', label: t('pos.cashShort'), icon: <Banknote className="h-4 w-4" />, shortcut: 'F5' },
    ];
    if (hasCard) {
      methods.push({ key: 'card', label: t('pos.card'), icon: <CreditCard className="h-4 w-4" />, shortcut: 'F6' });
      methods.push({ key: 'split', label: t('pos.mixed'), icon: <SplitSquareVertical className="h-4 w-4" />, shortcut: 'F7' });
    }
    methods.push({ key: 'nasiya', label: t('pos.nasiya'), icon: <UserCircle className="h-4 w-4" />, shortcut: 'F8' });
    methods.push({ key: 'bonus', label: t('pos.bonuses'), icon: <Star className="h-4 w-4" />, shortcut: 'F9' });
    return methods;
  }, [hasCard, t]);

  return (
    <div className="shrink-0 border-b border-gray-100 p-3">
      <p className="mb-2 text-xs font-medium text-gray-500">{t('pos.paymentType')}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1">
        {METHODS.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => {
              onSelect(m.key);
              if (m.key !== 'nasiya' && m.key !== 'bonus') onClearCustomer();
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
  );
}

const QUICK_CASH = [5000, 10000, 20000, 50000, 100000];

interface CashInputProps {
  cashAmount: number;
  total: number;
  change: number;
  onSetCashAmount: (v: number) => void;
}

export function CashInputSection({ cashAmount, total, change, onSetCashAmount }: CashInputProps) {
  const { t } = useTranslation();
  return (
    <div className="shrink-0 border-b border-gray-100 p-3">
      <p className="mb-2 text-xs font-medium text-gray-500">{t('pos.customerPaid')}</p>
      <input
        type="text"
        inputMode="numeric"
        value={cashAmount || ''}
        onChange={(e) => {
          const raw = e.target.value.replace(/\s/g, '').replace(',', '.');
          if (/^\d*\.?\d*$/.test(raw)) onSetCashAmount(parseFloat(raw) || 0);
        }}
        placeholder={formatPrice(total)}
        className="w-full rounded-xl border border-gray-200 px-4 py-4 text-right text-xl font-bold text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20"
      />
      <div className="mt-2 flex flex-wrap gap-1">
        {QUICK_CASH.filter((v) => v >= total * 0.5).slice(0, 4).map((v) => (
          <button key={v} type="button" onClick={() => onSetCashAmount(v)}
            className="rounded-lg border border-gray-200 px-2 py-1 text-xs text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700">
            {(v / 1000).toFixed(0)}K
          </button>
        ))}
        <button type="button" onClick={() => onSetCashAmount(total)}
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
  );
}

interface CardInputProps {
  cardType: string;
  total: number;
  hasTerminal: boolean;
  hasPayme: boolean;
  hasClick: boolean;
  onSetCardType: (type: 'terminal' | 'payme' | 'click') => void;
}

export function CardInputSection({
  cardType,
  total,
  hasTerminal,
  hasPayme,
  hasClick,
  onSetCardType,
}: CardInputProps) {
  const { t } = useTranslation();
  const options = [
    ...(hasTerminal ? [{ key: 'terminal' as const, label: t('pos.terminal'), icon: '🏧' }] : []),
    ...(hasPayme ? [{ key: 'payme' as const, label: 'Payme', icon: '💳' }] : []),
    ...(hasClick ? [{ key: 'click' as const, label: 'Click', icon: '📱' }] : []),
  ];

  return (
    <div className="shrink-0 border-b border-gray-100 p-3">
      <p className="mb-2 text-xs font-medium text-gray-500">{t('pos.cardMethod')}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {options.map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => onSetCardType(m.key)}
            className={cn(
              'flex flex-col items-center gap-1 rounded-xl border py-3 text-sm font-medium transition',
              cardType === m.key
                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50',
            )}
          >
            <span className="text-lg">{m.icon}</span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>
      <div className="mt-3 rounded-xl bg-blue-50 border border-blue-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-blue-700">{t('pos.amountToPay')}</span>
          <span className="text-lg font-bold text-blue-700">{formatPrice(total)}</span>
        </div>
        {cardType === 'terminal' && (
          <p className="mt-1 text-xs text-blue-500">{t('pos.terminalHint')}</p>
        )}
        {(cardType === 'payme' || cardType === 'click') && (
          <p className="mt-1 text-xs text-blue-500">{t('pos.onlinePaymentHint')}</p>
        )}
      </div>
    </div>
  );
}
