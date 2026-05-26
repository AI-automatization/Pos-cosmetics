import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import JailMonkey from 'jail-monkey';

export interface SecurityStatus {
  readonly isCompromised: boolean;
  readonly reason: string | null;
}

const SAFE: SecurityStatus = { isCompromised: false, reason: null };

function checkDevice(): SecurityStatus {
  if (__DEV__) return SAFE;

  try {
    const jailBroken = JailMonkey.isJailBroken();
    const trustFailed = JailMonkey.trustFall();

    if (jailBroken || trustFailed) {
      return {
        isCompromised: true,
        reason: jailBroken
          ? 'Qurilma jailbreak/root qilingan'
          : "Qurilma xavfsizlik tekshiruvidan o'tmadi",
      };
    }
  } catch {
    // jail-monkey native module mavjud bo'lmasa (Expo Go) — xavfsiz deb hisobla
  }

  return SAFE;
}

export function useSecurityCheck(): SecurityStatus {
  const [status, setStatus] = useState<SecurityStatus>(checkDevice);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (appState.current.match(/background/) && nextState === 'active') {
        setStatus(checkDevice());
      }
      appState.current = nextState;
    });

    return () => subscription.remove();
  }, []);

  return status;
}
