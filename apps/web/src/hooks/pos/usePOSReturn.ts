'use client';

import { useReducer, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ordersApi } from '@/api/orders.api';
import { returnsApi } from '@/api/returns.api';
import { usePOSStore } from '@/store/pos.store';
import type { Order, OrderItem } from '@/types/order';
import type { Return, RefundMethod } from '@/types/returns';

// ─── Step type ───────────────────────────────────────────────────────────────

export type ReturnStep =
  | 'LOOKUP'
  | 'ITEM_SELECT'
  | 'METHOD_SELECT'
  | 'CONFIRM'
  | 'SUCCESS';

// ─── Selected item shape ─────────────────────────────────────────────────────

export interface SelectedReturnItem {
  orderItemId: string;
  productId: string;
  productName: string;
  unitPrice: number;
  qty: number;
  maxQty: number;
}

// ─── State ───────────────────────────────────────────────────────────────────

export interface POSReturnState {
  step: ReturnStep;
  orderNumberInput: string;
  order: Order | null;
  selectedItems: Record<string, SelectedReturnItem>;
  reason: string;
  refundMethod: RefundMethod | null;
  availableCash: number | null;
  isLoadingCash: boolean;
  refundTotal: number;
  createdReturn: Return | null;
  lookupError: string | null;
  submitError: string | null;
}

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: 'SET_ORDER_NUMBER'; value: string }
  | { type: 'LOOKUP_SUCCESS'; order: Order }
  | { type: 'LOOKUP_ERROR'; message: string }
  | { type: 'TOGGLE_ITEM'; item: SelectedReturnItem }
  | { type: 'SET_QTY'; orderItemId: string; qty: number }
  | { type: 'SET_REASON'; value: string }
  | { type: 'PROCEED_TO_METHOD' }
  | { type: 'CASH_LOADING' }
  | { type: 'CASH_LOADED'; availableCash: number }
  | { type: 'SET_METHOD'; method: RefundMethod }
  | { type: 'PROCEED_TO_CONFIRM' }
  | { type: 'SUBMIT_SUCCESS'; ret: Return }
  | { type: 'SUBMIT_ERROR'; message: string }
  | { type: 'GO_BACK' }
  | { type: 'RESET' };

// ─── Initial state ────────────────────────────────────────────────────────────

const INITIAL_STATE: POSReturnState = {
  step: 'LOOKUP',
  orderNumberInput: '',
  order: null,
  selectedItems: {},
  reason: '',
  refundMethod: null,
  availableCash: null,
  isLoadingCash: false,
  refundTotal: 0,
  createdReturn: null,
  lookupError: null,
  submitError: null,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcTotal(selected: Record<string, SelectedReturnItem>): number {
  return Object.values(selected).reduce((s, i) => s + i.unitPrice * i.qty, 0);
}

/** Detect dominant payment method from paymentIntents for smart suggestion */
function detectRefundMethod(order: Order): RefundMethod {
  const intents = (order as unknown as { paymentIntents?: Array<{ method: string; amount: number | string }> })
    .paymentIntents ?? [];
  if (!intents.length) return 'CASH';
  let cashTotal = 0;
  let cardTotal = 0;
  for (const i of intents) {
    const amt = Number(i.amount);
    if (i.method === 'CASH') cashTotal += amt;
    else if (i.method === 'TERMINAL') cardTotal += amt;
  }
  return cardTotal > cashTotal ? 'TERMINAL' : 'CASH';
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

function reducer(state: POSReturnState, action: Action): POSReturnState {
  switch (action.type) {
    case 'SET_ORDER_NUMBER':
      return { ...state, orderNumberInput: action.value, lookupError: null };

    case 'LOOKUP_SUCCESS':
      return {
        ...state,
        order: action.order,
        selectedItems: {},
        refundTotal: 0,
        step: 'ITEM_SELECT',
        lookupError: null,
      };

    case 'LOOKUP_ERROR':
      return { ...state, lookupError: action.message };

    case 'TOGGLE_ITEM': {
      const key = action.item.orderItemId;
      const next = { ...state.selectedItems };
      if (next[key]) {
        delete next[key];
      } else {
        next[key] = action.item;
      }
      return { ...state, selectedItems: next, refundTotal: calcTotal(next) };
    }

    case 'SET_QTY': {
      const existing = state.selectedItems[action.orderItemId];
      if (!existing) return state;
      const clamped = Math.max(0.001, Math.min(action.qty, existing.maxQty));
      const next = { ...state.selectedItems, [action.orderItemId]: { ...existing, qty: clamped } };
      return { ...state, selectedItems: next, refundTotal: calcTotal(next) };
    }

    case 'SET_REASON':
      return { ...state, reason: action.value };

    case 'PROCEED_TO_METHOD':
      return { ...state, step: 'METHOD_SELECT', availableCash: null, isLoadingCash: false };

    case 'CASH_LOADING':
      return { ...state, isLoadingCash: true };

    case 'CASH_LOADED': {
      const isCashOk = action.availableCash >= state.refundTotal;
      // Pre-select: if not enough cash → force TERMINAL
      const suggested = state.order ? detectRefundMethod(state.order) : 'CASH';
      const method: RefundMethod = isCashOk ? suggested : 'TERMINAL';
      return { ...state, availableCash: action.availableCash, isLoadingCash: false, refundMethod: method };
    }

    case 'SET_METHOD':
      return { ...state, refundMethod: action.method };

    case 'PROCEED_TO_CONFIRM':
      return { ...state, step: 'CONFIRM', submitError: null };

    case 'SUBMIT_SUCCESS':
      return { ...state, step: 'SUCCESS', createdReturn: action.ret, submitError: null };

    case 'SUBMIT_ERROR':
      return { ...state, submitError: action.message };

    case 'GO_BACK': {
      const prev: Record<ReturnStep, ReturnStep> = {
        LOOKUP: 'LOOKUP',
        ITEM_SELECT: 'LOOKUP',
        METHOD_SELECT: 'ITEM_SELECT',
        CONFIRM: 'METHOD_SELECT',
        SUCCESS: 'SUCCESS',
      };
      return { ...state, step: prev[state.step], submitError: null };
    }

    case 'RESET':
      return { ...INITIAL_STATE };

    default:
      return state;
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function usePOSReturn(shiftId: string | null) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const queryClient = useQueryClient();
  const recordReturn = usePOSStore((s) => s.recordReturn);

  // Lookup order by number
  const lookupMutation = useMutation({
    mutationFn: (num: number) => ordersApi.getByOrderNumber(num),
    onSuccess: (order) => {
      if (order.status === 'RETURNED') {
        dispatch({ type: 'LOOKUP_ERROR', message: 'Bu buyurtma allaqachon qaytarilgan' });
        return;
      }
      dispatch({ type: 'LOOKUP_SUCCESS', order });
    },
    onError: () => {
      dispatch({ type: 'LOOKUP_ERROR', message: 'Buyurtma topilmadi' });
    },
  });

  // Fetch available cash
  const cashMutation = useMutation({
    mutationFn: (sid: string) => returnsApi.getShiftAvailableCash(sid),
    onMutate: () => dispatch({ type: 'CASH_LOADING' }),
    onSuccess: (data) => dispatch({ type: 'CASH_LOADED', availableCash: data.availableCash }),
    onError: () => dispatch({ type: 'CASH_LOADED', availableCash: 0 }),
  });

  // Submit return
  const submitMutation = useMutation({
    mutationFn: () => {
      if (!state.order || !state.refundMethod) throw new Error('Invalid state');
      return returnsApi.createReturn({
        orderId: state.order.id,
        items: Object.values(state.selectedItems).map((i) => ({
          orderItemId: i.orderItemId,
          productId: i.productId,
          quantity: i.qty,
        })),
        reason: state.reason || undefined,
        refundMethod: state.refundMethod,
      });
    },
    onSuccess: (ret) => {
      dispatch({ type: 'SUBMIT_SUCCESS', ret });
      if (state.refundMethod === 'CASH' || state.refundMethod === 'TERMINAL') {
        recordReturn(state.refundTotal, state.refundMethod);
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['returns'] });
      toast.success(
        state.refundMethod === 'CASH'
          ? `Qaytarish amalga oshirildi. Mijozga ${Math.round(state.refundTotal).toLocaleString()} so'm bering.`
          : 'Qaytarish so\'rovi yaratildi. Bank orqali 1-3 ish kuni.',
      );
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Xato yuz berdi';
      // Parse INSUFFICIENT_CASH:available:required
      if (msg.startsWith('INSUFFICIENT_CASH:')) {
        const [, avail, req] = msg.split(':');
        const message = `Kassada yetarli pul yo'q. Mavjud: ${Number(avail).toLocaleString()} so'm, kerak: ${Number(req).toLocaleString()} so'm`;
        dispatch({ type: 'SUBMIT_ERROR', message });
        // Force switch to TERMINAL
        dispatch({ type: 'SET_METHOD', method: 'TERMINAL' });
        return;
      }
      dispatch({ type: 'SUBMIT_ERROR', message: msg });
    },
  });

  // ─── Public API ──────────────────────────────────────────────────────────

  const setOrderNumberInput = useCallback((value: string) => {
    dispatch({ type: 'SET_ORDER_NUMBER', value });
  }, []);

  const lookupOrder = useCallback(() => {
    const num = parseInt(state.orderNumberInput);
    if (isNaN(num) || num <= 0) {
      dispatch({ type: 'LOOKUP_ERROR', message: 'Chek raqamini to\'g\'ri kiriting' });
      return;
    }
    lookupMutation.mutate(num);
  }, [state.orderNumberInput, lookupMutation]);

  const toggleItem = useCallback((orderItem: OrderItem) => {
    const item: SelectedReturnItem = {
      orderItemId: orderItem.id,
      productId: orderItem.productId,
      productName: orderItem.productName,
      unitPrice: Number(orderItem.unitPrice),
      qty: Number(orderItem.quantity),
      maxQty: Number(orderItem.quantity),
    };
    dispatch({ type: 'TOGGLE_ITEM', item });
  }, []);

  const setQty = useCallback((orderItemId: string, qty: number) => {
    dispatch({ type: 'SET_QTY', orderItemId, qty });
  }, []);

  const setReason = useCallback((value: string) => {
    dispatch({ type: 'SET_REASON', value });
  }, []);

  const proceedToMethodSelect = useCallback(() => {
    if (Object.keys(state.selectedItems).length === 0) return;
    dispatch({ type: 'PROCEED_TO_METHOD' });
    if (shiftId) {
      cashMutation.mutate(shiftId);
    } else {
      dispatch({ type: 'CASH_LOADED', availableCash: 0 });
    }
  }, [state.selectedItems, shiftId, cashMutation]);

  const setRefundMethod = useCallback((method: RefundMethod) => {
    dispatch({ type: 'SET_METHOD', method });
  }, []);

  const proceedToConfirm = useCallback(() => {
    if (!state.refundMethod) return;
    dispatch({ type: 'PROCEED_TO_CONFIRM' });
  }, [state.refundMethod]);

  const submitReturn = useCallback(() => {
    submitMutation.mutate();
  }, [submitMutation]);

  const goBack = useCallback(() => {
    dispatch({ type: 'GO_BACK' });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const isCashAllowed =
    state.availableCash !== null && state.availableCash >= state.refundTotal;

  return {
    state,
    setOrderNumberInput,
    lookupOrder,
    isLookingUp: lookupMutation.isPending,
    toggleItem,
    setQty,
    setReason,
    proceedToMethodSelect,
    setRefundMethod,
    isCashAllowed,
    isLoadingCash: state.isLoadingCash,
    proceedToConfirm,
    submitReturn,
    isSubmitting: submitMutation.isPending,
    goBack,
    reset,
  };
}
