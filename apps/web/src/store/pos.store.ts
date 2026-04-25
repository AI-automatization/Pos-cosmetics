import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, DiscountType, PaymentMethod, CartTotals } from '@/types/sales';
import type { ShiftTotals } from '@/types/shift';
import type { Customer } from '@/types/customer';

// ─── Cart state (per-cart) ────────────────────────────────────────────────────

export interface CartState {
  id: string;
  items: CartItem[];
  orderDiscount: number;
  orderDiscountType: DiscountType;
  paymentMethod: PaymentMethod;
  cashAmount: number;
  cardAmount: number;
  bonusPoints: number;
  splitNasiyaAmount: number;
  selectedCustomer: Customer | null;
}

export const emptyCart = (id: string): CartState => ({
  id,
  items: [],
  orderDiscount: 0,
  orderDiscountType: 'percent',
  paymentMethod: 'cash',
  cashAmount: 0,
  cardAmount: 0,
  bonusPoints: 0,
  splitNasiyaAmount: 0,
  selectedCustomer: null,
});

// ─── Store interface ──────────────────────────────────────────────────────────

interface POSState {
  // Multi-cart
  carts: Record<string, CartState>;
  activeCartId: string;

  // Cart management
  addCart: () => string;
  switchCart: (id: string) => void;
  removeCart: (id: string) => void;

  // Cart actions (operate on carts[activeCartId])
  addItem: (item: Omit<CartItem, 'quantity' | 'lineDiscount'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setLineDiscount: (productId: string, discount: number) => void;
  setOrderDiscount: (amount: number, type: DiscountType) => void;
  clearCart: () => void;

  // Payment actions (operate on carts[activeCartId])
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashAmount: (amount: number) => void;
  setCardAmount: (amount: number) => void;
  setBonusPoints: (points: number) => void;
  setSplitNasiyaAmount: (amount: number) => void;
  setSelectedCustomer: (customer: Customer | null) => void;

  // Shift
  shiftId: string | null;
  cashierName: string;
  shiftOpenedAt: Date | null;
  openingCash: number;
  salesCount: number;
  shiftTotals: ShiftTotals;

  // Computed (from carts[activeCartId])
  totals: () => CartTotals;

  // Shift actions
  openShift: (shiftId: string, cashierName: string, openingCash: number) => void;
  closeShift: () => void;
  recordSale: (revenue: number, cashRevenue: number, cardRevenue: number) => void;
  incrementSalesCount: () => void;
}

const DEFAULT_SHIFT_TOTALS: ShiftTotals = {
  revenue: 0,
  cashRevenue: 0,
  cardRevenue: 0,
};

// ─── Helper: patch active cart ────────────────────────────────────────────────

function patchActive(
  s: { carts: Record<string, CartState>; activeCartId: string },
  patch: Partial<CartState>,
): { carts: Record<string, CartState> } {
  const cart = s.carts[s.activeCartId];
  if (!cart) return { carts: s.carts };
  return { carts: { ...s.carts, [s.activeCartId]: { ...cart, ...patch } } };
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const usePOSStore = create<POSState>()(
  persist(
    (set, get) => ({
      carts: { 'cart-1': emptyCart('cart-1') },
      activeCartId: 'cart-1',

      addCart: () => {
        const ids = Object.keys(get().carts);
        const nums = ids.map((k) => parseInt(k.replace('cart-', '')) || 0);
        const nextNum = Math.max(...nums, 0) + 1;
        const id = `cart-${nextNum}`;
        set((s) => ({ carts: { ...s.carts, [id]: emptyCart(id) }, activeCartId: id }));
        return id;
      },

      switchCart: (id) => set({ activeCartId: id }),

      removeCart: (id) =>
        set((s) => {
          const remaining = Object.values(s.carts).filter((c) => c.id !== id);
          if (remaining.length === 0) {
            // Last cart — keep it but reset to empty
            return { carts: { [id]: emptyCart(id) }, activeCartId: id };
          }
          const newCarts: Record<string, CartState> = {};
          remaining.forEach((c) => { newCarts[c.id] = c; });
          const newActiveId = s.activeCartId === id ? remaining[0].id : s.activeCartId;
          return { carts: newCarts, activeCartId: newActiveId };
        }),

      addItem: (newItem) =>
        set((s) => {
          const cart = s.carts[s.activeCartId];
          if (!cart) return {};
          const existing = cart.items.find((i) => i.productId === newItem.productId);
          const items = existing
            ? cart.items.map((i) =>
                i.productId === newItem.productId ? { ...i, quantity: i.quantity + 1 } : i,
              )
            : [...cart.items, { ...newItem, quantity: 1, lineDiscount: 0 }];
          return patchActive(s, { items });
        }),

      removeItem: (productId) =>
        set((s) => {
          const cart = s.carts[s.activeCartId];
          if (!cart) return {};
          return patchActive(s, { items: cart.items.filter((i) => i.productId !== productId) });
        }),

      updateQuantity: (productId, qty) =>
        set((s) => {
          const cart = s.carts[s.activeCartId];
          if (!cart) return {};
          const items =
            qty <= 0
              ? cart.items.filter((i) => i.productId !== productId)
              : cart.items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i));
          return patchActive(s, { items });
        }),

      setLineDiscount: (productId, discount) =>
        set((s) => {
          const cart = s.carts[s.activeCartId];
          if (!cart) return {};
          const items = cart.items.map((i) =>
            i.productId === productId
              ? { ...i, lineDiscount: Math.min(100, Math.max(0, discount)) }
              : i,
          );
          return patchActive(s, { items });
        }),

      setOrderDiscount: (amount, type) =>
        set((s) => patchActive(s, { orderDiscount: Math.max(0, amount), orderDiscountType: type })),

      clearCart: () =>
        set((s) => ({ carts: { ...s.carts, [s.activeCartId]: emptyCart(s.activeCartId) } })),

      setPaymentMethod: (method) => set((s) => patchActive(s, { paymentMethod: method })),
      setCashAmount: (amount) => set((s) => patchActive(s, { cashAmount: Math.max(0, amount) })),
      setCardAmount: (amount) => set((s) => patchActive(s, { cardAmount: Math.max(0, amount) })),
      setBonusPoints: (points) => set((s) => patchActive(s, { bonusPoints: Math.max(0, points) })),
      setSplitNasiyaAmount: (amount) => set((s) => patchActive(s, { splitNasiyaAmount: Math.max(0, amount) })),
      setSelectedCustomer: (customer) => set((s) => patchActive(s, { selectedCustomer: customer })),

      totals: () => {
        const { carts, activeCartId } = get();
        const cart = carts[activeCartId];
        if (!cart) return { subtotal: 0, discountAmount: 0, total: 0, change: 0 };
        const { items, orderDiscount, orderDiscountType, cashAmount, cardAmount, paymentMethod, bonusPoints, splitNasiyaAmount } = cart;

        const subtotal = items.reduce((sum, item) => {
          const lineTotal = item.sellPrice * item.quantity * (1 - item.lineDiscount / 100);
          return sum + lineTotal;
        }, 0);

        const discountAmount =
          orderDiscountType === 'percent'
            ? (subtotal * orderDiscount) / 100
            : Math.min(orderDiscount, subtotal);

        const total = Math.max(0, subtotal - discountAmount);

        let paidAmount = 0;
        if (paymentMethod === 'cash') paidAmount = cashAmount;
        else if (paymentMethod === 'card') paidAmount = total;
        else if (paymentMethod === 'bonus') paidAmount = bonusPoints * 100;
        else paidAmount = cashAmount + cardAmount + splitNasiyaAmount + bonusPoints * 100;

        const change =
          paymentMethod === 'cash' || paymentMethod === 'split'
            ? Math.max(0, paidAmount - total)
            : 0;

        return { subtotal, discountAmount, total, change };
      },

      shiftId: null,
      cashierName: 'Kassir',
      shiftOpenedAt: null,
      openingCash: 0,
      salesCount: 0,
      shiftTotals: { ...DEFAULT_SHIFT_TOTALS },

      openShift: (shiftId, cashierName, openingCash) =>
        set({
          shiftId,
          cashierName,
          openingCash,
          shiftOpenedAt: new Date(),
          salesCount: 0,
          shiftTotals: { ...DEFAULT_SHIFT_TOTALS },
        }),

      closeShift: () =>
        set({
          shiftId: null,
          shiftOpenedAt: null,
          openingCash: 0,
          salesCount: 0,
          shiftTotals: { ...DEFAULT_SHIFT_TOTALS },
        }),

      recordSale: (revenue, cashRevenue, cardRevenue) =>
        set((s) => ({
          salesCount: s.salesCount + 1,
          shiftTotals: {
            revenue: s.shiftTotals.revenue + revenue,
            cashRevenue: s.shiftTotals.cashRevenue + cashRevenue,
            cardRevenue: s.shiftTotals.cardRevenue + cardRevenue,
          },
        })),

      incrementSalesCount: () => set((s) => ({ salesCount: s.salesCount + 1 })),
    }),
    {
      name: 'raos-pos-store',
      version: 3,
      // skipHydration: server renders with default state (matching client initial render) → no #418.
      // POSPage calls usePOSStore.persist.rehydrate() in useEffect to load from localStorage.
      skipHydration: true,
      migrate: (persistedState: unknown, version: number) => {
        if (version < 2) {
          const old = persistedState as Record<string, unknown>;
          return {
            ...old,
            carts: {
              'cart-1': {
                id: 'cart-1',
                items: old.items ?? [],
                orderDiscount: old.orderDiscount ?? 0,
                orderDiscountType: old.orderDiscountType ?? 'percent',
                paymentMethod: 'cash',
                cashAmount: 0,
                cardAmount: 0,
                bonusPoints: 0,
                splitNasiyaAmount: 0,
                selectedCustomer: null,
              },
            },
            activeCartId: 'cart-1',
          };
        }
        if (version < 3) {
          // Add splitNasiyaAmount to existing carts
          const s = persistedState as { carts?: Record<string, Record<string, unknown>> };
          if (s.carts) {
            Object.values(s.carts).forEach((cart) => {
              if (cart.splitNasiyaAmount === undefined) cart.splitNasiyaAmount = 0;
            });
          }
          return s;
        }
        return persistedState;
      },
      partialize: (state) => ({
        carts: state.carts,
        activeCartId: state.activeCartId,
        shiftId: state.shiftId,
        cashierName: state.cashierName,
        shiftOpenedAt: state.shiftOpenedAt,
        openingCash: state.openingCash,
        salesCount: state.salesCount,
        shiftTotals: state.shiftTotals,
      }),
    },
  ),
);
