'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Search, CheckSquare, Square, RotateCcw, Banknote, CreditCard, CheckCircle2, AlertTriangle, Loader2, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import type { OrderItem } from '@/types/order';
import type { Return } from '@/types/returns';
import { REFUND_METHOD_LABELS } from '@/types/returns';
import { usePOSReturn } from '@/hooks/pos/usePOSReturn';
import { usePOSStore } from '@/store/pos.store';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReturnModalProps {
  onClose: () => void;
  onReturnComplete: (ret: Return) => void;
}

// ─── Overlay wrapper ──────────────────────────────────────────────────────────

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-lg rounded-2xl bg-gray-900 shadow-2xl border border-gray-700 flex flex-col max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

// ─── Step 1: Order lookup ─────────────────────────────────────────────────────

function StepLookup({
  orderNumberInput,
  onChange,
  onSubmit,
  isLoading,
  error,
  onClose,
}: {
  orderNumberInput: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  error: string | null;
  onClose: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/60 px-6 py-5">
        <div className="flex items-center gap-3 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600/20">
            <RotateCcw className="h-5 w-5 text-orange-400" />
          </div>
          <div>
            <h2 className="text-base font-bold">Mahsulot qaytarish</h2>
            <p className="text-xs text-gray-400">Chek raqami orqali qidirish</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-700 hover:text-white">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex items-start justify-center pt-16 px-6">
      <div className="w-full max-w-md space-y-4">
        <p className="text-sm text-gray-400">Chek raqamini kiriting yoki skanerlang</p>

        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              ref={inputRef}
              type="number"
              min="1"
              value={orderNumberInput}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSubmit(); }}
              placeholder="Chek №"
              className="w-full rounded-xl border border-gray-600 bg-gray-800 py-3 pl-9 pr-4 text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 text-lg font-mono"
            />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !orderNumberInput}
            className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Qidirish'}
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-900/30 border border-red-700/50 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
      </div>
    </>
  );
}

const RETURN_REASON_OPTIONS = [
  "Buzilgan tovar",
  "Mijoz fikri o'zgardi",
  "Pul yetmadi",
  "Muddati o'tgan",
  "Boshqa",
] as const;

// ─── Reason select sub-component ─────────────────────────────────────────────

function ReasonSelect({ reason, onChange }: { reason: string; onChange: (v: string) => void }) {
  const presets = RETURN_REASON_OPTIONS.slice(0, -1) as readonly string[];
  const isCustom = reason !== '' && reason !== '__custom__' && !presets.includes(reason);
  const selectedOption = presets.includes(reason) ? reason : (isCustom || reason === '__custom__') ? 'Boshqa' : '';
  const showTextarea = selectedOption === 'Boshqa';
  const textareaValue = isCustom ? reason : '';

  function handleSelect(val: string) {
    if (val === 'Boshqa') onChange('__custom__');
    else onChange(val);
  }

  return (
    <div className="mt-3 space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
        Qaytarish sababi
      </label>
      <div className="relative">
        <select
          value={selectedOption}
          onChange={(e) => handleSelect(e.target.value)}
          className="w-full appearance-none rounded-xl border border-gray-600 bg-gray-800 px-4 py-3 pr-10 text-sm text-white outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
        >
          <option value="" disabled>Sababni tanlang...</option>
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
          placeholder="Sababni kiriting..."
          rows={3}
          autoFocus
          className="w-full rounded-xl border border-orange-500/50 bg-gray-800 px-4 py-3 text-sm text-white placeholder-gray-500 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition"
        />
      )}
    </div>
  );
}

// ─── Step 2: Item selection ───────────────────────────────────────────────────

function StepItemSelect({
  items,
  selectedItems,
  onToggle,
  onSetQty,
  reason,
  onReasonChange,
  refundTotal,
  onBack,
  onProceed,
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
  const hasSelected = Object.keys(selectedItems).length > 0;

  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/60 px-6 py-5">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-400 transition hover:bg-gray-700 hover:text-white">
          ← Orqaga
        </button>
        <h2 className="text-base font-bold text-white">Qaytariladigan tovarlar</h2>
        <div className="w-20" />
      </div>

      <div className="overflow-y-auto flex-1 p-4">
      <div className="mx-auto max-w-2xl space-y-2">
        {items.map((item) => {
          const sel = selectedItems[item.id];
          const isChecked = !!sel;
          return (
            <div
              key={item.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition',
                isChecked
                  ? 'border-orange-600/60 bg-orange-900/20'
                  : 'border-gray-700 bg-gray-800 hover:border-gray-600',
              )}
              onClick={() => onToggle(item)}
            >
              {isChecked ? (
                <CheckSquare className="h-5 w-5 text-orange-400 shrink-0" />
              ) : (
                <Square className="h-5 w-5 text-gray-600 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.productName}</p>
                <p className="text-xs text-gray-400">
                  {formatPrice(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              {isChecked && (
                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onSetQty(item.id, sel.qty - 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-gray-600 text-sm font-bold"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0.001}
                    max={item.quantity}
                    step={0.001}
                    value={sel.qty}
                    onChange={(e) => onSetQty(item.id, Number(e.target.value))}
                    className="w-16 rounded-lg border border-gray-600 bg-gray-700 px-2 py-1 text-center text-sm text-white outline-none focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => onSetQty(item.id, sel.qty + 1)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-gray-700 text-white hover:bg-gray-600 text-sm font-bold"
                  >
                    +
                  </button>
                </div>
              )}
            </div>
          );
        })}

        <ReasonSelect reason={reason} onChange={onReasonChange} />
      </div>
      </div>

      <div className="border-t border-gray-700 bg-gray-800/60 px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Qaytarish summasi</p>
          <span className="text-2xl font-bold text-orange-400">{formatPrice(refundTotal)}</span>
        </div>
        <button
          type="button"
          onClick={onProceed}
          disabled={!hasSelected}
          className="rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Davom etish →
        </button>
      </div>
    </>
  );
}

// ─── Step 3: Refund method ────────────────────────────────────────────────────

function StepMethodSelect({
  refundTotal,
  availableCash,
  isLoadingCash,
  isCashAllowed,
  refundMethod,
  onSetMethod,
  onBack,
  onProceed,
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
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/60 px-6 py-5">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-400 transition hover:bg-gray-700 hover:text-white">
          ← Orqaga
        </button>
        <h2 className="text-base font-bold text-white">Qaytarish usuli</h2>
        <div className="w-20" />
      </div>

      <div className="flex-1 flex items-start justify-center pt-10 px-6">
      <div className="w-full max-w-lg space-y-3">
        {/* Cash option */}
        <div
          onClick={() => isCashAllowed && onSetMethod('CASH')}
          className={cn(
            'flex items-start gap-4 rounded-xl border-2 p-4 transition',
            !isCashAllowed
              ? 'border-gray-700 bg-gray-800/50 opacity-60 cursor-not-allowed'
              : refundMethod === 'CASH'
              ? 'border-orange-500 bg-orange-900/20 cursor-pointer'
              : 'border-gray-600 bg-gray-800 cursor-pointer hover:border-gray-500',
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
              refundMethod === 'CASH' && isCashAllowed
                ? 'border-orange-500 bg-orange-500'
                : 'border-gray-600',
            )}
          >
            {refundMethod === 'CASH' && isCashAllowed && (
              <div className="h-2 w-2 rounded-full bg-white" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Banknote className="h-5 w-5 text-green-400" />
              <span className="font-semibold text-white">{REFUND_METHOD_LABELS.CASH}</span>
            </div>
            {isLoadingCash ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" />
                Kassa balansi tekshirilmoqda...
              </p>
            ) : availableCash !== null ? (
              <p className={cn('mt-1 text-xs', isCashAllowed ? 'text-green-400' : 'text-red-400')}>
                {isCashAllowed
                  ? `Kassada: ${formatPrice(availableCash)} — yetarli`
                  : `Kassada: ${formatPrice(availableCash)} — yetarli emas (kerak: ${formatPrice(refundTotal)})`}
              </p>
            ) : null}
          </div>
        </div>

        {/* Terminal option */}
        <div
          onClick={() => onSetMethod('TERMINAL')}
          className={cn(
            'flex items-start gap-4 rounded-xl border-2 p-4 cursor-pointer transition',
            refundMethod === 'TERMINAL'
              ? 'border-blue-500 bg-blue-900/20'
              : 'border-gray-600 bg-gray-800 hover:border-gray-500',
          )}
        >
          <div
            className={cn(
              'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition',
              refundMethod === 'TERMINAL' ? 'border-blue-500 bg-blue-500' : 'border-gray-600',
            )}
          >
            {refundMethod === 'TERMINAL' && <div className="h-2 w-2 rounded-full bg-white" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-400" />
              <span className="font-semibold text-white">{REFUND_METHOD_LABELS.TERMINAL}</span>
            </div>
            <p className="mt-1 text-xs text-gray-400">Qaytarish 1–3 ish kuni ichida amalga oshiriladi</p>
          </div>
        </div>
      </div>
      </div>

      <div className="border-t border-gray-700 bg-gray-800/60 px-6 py-4 flex justify-end">
        <button
          type="button"
          onClick={onProceed}
          disabled={!refundMethod}
          className="rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Tasdiqlash →
        </button>
      </div>
    </>
  );
}

// ─── Step 4: Confirm ─────────────────────────────────────────────────────────

function StepConfirm({
  order,
  selectedItems,
  refundTotal,
  refundMethod,
  submitError,
  isSubmitting,
  onBack,
  onSubmit,
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
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/60 px-6 py-5">
        <button type="button" onClick={onBack} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-400 transition hover:bg-gray-700 hover:text-white">
          ← Orqaga
        </button>
        <h2 className="text-base font-bold text-white">Tasdiqlash</h2>
        <div className="w-20" />
      </div>

      <div className="overflow-y-auto flex-1 flex items-start justify-center pt-10 px-6">
      <div className="w-full max-w-lg space-y-4">
        <div className="rounded-xl border border-gray-700 bg-gray-800 divide-y divide-gray-700">
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-400">Chek №</span>
            <span className="font-mono text-white">{order.orderNumber}</span>
          </div>
          {Object.values(selectedItems).map((item) => (
            <div key={item.productName} className="flex justify-between px-4 py-3 text-sm">
              <span className="text-gray-300 truncate max-w-[60%]">{item.productName}</span>
              <span className="text-white">× {item.qty} = {formatPrice(item.unitPrice * item.qty)}</span>
            </div>
          ))}
          <div className="flex justify-between px-4 py-3">
            <span className="text-sm text-gray-400">Qaytarish summasi</span>
            <span className="text-base font-bold text-orange-400">{formatPrice(refundTotal)}</span>
          </div>
          <div className="flex justify-between px-4 py-3 text-sm">
            <span className="text-gray-400">Usul</span>
            <span className="text-white">{REFUND_METHOD_LABELS[refundMethod]}</span>
          </div>
        </div>

        {refundMethod === 'CASH' && (
          <div className="flex items-center gap-3 rounded-xl border border-green-700/50 bg-green-900/20 px-4 py-3">
            <Banknote className="h-5 w-5 text-green-400 shrink-0" />
            <p className="text-sm text-green-300">
              Mijozga <strong className="text-green-200">{formatPrice(refundTotal)}</strong> naqd pul bering
            </p>
          </div>
        )}

        {refundMethod === 'TERMINAL' && (
          <div className="flex items-start gap-3 rounded-xl border border-blue-700/50 bg-blue-900/20 px-4 py-3">
            <CreditCard className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-sm text-blue-300">
              Bank orqali qaytarish so'rovi yaratiladi. 1–3 ish kuni ichida mijoz kartasiga qaytariladi.
            </p>
          </div>
        )}

        {submitError && (
          <div className="flex items-start gap-2 rounded-xl border border-red-700/50 bg-red-900/20 px-4 py-3 text-sm text-red-400">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            {submitError}
          </div>
        )}
      </div>
      </div>

      <div className="border-t border-gray-700 bg-gray-800/60 px-6 py-4 flex justify-end">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex items-center gap-2 rounded-xl bg-orange-600 px-8 py-3 text-sm font-bold text-white transition hover:bg-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? 'Bajarilmoqda...' : 'Qaytarishni tasdiqlash'}
        </button>
      </div>
    </>
  );
}

// ─── Step 5: Success ──────────────────────────────────────────────────────────

function StepSuccess({
  ret,
  refundTotal,
  refundMethod,
  onClose,
}: {
  ret: Return;
  refundTotal: number;
  refundMethod: 'CASH' | 'TERMINAL' | null;
  onClose: () => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-800/60 px-6 py-5">
        <h2 className="text-base font-bold text-white">Qaytarish amalga oshirildi</h2>
        <div />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-8 gap-6">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-green-900/30 border-2 border-green-600">
          <CheckCircle2 className="h-12 w-12 text-green-400" />
        </div>

        <div className="text-center">
          <p className="text-3xl font-bold text-white">{formatPrice(refundTotal)}</p>
          <p className="text-sm text-gray-400 mt-2">
            {refundMethod === 'CASH'
              ? 'Naqd pul mijozga berildi'
              : 'Bank kartasi qaytarish so\'rovi yaratildi'}
          </p>
        </div>

        <p className="text-xs text-gray-600 font-mono">Qaytarish ID: {ret.id.slice(0, 8)}...</p>
      </div>

      <div className="border-t border-gray-700 bg-gray-800/60 px-6 py-4 flex justify-center">
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl bg-gray-700 px-12 py-3 text-sm font-bold text-white transition hover:bg-gray-600"
        >
          Yopish
        </button>
      </div>
    </>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function ReturnModal({ onClose, onReturnComplete }: ReturnModalProps) {
  const shiftId = usePOSStore((s) => s.shiftId);
  const {
    state,
    setOrderNumberInput,
    lookupOrder,
    isLookingUp,
    toggleItem,
    setQty,
    setReason,
    proceedToMethodSelect,
    setRefundMethod,
    isCashAllowed,
    isLoadingCash,
    proceedToConfirm,
    submitReturn,
    isSubmitting,
    goBack,
  } = usePOSReturn(shiftId);

  // When SUCCESS: notify parent
  useEffect(() => {
    if (state.step === 'SUCCESS' && state.createdReturn) {
      onReturnComplete(state.createdReturn);
    }
  }, [state.step, state.createdReturn, onReturnComplete]);

  return (
    <ModalOverlay onClose={onClose}>
      {state.step === 'LOOKUP' && (
        <StepLookup
          orderNumberInput={state.orderNumberInput}
          onChange={setOrderNumberInput}
          onSubmit={lookupOrder}
          isLoading={isLookingUp}
          error={state.lookupError}
          onClose={onClose}
        />
      )}

      {state.step === 'ITEM_SELECT' && state.order && (
        <StepItemSelect
          items={state.order.items}
          selectedItems={state.selectedItems}
          onToggle={toggleItem}
          onSetQty={setQty}
          reason={state.reason}
          onReasonChange={setReason}
          refundTotal={state.refundTotal}
          onBack={goBack}
          onProceed={proceedToMethodSelect}
        />
      )}

      {state.step === 'METHOD_SELECT' && (
        <StepMethodSelect
          refundTotal={state.refundTotal}
          availableCash={state.availableCash}
          isLoadingCash={isLoadingCash}
          isCashAllowed={isCashAllowed}
          refundMethod={state.refundMethod}
          onSetMethod={setRefundMethod}
          onBack={goBack}
          onProceed={proceedToConfirm}
        />
      )}

      {state.step === 'CONFIRM' && state.order && state.refundMethod && (
        <StepConfirm
          order={state.order}
          selectedItems={state.selectedItems}
          refundTotal={state.refundTotal}
          refundMethod={state.refundMethod}
          submitError={state.submitError}
          isSubmitting={isSubmitting}
          onBack={goBack}
          onSubmit={submitReturn}
        />
      )}

      {state.step === 'SUCCESS' && state.createdReturn && (
        <StepSuccess
          ret={state.createdReturn}
          refundTotal={state.refundTotal}
          refundMethod={state.refundMethod}
          onClose={onClose}
        />
      )}
    </ModalOverlay>
  );
}
