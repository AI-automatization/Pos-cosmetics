'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { ShiftBar } from './ShiftBar';
import { ProductSearch } from './ProductSearch';
import { CartPanel } from './CartPanel';
import { PaymentPanel } from './PaymentPanel';
import { ReceiptPreview } from './ReceiptPreview';
import { ShiftOpenModal } from './shift/ShiftOpenModal';
import { ShiftCloseModal } from './shift/ShiftCloseModal';
import { usePOSKeyboard } from '@/hooks/pos/usePOSKeyboard';
import { usePOSStore } from '@/store/pos.store';
import { shiftApi } from '@/api/shift.api';
import type { Order } from '@/types/sales';

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [lastChange, setLastChange] = useState(0);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { setPaymentMethod, shiftId, items, clearCart, openShift } = usePOSStore();
  const [showRecovery, setShowRecovery] = useState(false);

  // Hydrate shift state from server on mount (handles page refresh / new session)
  useEffect(() => {
    if (!shiftId) {
      shiftApi.getActiveShift().then((shift) => {
        if (shift) {
          const s = shift as typeof shift & { user?: { firstName?: string; lastName?: string } };
          const cashierName = [s.user?.firstName, s.user?.lastName].filter(Boolean).join(' ') || 'Kassir';
          openShift(shift.id, cashierName, Number(shift.openingCash));
        }
      });
    }
  }, []); // intentional: run once on mount

  // T-066: Cart recovery — tok o'chib yonsa savdo yo'qolmaydi
  useEffect(() => {
    if (items.length > 0 && !completedOrder) {
      setShowRecovery(true);
    }
  }, []); // intentional: run once on mount

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
    searchRef.current?.select();
  }, []);

  usePOSKeyboard({
    onF1: focusSearch,
    onF5: () => setPaymentMethod('cash'),
    onF6: () => setPaymentMethod('card'),
    onF7: () => setPaymentMethod('split'),
    onF8: () => setPaymentMethod('nasiya'),
    onEsc: () => {
      if (completedOrder) {
        setCompletedOrder(null);
      } else if (showCloseShift) {
        setShowCloseShift(false);
      } else {
        setSearch('');
        focusSearch();
      }
    },
  });

  const isShiftOpen = !!shiftId;

  return (
    <>
      {/* Top shift bar */}
      <ShiftBar onCloseShift={() => setShowCloseShift(true)} />

      {/* T-066: Cart recovery banner */}
      {showRecovery && (
        <div className="flex shrink-0 items-center justify-between bg-amber-50 border-b border-amber-200 px-4 py-2 text-sm">
          <span className="text-amber-800">
            ⚡ Tugatilmagan savdo topildi — <strong>{items.length} ta mahsulot</strong> savatda qolgan.
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowRecovery(false)}
              className="rounded-md bg-amber-600 px-3 py-1 text-xs font-medium text-white hover:bg-amber-700"
            >
              Davom etish
            </button>
            <button
              type="button"
              onClick={() => { clearCart(); setShowRecovery(false); }}
              className="rounded-md border border-amber-300 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100"
            >
              Tozalash
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint bar */}
      <div className="flex shrink-0 items-center gap-4 bg-gray-800 px-4 py-1.5 text-xs text-gray-400">
        {[
          ['F1', 'Qidirish'],
          ['F5', 'Naqd'],
          ['F6', 'Karta'],
          ['F7', 'Aralash'],
          ['F8', 'Nasiya'],
          ['F10', 'Yakunlash'],
          ['Esc', 'Bekor'],
        ].map(([key, label]) => (
          <span key={key}>
            <kbd className="rounded bg-gray-700 px-1.5 py-0.5 font-mono text-gray-300">
              {key}
            </kbd>{' '}
            {label}
          </span>
        ))}
      </div>

      {/* Main 3-column layout */}
      <div className="flex min-h-0 flex-1">
        {/* Left: Product search */}
        <div className="flex w-[42%] flex-col border-r border-gray-200 bg-gray-50">
          <ProductSearch
            search={search}
            onSearchChange={setSearch}
            searchRef={searchRef}
          />
        </div>

        {/* Middle: Cart */}
        <div className="flex w-[33%] flex-col border-r border-gray-200 bg-gray-50">
          <CartPanel />
        </div>

        {/* Right: Payment */}
        <div className="flex w-[25%] flex-col bg-white">
          <PaymentPanel
            onSaleComplete={(order, change) => {
              setCompletedOrder(order);
              setLastChange(change ?? 0);
            }}
          />
        </div>
      </div>

      {/* Shift Gate — blocks POS if no shift open */}
      {!isShiftOpen && (
        <ShiftOpenModal onOpened={() => {/* store updated in hook */}} />
      )}

      {/* Shift close modal */}
      {showCloseShift && (
        <ShiftCloseModal
          onClose={() => setShowCloseShift(false)}
          onClosed={() => setShowCloseShift(false)}
        />
      )}

      {/* Receipt preview modal */}
      {completedOrder && (
        <ReceiptPreview
          order={completedOrder}
          change={lastChange}
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </>
  );
}
