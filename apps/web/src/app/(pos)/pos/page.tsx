'use client';

import { useRef, useState, useCallback } from 'react';
import { ShiftBar } from './ShiftBar';
import { ProductSearch } from './ProductSearch';
import { CartPanel } from './CartPanel';
import { PaymentPanel } from './PaymentPanel';
import { ReceiptPreview } from './ReceiptPreview';
import { ShiftOpenModal } from './shift/ShiftOpenModal';
import { ShiftCloseModal } from './shift/ShiftCloseModal';
import { usePOSKeyboard } from '@/hooks/pos/usePOSKeyboard';
import { usePOSStore } from '@/store/pos.store';
import type { Order } from '@/types/sales';

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const { setPaymentMethod, shiftId } = usePOSStore();

  const focusSearch = useCallback(() => {
    searchRef.current?.focus();
    searchRef.current?.select();
  }, []);

  usePOSKeyboard({
    onF1: focusSearch,
    onF5: () => setPaymentMethod('cash'),
    onF6: () => setPaymentMethod('card'),
    onF7: () => setPaymentMethod('split'),
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

      {/* Keyboard shortcut hint bar */}
      <div className="flex shrink-0 items-center gap-4 bg-gray-800 px-4 py-1.5 text-xs text-gray-400">
        {[
          ['F1', 'Qidirish'],
          ['F5', 'Naqd'],
          ['F6', 'Karta'],
          ['F7', 'Aralash'],
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
          <PaymentPanel onSaleComplete={(order) => setCompletedOrder(order)} />
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
          onClose={() => setCompletedOrder(null)}
        />
      )}
    </>
  );
}
