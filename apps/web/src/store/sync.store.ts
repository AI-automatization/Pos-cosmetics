import { create } from 'zustand';

export type SyncState = 'online-synced' | 'online-syncing' | 'offline' | 'slow';

interface PendingItem {
  id: string;
  type: 'order' | 'payment' | 'stock';
  label: string;
  createdAt: string;
}

interface SyncStore {
  state: SyncState;
  pendingCount: number;
  pendingItems: PendingItem[];
  lastSyncAt: Date | null;
  latencyMs: number;

  setState: (state: SyncState) => void;
  setPendingCount: (count: number) => void;
  setPendingItems: (items: PendingItem[]) => void;
  setLastSyncAt: (at: Date) => void;
  setLatency: (ms: number) => void;
  markSynced: () => void;
}

export const useSyncStore = create<SyncStore>((set) => ({
  state: 'online-synced',
  pendingCount: 0,
  pendingItems: [],
  lastSyncAt: new Date(),
  latencyMs: 0,

  setState: (state) => set({ state }),
  setPendingCount: (count) => set({ pendingCount: count }),
  setPendingItems: (items) => set({ pendingItems: items }),
  setLastSyncAt: (at) => set({ lastSyncAt: at }),
  setLatency: (ms) => set({ latencyMs: ms }),
  markSynced: () =>
    set({ state: 'online-synced', pendingCount: 0, pendingItems: [], lastSyncAt: new Date() }),
}));
