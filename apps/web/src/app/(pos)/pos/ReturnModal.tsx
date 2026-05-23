'use client';

import { useEffect } from 'react';
import { X, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/i18n/i18n-context';
import type { Return } from '@/types/returns';
import { usePOSReturn } from '@/hooks/pos/usePOSReturn';
import { usePOSStore } from '@/store/pos.store';
import {
  StepLookup,
  StepItemSelect,
  StepMethodSelect,
  StepConfirm,
  StepSuccess,
} from './ReturnSteps';

// ─── Props ────────────────────────────────────────────────────────────────────

interface ReturnModalProps {
  onClose: () => void;
  onReturnComplete: (ret: Return) => void;
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const { t } = useTranslation();
  const STEPS = [
    t('pos.returnStepSearch'),
    t('pos.returnStepItems'),
    t('pos.returnStepMethod'),
    t('pos.returnStepConfirm'),
  ];
  return (
    <div className="flex items-center gap-1 px-6 py-2 border-b border-gray-100 bg-gray-50/80">
      {STEPS.map((label, i) => (
        <div key={label} className="flex items-center gap-1">
          <div className={cn(
            'flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold transition-all',
            i < current ? 'bg-orange-500 text-white' :
            i === current ? 'bg-orange-100 text-orange-600 ring-2 ring-orange-400 ring-offset-1' :
            'bg-gray-200 text-gray-400',
          )}>
            {i < current ? '✓' : i + 1}
          </div>
          <span className={cn(
            'text-[11px] font-medium hidden sm:block',
            i === current ? 'text-orange-600' : i < current ? 'text-gray-500' : 'text-gray-300',
          )}>{label}</span>
          {i < STEPS.length - 1 && (
            <div className={cn('mx-1 h-px w-4 sm:w-6', i < current ? 'bg-orange-400' : 'bg-gray-200')} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Modal shell ─────────────────────────────────────────────────────────────

function ModalShell({
  children,
  onClose,
  step,
}: {
  children: React.ReactNode;
  onClose: () => void;
  step: number;
}) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[2px]">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-5 w-5 text-orange-500" />
            <h2 className="text-lg font-bold text-gray-900">{t('pos.returnTitle')}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <StepIndicator current={step} />

        {children}
      </div>
    </div>
  );
}

// ─── Step → index map ────────────────────────────────────────────────────────

const STEP_INDEX: Record<string, number> = {
  LOOKUP: 0,
  ITEM_SELECT: 1,
  METHOD_SELECT: 2,
  CONFIRM: 3,
  SUCCESS: 4,
};

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

  useEffect(() => {
    if (state.step === 'SUCCESS' && state.createdReturn) {
      onReturnComplete(state.createdReturn);
    }
  }, [state.step, state.createdReturn, onReturnComplete]);

  const stepIndex = STEP_INDEX[state.step] ?? 0;

  return (
    <ModalShell onClose={onClose} step={stepIndex}>
      {state.step === 'LOOKUP' && (
        <StepLookup
          orderNumberInput={state.orderNumberInput}
          onChange={setOrderNumberInput}
          onSubmit={lookupOrder}
          isLoading={isLookingUp}
          error={state.lookupError}
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
    </ModalShell>
  );
}
