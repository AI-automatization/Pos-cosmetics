import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  preventScreenCaptureAsync,
  allowScreenCaptureAsync,
} from 'expo-screen-capture';

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
      if (__DEV__) return;

      preventScreenCaptureAsync();
      return () => {
        allowScreenCaptureAsync();
      };
    }, []),
  );
}
