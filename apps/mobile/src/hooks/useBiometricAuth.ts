import { useState, useCallback, useEffect } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';

interface BiometricAuthResult {
  isAvailable: boolean;
  isEnrolled: boolean;
  authenticate: () => Promise<boolean>;
}

export function useBiometricAuth(): BiometricAuthResult {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    void (async () => {
      const hardware = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setIsAvailable(hardware);
      setIsEnrolled(enrolled);
    })();
  }, []);

  const authenticate = useCallback(async (): Promise<boolean> => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Barmoq izi bilan kiring',
      cancelLabel: 'Bekor qilish',
      fallbackLabel: 'Parol bilan kirish',
    });
    return result.success;
  }, []);

  return { isAvailable, isEnrolled, authenticate };
}
