import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '@/navigation/types';
import { useBiometricAuth } from '@/hooks/useBiometricAuth';
import { useAuthStore } from '@/store/auth.store';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Biometric'>;
};

export default function BiometricScreen({ navigation }: Props): React.JSX.Element {
  const { t } = useTranslation();
  const { isAvailable, isEnrolled, authenticate } = useBiometricAuth();
  const { loadUser } = useAuthStore();

  useEffect(() => {
    if (!isAvailable || !isEnrolled) {
      Alert.alert(t('common.error'), 'Qurilmada barmoq izi mavjud emas', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    }
  }, [isAvailable, isEnrolled, navigation, t]);

  const handleBiometric = async (): Promise<void> => {
    const success = await authenticate();
    if (success) {
      await loadUser();
    } else {
      Alert.alert(t('common.error'), 'Barmoq izi tanilmadi');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔐</Text>
      <Text style={styles.title}>{t('auth.biometric')}</Text>

      <TouchableOpacity style={styles.button} onPress={handleBiometric} accessibilityRole="button">
        <Text style={styles.buttonText}>{t('auth.biometric')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        accessibilityRole="button"
      >
        <Text style={styles.backText}>{t('common.cancel')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 24,
    gap: 16,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#1a56db',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  backButton: {
    paddingVertical: 12,
    minHeight: 48,
    justifyContent: 'center',
  },
  backText: {
    color: '#6b7280',
    fontSize: 15,
  },
});
