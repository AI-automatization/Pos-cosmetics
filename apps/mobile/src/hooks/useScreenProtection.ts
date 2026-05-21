import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

// Safe dynamic import — native module may not be available in dev client
let screenCapture: {
  preventScreenCaptureAsync: () => Promise<void>;
  allowScreenCaptureAsync: () => Promise<void>;
} | null = null;

try {
  screenCapture = require('expo-screen-capture');
} catch {
  // Not available
}

/**
 * Sensitive ekranlarda screenshot va screen recording ni bloklaydi.
 * Stack navigator da to'g'ri ishlaydi — faqat focused screen himoyalanadi.
 *
 * @example
 * export default function PaymentScreen() {
 *   useScreenProtection();
 *   return <View>...</View>;
 * }
 */
export function useScreenProtection(): void {
  useFocusEffect(
    useCallback(() => {
      if (__DEV__ || !screenCapture) return;

      screenCapture.preventScreenCaptureAsync();
      const mod = screenCapture;
      return () => {
        mod.allowScreenCaptureAsync();
      };
    }, []),
  );
}
