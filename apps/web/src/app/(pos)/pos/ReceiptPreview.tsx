'use client';

import { Printer, X, CheckCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { ReceiptTemplate } from '@/components/Receipt/ReceiptTemplate';
import { useReceiptPrint, useAutoTriggerPrint } from '@/components/Receipt/useReceiptPrint';
import type { Order } from '@/types/sales';

interface ReceiptPreviewProps {
  order: Order;
  change?: number;
  onClose: () => void;
}

export function ReceiptPreview({ order, change = 0, onClose }: ReceiptPreviewProps) {
  const { autoPrint, toggleAutoPrint, print } = useReceiptPrint();

  // Auto-print on mount if setting is enabled
  useAutoTriggerPrint(autoPrint);

  return (
    <>
      {/* Hidden print area — always in DOM, visible only on @media print */}
      <div id="receipt-print-area" style={{ display: 'none' }} aria-hidden="true">
        <ReceiptTemplate order={order} change={change} />
      </div>

      {/* Screen modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/60" onClick={onClose} aria-hidden="true" />

        <div className="relative z-10 flex w-full max-w-sm flex-col rounded-2xl bg-white shadow-2xl">
          {/* Modal header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-900">Sotuv yakunlandi!</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Receipt preview — screen version */}
          <div className="max-h-[60vh] overflow-y-auto bg-white p-5">
            <div className="mx-auto w-[280px] border border-dashed border-gray-200 bg-white p-4 font-mono text-xs leading-relaxed text-gray-900">
              <ReceiptTemplate order={order} change={change} />
            </div>
          </div>

          {/* Auto-print toggle */}
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <span className="text-sm text-gray-600">Avtomatik chop etish</span>
            <button
              type="button"
              onClick={toggleAutoPrint}
              className="flex items-center gap-1.5 text-sm transition"
              aria-label="Avtomatik chop etishni yoqish/o'chirish"
            >
              {autoPrint ? (
                <>
                  <ToggleRight className="h-6 w-6 text-blue-600" />
                  <span className="font-medium text-blue-600">Yoqiq</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-6 w-6 text-gray-400" />
                  <span className="text-gray-400">O'chiq</span>
                </>
              )}
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 border-t border-gray-100 px-5 py-4">
            <button
              type="button"
              onClick={print}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95"
            >
              <Printer className="h-4 w-4" />
              Chop etish
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Yopish
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
