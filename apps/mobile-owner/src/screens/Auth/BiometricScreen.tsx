import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Biometric'>;
};

export default function BiometricScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const { isAvailable, biometricType, authenticate } = useBiometricAuth();

  useEffect(() => {
    if (!isAvailable) {
      // If biometric not available, skip to app
      return;
    }
    void handleAuthenticate();
  }, [isAvailable]);

  async function handleAuthenticate() {
    const success = await authenticate();
    if (success) {
      // Navigation handled by RootNavigator (isAuthenticated = true)
    }
  }

  function handleUsePassword() {
    navigation.replace('Login');
  }

  const iconName = biometricType === 'facial' ? 'scan-outline' : 'finger-print-outline';

  return (
    <View style={styles.container}>
      <Ionicons name={iconName} size={80} color="#2563EB" />
      <Text style={styles.title}>{t('auth.biometricTitle')}</Text>
      <Text style={styles.subtitle}>{t('auth.biometricSubtitle')}</Text>

      <TouchableOpacity style={styles.button} onPress={() => { void handleAuthenticate(); }}>
        <Text style={styles.buttonText}>{t('auth.biometricPrompt')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.link} onPress={handleUsePassword}>
        <Text style={styles.linkText}>{t('auth.usePassword')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    backgroundColor: '#fff',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    marginTop: 16,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  link: {
    padding: 8,
  },
  linkText: {
    color: '#2563EB',
    fontSize: 15,
  },
});
