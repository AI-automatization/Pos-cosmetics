import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  branchId?: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
  };
  branch?: {
    id: string;
    name: string;
    isWarehouse?: boolean;
  };
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  loadFromStorage: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: async (user, accessToken, refreshToken) => {
    await SecureStore.setItemAsync('access_token', accessToken);
    if (refreshToken) {
      await SecureStore.setItemAsync('refresh_token', refreshToken);
    }
    await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ user, isAuthenticated: true });
  },

  clearAuth: async () => {
    await SecureStore.deleteItemAsync('access_token');
    await SecureStore.deleteItemAsync('refresh_token');
    await SecureStore.deleteItemAsync('user');
    set({ user: null, isAuthenticated: false });
  },

  loadFromStorage: async () => {
    const token = await SecureStore.getItemAsync('access_token');
    const userStr = await SecureStore.getItemAsync('user');
    if (!token || !userStr) {
      return false;
    }
    try {
      const user = JSON.parse(userStr) as User;
      // Darhol cached user ni set qil (UI tez ko'rsatish uchun)
      set({ user, isAuthenticated: true });

      // Background da server bilan taqqosla va yangilab qo'y
      void (async () => {
        try {
          const { default: api } = await import('../api/client');
          const { data } = await api.get<User>('/auth/me');
          if (data && data.id) {
            await SecureStore.setItemAsync('user', JSON.stringify(data));
            set({ user: data });
          }
        } catch {
          // Server xatosi — cached data bilan davom etamiz (offline case)
        }
      })();

      return true;
    } catch {
      return false;
    }
  },
}));
