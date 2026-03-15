import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEYS } from '@/config/constants';
import { authApi } from '@/api';

interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  branchId?: string;
}

interface AuthState {
  user: UserInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string, slug?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password, slug = 'raos-demo') => {
    const tokens = await authApi.login({ slug, email, password });
    await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, tokens.accessToken);
    await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, tokens.refreshToken);
    const user = await authApi.me();
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authApi.logout().catch(() => null);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
    await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
    set({ user: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);
      if (!token) {
        set({ isLoading: false });
        return;
      }
      const user = await authApi.me();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
