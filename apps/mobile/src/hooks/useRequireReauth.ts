import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { useBiometricAuth } from './useBiometricAuth';

const REAUTH_WINDOW_MS = 5 * 60 * 1000; // 5 min — re-auth once, valid for 5 min

/**
 * Sensitive operatsiyalar uchun biometric re-authentication.
 * To'lov, transfer, parol o'zgartirish kabi amallardan oldin chaqiring.
 *
 * @example
 * const requireReauth = useRequireReauth();
 * const handlePayment = async () => {
 *   const authorized = await requireReauth();
 *   if (!authorized) return;
 *   // proceed with payment...
 * };
 */
export function useRequireReauth(): () => Promise<boolean> {
  const { isAvailable, authenticate } = useBiometricAuth();
  const lastAuthAt = useRef<number>(0);

  const requireReauth = useCallback(async (): Promise<boolean> => {
    // Dev mode — skip
    if (__DEV__) return true;

    // If biometric not available, allow (fallback to token-only)
    if (!isAvailable) return true;

    // If recently authenticated, skip re-auth
    const elapsed = Date.now() - lastAuthAt.current;
    if (elapsed < REAUTH_WINDOW_MS) return true;

    // Require biometric
    const success = await authenticate();
    if (success) {
      lastAuthAt.current = Date.now();
      return true;
    }

    Alert.alert(
      'Tasdiqlanmadi',
      'Ushbu amalni bajarish uchun biometrik tasdiqlash talab etiladi.',
    );
    return false;
  }, [isAvailable, authenticate]);

  return requireReauth;
}
