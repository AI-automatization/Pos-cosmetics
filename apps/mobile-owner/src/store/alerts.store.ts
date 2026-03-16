import { create } from 'zustand';

interface AlertsState {
  unreadCount: number;
  setUnreadCount: (n: number) => void;
  decrementUnread: () => void;
  incrementUnread: () => void;
}

export const useAlertsStore = create<AlertsState>((set, get) => ({
  unreadCount: 0,

  setUnreadCount: (n: number) => set({ unreadCount: Math.max(0, n) }),

  decrementUnread: () => set({ unreadCount: Math.max(0, get().unreadCount - 1) }),

  incrementUnread: () => set({ unreadCount: get().unreadCount + 1 }),
}));
