import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';
import type { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';
import { extractErrorMessage } from '../../utils/error';

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
        <Text style={styles.icon}>👆</Text>
        <Text style={styles.title}>{t('auth.biometricPrompt')}</Text>

        {loading && <ActivityIndicator size="large" color="#6366F1" style={styles.spinner} />}

        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.retryButton} onPress={attemptBiometric} disabled={loading}>
          <Text style={styles.retryText}>Qayta urinish</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.fallbackButton}
          onPress={() => navigation.navigate('Login')}
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
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 24,
  },
  spinner: {
    marginVertical: 16,
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
    marginBottom: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  fallbackButton: {
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  fallbackText: {
    color: '#6366F1',
    fontSize: 14,
  },
});
