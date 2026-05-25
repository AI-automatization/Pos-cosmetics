import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api/auth.api';
import { useAuthStore } from '../../store/auth.store';
import { useOnboardingStore } from '../../store/onboarding.store';
import { extractErrorMessage } from '../../utils/extractErrorMessage';
import { Colors } from '../../config/theme';
import { styles } from './LoginScreen.styles';

type Props = {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'Login'>;
};

export default function LoginScreen({ navigation }: Props) {
  const { t } = useTranslation();
  const login = useAuthStore((s) => s.login);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim()) {
      setError(t('auth.emailRequired'));
      return;
    }
    if (!password) {
      setError(t('auth.passwordRequired'));
      return;
    }

    setError(null);
    setIsLoading(true);
    try {
      const response = await authApi.login(email.trim(), password);
      await login({ accessToken: response.accessToken, refreshToken: response.refreshToken }, response.user);
      navigation.replace('Biometric');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* Logo & branding */}
        <View style={styles.brandContainer}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>R</Text>
          </View>
          <Text style={styles.appName}>RAOS</Text>
          <Text style={styles.subtitle}>{t('auth.tagline', "Do'koningizni nazorat qiling")}</Text>
        </View>

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('auth.welcomeBack', 'Xush kelibsiz')}</Text>

          <Text style={styles.label}>{t('auth.email')}</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder={t('auth.emailPlaceholder')}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            placeholderTextColor={Colors.textMuted}
          />

          <Text style={styles.label}>{t('auth.password')}</Text>
          <View style={styles.passwordRow}>
            <TextInput
              style={[styles.input, styles.passwordInput]}
              value={password}
              onChangeText={setPassword}
              placeholder={t('auth.passwordPlaceholder')}
              secureTextEntry={!showPassword}
              placeholderTextColor={Colors.textMuted}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword((v) => !v)}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[styles.button, isLoading && styles.buttonDisabled]}
            onPress={() => { void handleLogin(); }}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.textWhite} />
            ) : (
              <Text style={styles.buttonText}>{t('auth.loginButton')}</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{t('auth.orBiometric', 'yoki')}</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Biometric button */}
          <TouchableOpacity
            style={styles.biometricBtn}
            onPress={() => navigation.navigate('Biometric')}
          >
            <Ionicons name="finger-print-outline" size={22} color={Colors.primary} />
            <Text style={styles.biometricText}>{t('auth.biometricLogin', 'Barmoq izi bilan kirish')}</Text>
          </TouchableOpacity>

          {/* DEV ONLY: bypass auth */}
          {__DEV__ && (
            <TouchableOpacity
              style={[styles.biometricBtn, { borderColor: '#F59E0B', marginTop: 8 }]}
              onPress={() => {
                completeOnboarding();
                void login(
                  { accessToken: 'dev-token', refreshToken: 'dev-refresh' },
                  { id: 'dev-u1', firstName: 'Ibrat', lastName: '(Dev)', email: 'dev@raos.uz', role: 'OWNER', tenantId: 'dev-tenant' }
                );
              }}
            >
              <Text style={[styles.biometricText, { color: '#F59E0B' }]}>⚡ DEV: Skip Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

