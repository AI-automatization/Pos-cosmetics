import { create } from 'zustand';

export type SyncState = 'online-synced' | 'online-syncing' | 'offline' | 'slow';

interface PendingItem {
  id: string;
  type: 'order' | 'payment' | 'stock';
  label: string;
  createdAt: string;
}

export interface PendingOrder {
  id: string;
  label: string;
  createdAt: string;
  payload: Record<string, unknown>;
}

const PENDING_ORDERS_KEY = 'raos_pending_orders';

function loadPendingOrders(): PendingOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PENDING_ORDERS_KEY);
    return raw ? (JSON.parse(raw) as PendingOrder[]) : [];
  } catch {
    return [];
  }
}

function savePendingOrders(orders: PendingOrder[]) {
  try {
    localStorage.setItem(PENDING_ORDERS_KEY, JSON.stringify(orders));
  } catch {
    // localStorage full yoki unavailable
  }
}

interface SyncStore {
  state: SyncState;
  pendingCount: number;
  pendingItems: PendingItem[];
  pendingOrders: PendingOrder[];
  lastSyncAt: Date | null;
  latencyMs: number;

  setState: (state: SyncState) => void;
  setPendingCount: (count: number) => void;
  setPendingItems: (items: PendingItem[]) => void;
  setLastSyncAt: (at: Date) => void;
  setLatency: (ms: number) => void;
  markSynced: () => void;

  addPendingOrder: (order: PendingOrder) => void;
  removePendingOrder: (id: string) => void;
  getPendingOrders: () => PendingOrder[];
  loadPendingOrdersFromStorage: () => void;
}

export const useSyncStore = create<SyncStore>((set, get) => ({
  state: 'online-synced',
  pendingCount: 0,
  pendingItems: [],
  pendingOrders: [],
  lastSyncAt: null,
  latencyMs: 0,

  setState: (state) => set({ state }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setPendingItems: (items) => set({ pendingItems: items }),
  setLastSyncAt: (at) => set({ lastSyncAt: at }),
  setLatency: (ms) => set({ latencyMs: ms }),
  markSynced: () =>
    set({ state: 'online-synced', pendingCount: 0, pendingItems: [], lastSyncAt: new Date() }),

  addPendingOrder: (order) => {
    const orders = [...get().pendingOrders, order];
    savePendingOrders(orders);
    set({ pendingOrders: orders });
  },

  removePendingOrder: (id) => {
    const orders = get().pendingOrders.filter((o) => o.id !== id);
    savePendingOrders(orders);
    set({ pendingOrders: orders });
  },

  getPendingOrders: () => get().pendingOrders,

  loadPendingOrdersFromStorage: () => {
    const orders = loadPendingOrders();
    set({ pendingOrders: orders });
  },
}));
