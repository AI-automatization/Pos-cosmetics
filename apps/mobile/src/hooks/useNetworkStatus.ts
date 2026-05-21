import { useEffect, useState, useCallback } from 'react';
import { onlineManager } from '@tanstack/react-query';
import { AppState, type AppStateStatus } from 'react-native';

interface NetInfoState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  type: string;
}

interface NetInfoModule {
  addEventListener: (cb: (state: NetInfoState) => void) => () => void;
  fetch: () => Promise<NetInfoState>;
}

let NetInfo: NetInfoModule | null = null;
try {
  NetInfo = require('@react-native-community/netinfo');
} catch {
  // Not available (e.g. Expo Go without native module)
}

export interface NetworkStatus {
  readonly isOnline: boolean;
  readonly connectionType: string;
  readonly isAvailable: boolean;
  readonly checkNow: () => Promise<void>;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(true);
  const [connectionType, setConnectionType] = useState('unknown');

  const applyState = useCallback((state: NetInfoState) => {
    const online = state.isConnected === true;
    setIsOnline(online);
    setConnectionType(state.type ?? 'unknown');
    onlineManager.setOnline(online);
  }, []);

  const checkNow = useCallback(async () => {
    if (!NetInfo) return;
    const state = await NetInfo.fetch();
    applyState(state);
  }, [applyState]);

  useEffect(() => {
    if (!NetInfo) return;

    const unsubNet = NetInfo.addEventListener(applyState);

    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        checkNow();
      }
    };
    const subApp = AppState.addEventListener('change', handleAppState);

    return () => {
      unsubNet();
      subApp.remove();
    };
  }, [applyState, checkNow]);

  return { isOnline, connectionType, isAvailable: NetInfo !== null, checkNow };
}

export async function isNetworkOnline(): Promise<boolean> {
  if (!NetInfo) return true;
  const state = await NetInfo.fetch();
  return state.isConnected === true;
}
