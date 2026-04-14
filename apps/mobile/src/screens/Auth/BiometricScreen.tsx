import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { extractErrorMessage } from '../../utils/error';

const PRIMARY = '#2563EB';
const PRIMARY_LIGHT = '#EFF6FF';

type Props = NativeStackScreenProps<AuthStackParamList, 'Biometric'>;

export default function BiometricScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { authenticate } = useBiometricAuth();
  const { setUser, loadFromStorage } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    attemptBiometric();
  }, []);

  const attemptBiometric = async () => {
    setLoading(true);
    setError(null);
    try {
      const success = await authenticate();
      if (!success) {
        setError(t('auth.loginError'));
        return;
      }
      // Try to restore session from stored tokens
      const restored = await loadFromStorage();
      if (restored) return;

      // Tokens expired — refresh via API
      const me = await authApi.me();
      await SecureStore.getItemAsync('access_token').then((token) => {
        if (token) setUser(me, token, '');
      });
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Icon */}
        <View style={styles.iconCircle}>
          <Ionicons name="finger-print-outline" size={80} color={PRIMARY} />
        </View>

        {/* Title */}
        <Text style={styles.title}>{t('auth.biometricTitle')}</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle} numberOfLines={2}>
          {t('auth.biometricPrompt')}
        </Text>

        {/* Error */}
        {error && <Text style={styles.error}>{error}</Text>}

        {/* Primary button */}
        <TouchableOpacity
          style={[styles.primaryButton, loading && styles.buttonDisabled]}
          onPress={attemptBiometric}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {t('auth.biometricAction')}
            </Text>
          )}
        </TouchableOpacity>

        {/* Fallback link */}
        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.fallbackText}>{t('auth.biometricFallback')}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  error: {
    color: '#DC2626',
    fontSize: 13,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: -8,
  },
  primaryButton: {
    backgroundColor: PRIMARY,
    width: '100%',
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  fallbackButton: {
    marginTop: 16,
    paddingVertical: 8,
  },
  fallbackText: {
    color: PRIMARY,
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
