import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthTokens, User } from '../api/auth.api';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (tokens: AuthTokens, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setLoading: (v: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (tokens: AuthTokens, user: User) => {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, tokens.access_token);
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh_token);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, isAuthenticated: true, isLoading: false });
  },

  logout: async () => {
    await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);
    await AsyncStorage.removeItem(USER_KEY);
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (v: boolean) => set({ isLoading: v }),

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
      const userJson = token ? await AsyncStorage.getItem(USER_KEY) : null;
      if (token && userJson) {
        const user = JSON.parse(userJson) as User;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
