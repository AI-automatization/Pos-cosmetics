import { useState, useCallback, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

export function useBiometricAuth() {
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then((has) => {
      if (!has) return setIsAvailable(false);
      LocalAuthentication.isEnrolledAsync().then(setIsAvailable);
    });
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Barmoq izi bilan kiring',
      cancelLabel: 'Bekor qilish',
      fallbackLabel: 'Parol bilan kirish',
    });
    return result.success;
  }, []);

  return { isAvailable, authenticate };
}
