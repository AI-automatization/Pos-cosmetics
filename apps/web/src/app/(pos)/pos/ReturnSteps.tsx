'use client';

import { useEffect, useRef } from 'react';
import {
  Search, CheckSquare, Square,
  Banknote, CreditCard, CheckCircle2, AlertTriangle, Loader2, ChevronDown,
} from 'lucide-react';
import { cn, formatPrice } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { OrderItem } from '@/types/order';
import type { Return } from '@/types/returns';
import { REFUND_METHOD_KEYS } from '@/types/returns';

// ─── Step 1: Order lookup ─────────────────────────────────────────────────────

export function StepLookup({
  orderNumberInput, onChange, onSubmit, isLoading, error,
}: {
  orderNumberInput: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
}) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex flex-col gap-4 px-6 py-6">
      <p className="text-sm text-gray-500">{t('pos.returnEnterReceipt')}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            ref={inputRef}
            type="number"
            min="1"
            value={orderNumberInput}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
            placeholder={t('pos.returnReceiptPlaceholder')}
            className="w-full rounded-xl border border-gray-300 bg-white py-3 pl-9 pr-4 text-gray-900 placeholder-gray-400 text-lg font-mono outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
          />
        </div>
        <button
          type="button"
          onClick={onSubmit}
          disabled={isLoading || !orderNumberInput}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          {t('pos.returnStepSearch')}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}
    </div>
  );
}

// ─── Return reason select ─────────────────────────────────────────────────────

export function ReasonSelect({ reason, onChange }: { reason: string; onChange: (v: string) => void }) {
  const { t } = useTranslation();
  const RETURN_REASON_OPTIONS = [
    t('pos.returnReasonDefective'),
    t('pos.returnReasonMindChanged'),
    t('pos.returnReasonNoMoney'),
    t('pos.returnReasonExpired'),
    t('pos.returnReasonOther'),
  ];
  const otherLabel = t('pos.returnReasonOther');
  const presets = RETURN_REASON_OPTIONS.slice(0, -1);
  const isCustom = reason !== '' && reason !== '__custom__' && !presets.includes(reason);
  const selectedOption = presets.includes(reason) ? reason : (isCustom || reason === '__custom__') ? otherLabel : '';
  const showTextarea = selectedOption === otherLabel;
  const textareaValue = isCustom ? reason : '';

  function handleSelect(val: string) {
    if (val === otherLabel) onChange('__custom__');
    else onChange(val);
  }

  return (
    <div className="mt-3 space-y-2">
      <label className="block text-xs font-semibold text-gray-600">{t('pos.returnReason')}</label>
      <div className="relative">
        <select
          value={selectedOption}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-2.5 pr-10 text-sm text-gray-900 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 transition"
        >
          <option value="" disabled>{t('pos.returnReasonPlaceholder')}</option>
          {RETURN_REASON_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>
      {showTextarea && (
        <textarea
          value={textareaValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={t('pos.returnReasonCustomPlaceholder')}
          rows={2}
          autoFocus
          className="w-full rounded-xl border border-orange-300 bg-white px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 resize-none transition"
        />
      )}
    </div>
  );
}

// ─── Step 2: Item selection ───────────────────────────────────────────────────

export function StepItemSelect({
  items, selectedItems, onToggle, onSetQty, reason, onReasonChange, refundTotal, onBack, onProceed,
}: {
  items: OrderItem[];
  selectedItems: Record<string, { qty: number; maxQty: number }>;
  onToggle: (item: OrderItem) => void;
  onSetQty: (id: string, qty: number) => void;
  reason: string;
  onReasonChange: (v: string) => void;
  refundTotal: number;
  onBack: () => void;
  onProceed: () => void;
}) {
  const { t } = useTranslation();
  const hasSelected = Object.keys(selectedItems).length > 0;

  return (
    <>
      <div className="overflow-y-auto flex-1 px-5 py-4 space-y-2">
        {items.map((item) => {
          const sel = selectedItems[item.id];
          const isChecked = !!sel;
          return (
            <div
              key={item.id}
              onClick={() => onToggle(item)}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all',
                isChecked
                  ? 'border-orange-300 bg-orange-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50',
              )}
            >
              {isChecked
                ? <CheckSquare className="h-5 w-5 text-orange-500 shrink-0" />
                : <Square className="h-5 w-5 text-gray-300 shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                <p className="text-xs text-gray-400">{formatPrice(item.unitPrice)} × {item.quantity}</p>
              </div>
              {isChecked && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button type="button" onClick={() => onSetQty(item.id, sel.qty - 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm">−</button>
                  <input type="number" min={0.001} max={item.quantity} step={0.001} value={sel.qty} onChange={(e) => onSetQty(item.id, Number(e.target.value))} className="w-14 rounded-lg border border-gray-200 bg-white px-2 py-1 text-center text-sm text-gray-900 outline-none focus:border-orange-400" />
                  <button type="button" onClick={() => onSetQty(item.id, sel.qty + 1)} className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-sm">+</button>
                </div>
              )}
            </div>
          );
        })}
        <ReasonSelect reason={reason} onChange={onReasonChange} />
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex items-center justify-between rounded-b-2xl">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 transition">{t('common.back')}</button>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-gray-400">{t('pos.refundTotal')}</p>
            <span className="text-lg font-bold text-orange-500">{formatPrice(refundTotal)}</span>
          </div>
          <button type="button" onClick={onProceed} disabled={!hasSelected} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed">{t('pos.continue')}</button>
        </div>
      </div>
    </>
  );
}

// ─── Step 3: Refund method ────────────────────────────────────────────────────

export function StepMethodSelect({
  refundTotal, availableCash, isLoadingCash, isCashAllowed, refundMethod, onSetMethod, onBack, onProceed,
}: {
  refundTotal: number;
  availableCash: number | null;
  isLoadingCash: boolean;
  isCashAllowed: boolean;
  refundMethod: 'CASH' | 'TERMINAL' | null;
  onSetMethod: (m: 'CASH' | 'TERMINAL') => void;
  onBack: () => void;
  onProceed: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex-1 px-5 py-5 space-y-3 overflow-y-auto">
        <div onClick={() => isCashAllowed && onSetMethod('CASH')} className={cn('flex items-start gap-4 rounded-xl border-2 p-4 transition-all', !isCashAllowed ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed' : refundMethod === 'CASH' ? 'border-orange-400 bg-orange-50 cursor-pointer' : 'border-gray-200 bg-white cursor-pointer hover:border-orange-200 hover:bg-orange-50/30')}>
          <div className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition', refundMethod === 'CASH' && isCashAllowed ? 'border-orange-500 bg-orange-500' : 'border-gray-300')}>
            {refundMethod === 'CASH' && isCashAllowed && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-900">{t(REFUND_METHOD_KEYS.CASH)}</span>
            </div>
            {isLoadingCash ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400"><Loader2 className="h-3 w-3 animate-spin" />{t('pos.checkingCashBalance')}</p>
            ) : availableCash !== null ? (
              <p className={cn('mt-1 text-xs', isCashAllowed ? 'text-green-600' : 'text-red-500')}>
                {isCashAllowed ? t('pos.cashSufficient', { amount: formatPrice(availableCash) }) : t('pos.cashInsufficient', { amount: formatPrice(availableCash), required: formatPrice(refundTotal) })}
              </p>
            ) : null}
          </div>
        </div>
        <div onClick={() => onSetMethod('TERMINAL')} className={cn('flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition-all', refundMethod === 'TERMINAL' ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/30')}>
          <div className={cn('mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition', refundMethod === 'TERMINAL' ? 'border-blue-500 bg-blue-500' : 'border-gray-300')}>
            {refundMethod === 'TERMINAL' && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-blue-500" /><span className="font-semibold text-gray-900">{t(REFUND_METHOD_KEYS.TERMINAL)}</span></div>
            <p className="mt-1 text-xs text-gray-500">{t('pos.terminalRefundInfo')}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex items-center justify-between rounded-b-2xl">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 transition">{t('common.back')}</button>
        <button type="button" onClick={onProceed} disabled={!refundMethod} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed">{t('pos.confirmReturn')}</button>
      </div>
    </>
  );
}

// ─── Step 4: Confirm ──────────────────────────────────────────────────────────

export function StepConfirm({
  order, selectedItems, refundTotal, refundMethod, submitError, isSubmitting, onBack, onSubmit,
}: {
  order: { orderNumber: string | number };
  selectedItems: Record<string, { qty: number; productName: string; unitPrice: number }>;
  refundTotal: number;
  refundMethod: 'CASH' | 'TERMINAL';
  submitError: string | null;
  isSubmitting: boolean;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="overflow-y-auto flex-1 px-5 py-5 space-y-4">
        <div className="rounded-xl border border-gray-200 bg-white divide-y divide-gray-100 shadow-sm">
          <div className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-500">{t('pos.receiptNumber')}</span><span className="font-mono font-semibold text-gray-900">{order.orderNumber}</span></div>
          {Object.values(selectedItems).map((item) => (
            <div key={item.productName} className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-700 truncate max-w-[60%]">{item.productName}</span><span className="text-gray-900 font-medium">× {item.qty} = {formatPrice(item.unitPrice * item.qty)}</span></div>
          ))}
          <div className="flex justify-between px-4 py-3"><span className="text-sm text-gray-500">{t('pos.refundTotal')}</span><span className="text-base font-bold text-orange-500">{formatPrice(refundTotal)}</span></div>
          <div className="flex justify-between px-4 py-3 text-sm"><span className="text-gray-500">{t('pos.return')}</span><span className="font-medium text-gray-900">{t(REFUND_METHOD_KEYS[refundMethod])}</span></div>
        </div>
        {refundMethod === 'CASH' && (<div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3"><Banknote className="h-5 w-5 text-green-500 shrink-0" /><p className="text-sm text-green-700">{t('pos.giveCashToCustomer', { amount: formatPrice(refundTotal) })}</p></div>)}
        {refundMethod === 'TERMINAL' && (<div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3"><CreditCard className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" /><p className="text-sm text-blue-700">{t('pos.bankRefundInfo')}</p></div>)}
        {submitError && (<div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600"><AlertTriangle className="h-4 w-4 shrink-0" />{submitError}</div>)}
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex items-center justify-between rounded-b-2xl">
        <button type="button" onClick={onBack} className="text-sm text-gray-500 hover:text-gray-700 transition">{t('common.back')}</button>
        <button type="button" onClick={onSubmit} disabled={isSubmitting} className="flex items-center gap-2 rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? t('pos.processing') : t('pos.confirmReturn')}
        </button>
      </div>
    </>
  );
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────

export function StepSuccess({
  ret, refundTotal, refundMethod, onClose,
}: {
  ret: Return;
  refundTotal: number;
  refundMethod: 'CASH' | 'TERMINAL' | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-5">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100"><CheckCircle2 className="h-10 w-10 text-green-500" /></div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{formatPrice(refundTotal)}</p>
          <p className="text-sm text-gray-500 mt-1.5">{refundMethod === 'CASH' ? t('pos.returnCashGiven') : t('pos.returnBankCreated')}</p>
        </div>
        <p className="text-xs text-gray-400 font-mono">ID: {ret.id.slice(0, 8)}...</p>
      </div>
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-3 flex justify-center rounded-b-2xl">
        <button type="button" onClick={onClose} className="rounded-xl bg-orange-500 px-10 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600">{t('common.close')}</button>
      </div>
    </>
  );
}
