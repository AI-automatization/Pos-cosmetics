import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
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
import { Colors, Radii, Shadows } from '../../config/theme';

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bgApp,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 24,
  },
  brandContainer: {
    alignItems: 'center',
    gap: 8,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.cardStrong,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textWhite,
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: Colors.bgSurface,
    borderRadius: Radii.lg,
    padding: 24,
    gap: 8,
    ...Shadows.cardStrong,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 15,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgSubtle,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    color: Colors.danger,
    fontSize: 13,
    marginTop: 2,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radii.md,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '700',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: 12,
    color: Colors.textMuted,
  },
  biometricBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primaryLight,
  },
  biometricText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
