'use client';

import { useState } from 'react';
import { LogOut, X } from 'lucide-react';
import { usePOSStore } from '@/store/pos.store';
import { useCloseShift } from '@/hooks/pos/useShift';
import { ShiftReport } from './ShiftReport';

interface ShiftCloseModalProps {
  onClose: () => void;
  onClosed: () => void;
}

export function ShiftCloseModal({ onClose, onClosed }: ShiftCloseModalProps) {
  const { openingCash, salesCount, shiftTotals } = usePOSStore();
  const [closingCash, setClosingCash] = useState(0);
  const [notes, setNotes] = useState('');
  const [showReport, setShowReport] = useState(false);

  const closeShiftMutation = useCloseShift(onClosed);

  const handleConfirm = () => {
    closeShiftMutation.mutate({ closingCash, notes: notes || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-gray-900">Smenani yopish</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[80vh] overflow-y-auto p-6">
          {/* Closing cash */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Kassadagi naqd pul (haqiqiy)
            </label>
            <input
              type="number"
              value={closingCash || ''}
              min={0}
              step={1000}
              autoFocus
              onChange={(e) => {
                setClosingCash(parseFloat(e.target.value) || 0);
                setShowReport(true);
              }}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-right text-lg font-bold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Notes */}
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Izoh (ixtiyoriy)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Smena bo'yicha eslatmalar..."
              rows={2}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Shift report — auto shows when closing cash entered */}
          {showReport && (
            <div className="mb-4">
              <ShiftReport
                openingCash={openingCash}
                closingCash={closingCash}
                salesCount={salesCount}
                revenue={shiftTotals.revenue}
                cashRevenue={shiftTotals.cashRevenue}
                cardRevenue={shiftTotals.cardRevenue}
              />
            </div>
          )}

          {/* Show report button if not shown yet */}
          {!showReport && (
            <button
              type="button"
              onClick={() => setShowReport(true)}
              className="mb-4 w-full rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600 transition hover:bg-gray-50"
            >
              Smena hisobotini ko'rish
            </button>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={closeShiftMutation.isPending}
              className="flex-1 rounded-xl border border-gray-200 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={closeShiftMutation.isPending}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              <LogOut className="h-4 w-4" />
              {closeShiftMutation.isPending ? 'Yopilmoqda...' : 'Smenani yopish'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
