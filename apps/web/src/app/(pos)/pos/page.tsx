'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Search, ShoppingCart, CreditCard, Plus, X } from 'lucide-react';
import { ShiftBar } from './ShiftBar';
import { ProductSearch } from './ProductSearch';
import { CartPanel } from './CartPanel';
import { PaymentPanel } from './PaymentPanel';
import { ReceiptPreview } from './ReceiptPreview';
import { ShiftOpenModal } from './shift/ShiftOpenModal';
import { ShiftCloseModal } from './shift/ShiftCloseModal';
import { usePOSKeyboard } from '@/hooks/pos/usePOSKeyboard';
import { usePOSStore } from '@/store/pos.store';
import type { CartState } from '@/store/pos.store';
import { shiftApi } from '@/api/shift.api';
import { cn } from '@/lib/utils';
import type { Order } from '@/types/sales';

type TabId = 'products' | 'cart' | 'payment';

// ─── Cart tab bar (multi-cart) ────────────────────────────────────────────────

function CartTabBar({
  carts,
  activeCartId,
  onSwitch,
  onAdd,
  onRemove,
}: {
  carts: Record<string, CartState>;
  activeCartId: string;
  onSwitch: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const cartList = Object.values(carts);
  return (
    <div className="flex shrink-0 items-center gap-1 border-b border-gray-200 bg-white px-3 py-1.5 overflow-x-auto">
      {cartList.map((cart, idx) => (
        <div key={cart.id} className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => onSwitch(cart.id)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition whitespace-nowrap',
              activeCartId === cart.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
            )}
          >
            <ShoppingCart className="h-3 w-3" />
            Korzinka {idx + 1}
            {cart.items.length > 0 && (
              <span
                className={cn(
                  'rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none',
                  activeCartId === cart.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-gray-600',
                )}
              >
                {cart.items.length}
              </span>
            )}
          </button>
          {cartList.length > 1 && (
            <button
              type="button"
              onClick={() => onRemove(cart.id)}
              className="ml-0.5 rounded p-0.5 text-gray-400 hover:text-red-500 transition"
              title="Savatni yopish"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={onAdd}
        className="flex shrink-0 items-center gap-1 rounded-lg border border-dashed border-gray-300 px-2.5 py-1.5 text-xs text-gray-400 hover:border-blue-400 hover:text-blue-600 transition"
        title="Yangi savat"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Tablet bottom tab bar ────────────────────────────────────────────────────

function TabBar({
  active,
  onChange,
  cartCount,
}: {
  active: TabId;
  onChange: (t: TabId) => void;
  cartCount: number;
}) {
  const tabs: { id: TabId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'products', label: 'Mahsulotlar', icon: Search },
    { id: 'cart',     label: 'Savat',       icon: ShoppingCart },
    { id: 'payment',  label: "To'lov",      icon: CreditCard },
  ];

  return (
    <div className="flex shrink-0 border-t border-gray-200 bg-white">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={cn(
            'relative flex flex-1 flex-col items-center justify-center gap-1 py-3 text-xs font-medium transition',
            active === id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700',
          )}
        >
          <div className="relative">
            <Icon className="h-5 w-5" />
            {id === 'cart' && cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-bold text-white">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </div>
          <span>{label}</span>
          {active === id && (
            <span className="absolute bottom-0 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-blue-600" />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function POSPage() {
  const [search, setSearch] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [lastChange, setLastChange] = useState(0);
  const [showCloseShift, setShowCloseShift] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('products');
  const searchRef = useRef<HTMLInputElement>(null);

  const store = usePOSStore();
  const activeCart = store.carts[store.activeCartId];
  const items = activeCart?.items ?? [];

  const [showRecovery, setShowRecovery] = useState(false);

  // Hydrate shift state from server on mount (handles page refresh / new session)
  useEffect(() => {
    if (!store.shiftId) {
      shiftApi.getActiveShift().then((shift) => {
        if (shift) {
          const s = shift as typeof shift & { user?: { firstName?: string; lastName?: string } };
          const cashierName = [s.user?.firstName, s.user?.lastName].filter(Boolean).join(' ') || 'Kassir';
          store.openShift(shift.id, cashierName, Number(shift.openingCash));
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
    onF5: () => store.setPaymentMethod('cash'),
    onF6: () => store.setPaymentMethod('card'),
    onF7: () => store.setPaymentMethod('split'),
    onF8: () => store.setPaymentMethod('nasiya'),
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

  const handleSaleComplete = (order: Order, change: number) => {
    setCompletedOrder(order);
    setLastChange(change ?? 0);
    // Remove the completed cart if multiple exist; otherwise clearCart was already called
    if (Object.keys(store.carts).length > 1) {
      store.removeCart(store.activeCartId);
    }
  };

  const isShiftOpen = !!store.shiftId;

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
              onClick={() => { store.clearCart(); setShowRecovery(false); }}
              className="rounded-md border border-amber-300 px-3 py-1 text-xs text-amber-700 hover:bg-amber-100"
            >
              Tozalash
            </button>
          </div>
        </div>
      )}

      {/* Keyboard shortcut hint bar — desktop only */}
      <div className="hidden shrink-0 items-center gap-4 bg-gray-800 px-4 py-1.5 text-xs text-gray-400 lg:flex">
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

      {/* Multi-cart tab bar */}
      <CartTabBar
        carts={store.carts}
        activeCartId={store.activeCartId}
        onSwitch={store.switchCart}
        onAdd={store.addCart}
        onRemove={store.removeCart}
      />

      {/* ── DESKTOP: 3-column layout (lg+) ─────────────────────── */}
      <div className="hidden min-h-0 flex-1 lg:flex">
        <div className="flex w-[42%] flex-col border-r border-gray-200 bg-gray-50">
          <ProductSearch search={search} onSearchChange={setSearch} searchRef={searchRef} />
        </div>
        <div className="flex w-[33%] flex-col border-r border-gray-200 bg-gray-50">
          <CartPanel />
        </div>
        <div className="flex w-[25%] flex-col bg-white">
          <PaymentPanel onSaleComplete={handleSaleComplete} />
        </div>
      </div>

      {/* ── TABLET: Tab-based layout (< lg) ────────────────────── */}
      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        {/* Tab panels */}
        <div className="min-h-0 flex-1 overflow-hidden">
          <div className={cn('h-full flex-col bg-gray-50', activeTab === 'products' ? 'flex' : 'hidden')}>
            <ProductSearch search={search} onSearchChange={setSearch} searchRef={searchRef} />
          </div>
          <div className={cn('h-full flex-col bg-gray-50', activeTab === 'cart' ? 'flex' : 'hidden')}>
            <CartPanel />
          </div>
          <div className={cn('h-full flex-col bg-white', activeTab === 'payment' ? 'flex' : 'hidden')}>
            <PaymentPanel onSaleComplete={handleSaleComplete} />
          </div>
        </div>

        {/* Bottom tab bar */}
        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          cartCount={items.length}
        />
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
