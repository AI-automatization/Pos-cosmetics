import { create } from 'zustand';
import type { CartItem, DiscountType, PaymentMethod, CartTotals } from '@/types/sales';
import type { ShiftTotals } from '@/types/shift';
import type { Customer } from '@/types/customer';

interface POSState {
  // Cart
  items: CartItem[];
  orderDiscount: number;
  orderDiscountType: DiscountType;

  // Payment
  paymentMethod: PaymentMethod;
  cashAmount: number;
  cardAmount: number;
  selectedCustomer: Customer | null; // nasiya uchun

  // Shift
  shiftId: string | null;
  cashierName: string;
  shiftOpenedAt: Date | null;
  openingCash: number;
  salesCount: number;
  shiftTotals: ShiftTotals;

  // Computed
  totals: () => CartTotals;

  // Cart actions
  addItem: (item: Omit<CartItem, 'quantity' | 'lineDiscount'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  setLineDiscount: (productId: string, discount: number) => void;
  setOrderDiscount: (amount: number, type: DiscountType) => void;
  clearCart: () => void;

  // Payment actions
  setPaymentMethod: (method: PaymentMethod) => void;
  setCashAmount: (amount: number) => void;
  setCardAmount: (amount: number) => void;
  setSelectedCustomer: (customer: Customer | null) => void;

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

export const usePOSStore = create<POSState>((set, get) => ({
  items: [],
  orderDiscount: 0,
  orderDiscountType: 'percent',
  paymentMethod: 'cash',
  cashAmount: 0,
  cardAmount: 0,
  selectedCustomer: null,
  shiftId: null,
  cashierName: 'Kassir',
  shiftOpenedAt: null,
  openingCash: 0,
  salesCount: 0,
  shiftTotals: { ...DEFAULT_SHIFT_TOTALS },

  totals: () => {
    const { items, orderDiscount, orderDiscountType, cashAmount, cardAmount, paymentMethod } =
      get();

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
    else paidAmount = cashAmount + cardAmount;

    const change =
      paymentMethod === 'cash' || paymentMethod === 'split'
        ? Math.max(0, paidAmount - total)
        : 0;

    return { subtotal, discountAmount, total, change };
  },

  addItem: (newItem) =>
    set((state) => {
      const existing = state.items.find((i) => i.productId === newItem.productId);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.productId === newItem.productId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...state.items, { ...newItem, quantity: 1, lineDiscount: 0 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.productId !== productId)
          : state.items.map((i) => (i.productId === productId ? { ...i, quantity: qty } : i)),
    })),

  setLineDiscount: (productId, discount) =>
    set((state) => ({
      items: state.items.map((i) =>
        i.productId === productId
          ? { ...i, lineDiscount: Math.min(100, Math.max(0, discount)) }
          : i,
      ),
    })),

  setOrderDiscount: (amount, type) =>
    set({ orderDiscount: Math.max(0, amount), orderDiscountType: type }),

  clearCart: () =>
    set({
      items: [],
      orderDiscount: 0,
      orderDiscountType: 'percent',
      cashAmount: 0,
      cardAmount: 0,
      paymentMethod: 'cash',
      selectedCustomer: null,
    }),

  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setCashAmount: (amount) => set({ cashAmount: Math.max(0, amount) }),
  setCardAmount: (amount) => set({ cardAmount: Math.max(0, amount) }),
  setSelectedCustomer: (customer) => set({ selectedCustomer: customer }),

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
}));
