import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  tenant?: {
    id: string;
    name: string;
    slug: string;
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
    await SecureStore.setItemAsync('refresh_token', refreshToken);
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
    if (!token || !userStr) return false;
    try {
      const user = JSON.parse(userStr) as User;
      set({ user, isAuthenticated: true });
      return true;
    } catch {
      return false;
    }
  },
}));
