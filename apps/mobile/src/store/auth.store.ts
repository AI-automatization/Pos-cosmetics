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
  /** Local-only wipe of SecureStore + state. Used by refresh-failure path. */
  clearAuth: () => Promise<void>;
  /** User-initiated logout: best-effort server revoke, then local clearAuth(). */
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

  logout: async () => {
    // Best-effort server-side revoke (POST /auth/logout). Dynamic import
    // breaks the circular dependency: auth.store <- auth.api <- client <- auth.store.
    try {
      const { authApi } = await import('../api/auth.api');
      await authApi.logout();
    } catch {
      // Network/server xatosi — local clear baribir bajariladi (quyida).
    }
    // Har holatda local SecureStore + state ni tozalash.
    await get().clearAuth();
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
