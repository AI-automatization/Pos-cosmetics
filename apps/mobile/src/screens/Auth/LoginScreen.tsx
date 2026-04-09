import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types';
import { authApi } from '../../api';
import { useAuthStore } from '../../store/auth.store';
import { extractErrorMessage } from '../../utils/error';
import { useBiometricAuth } from '../../hooks/useBiometricAuth';

const COLORS = {
  primary: '#5B5BD6',
  primaryLight: 'rgba(91, 91, 214, 0.1)',
  background: '#F5F5F7',
  white: '#FFFFFF',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  label: '#374151',
};

const LANGS = [
  { code: 'uz', label: "O'ZBEK" },
  { code: 'ru', label: 'RUSSIAN' },
  { code: 'en', label: 'ENGLISH' },
];

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { i18n } = useTranslation();
  const { isAvailable: biometricAvailable } = useBiometricAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [slug, setSlug] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!slug.trim() || !email.trim() || !password.trim()) return;
    setLoading(true);
    try {
      await SecureStore.setItemAsync('tenant_slug', slug.trim());
      const res = await authApi.login({ slug: slug.trim(), email: email.trim(), password });
      await SecureStore.setItemAsync('access_token', res.accessToken);
      const me = await authApi.me();
      await setUser(me, res.accessToken, res.refreshToken ?? '');
    } catch (err) {
      const msg = extractErrorMessage(err);
      Alert.alert('Xatolik', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoArea}>
            <View style={styles.logoBox}>
              <Text style={styles.logoLetter}>R</Text>
            </View>
            <Text style={styles.logoText}>RAOS</Text>
            <Text style={styles.subtitle}>Savdo tizimiga xush kelibsiz</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>

            {/* Slug */}
            <Text style={styles.label}>Tashkilot kodi</Text>
            <View style={styles.inputWrapper}>
              <Feather name="briefcase" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={slug}
                onChangeText={setSlug}
                placeholder="kosmetika-demo"
                placeholderTextColor={COLORS.textMuted}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Email */}
            <Text style={[styles.label, { marginTop: 16 }]}>Elektron pochta</Text>
            <View style={styles.inputWrapper}>
              <Feather name="mail" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="example@mail.com"
                placeholderTextColor={COLORS.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>Parol</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotText}>Parolni unutdingizmi?</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPasswordField]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword((v) => !v)}
                style={styles.eyeButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Feather
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={18}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.loginButtonText}>Kirish →</Text>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerLabel}>YOKI</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Biometric button */}
            {biometricAvailable && (
              <TouchableOpacity
                style={styles.biometricButton}
                onPress={() => navigation.navigate('Biometric')}
                activeOpacity={0.8}
              >
                <Ionicons name="finger-print-outline" size={20} color={COLORS.primary} />
                <Text style={styles.biometricText}>Barmoq izi bilan kirish</Text>
              </TouchableOpacity>
            )}

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerText}>Hisobingiz yo'qmi? </Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.registerLink}>Ro'yxatdan o'ting</Text>
              </TouchableOpacity>
            </View>

            {/* Language selector */}
            <View style={styles.langRow}>
              {LANGS.map((lang, i) => (
                <React.Fragment key={lang.code}>
                  {i > 0 && <Text style={styles.langSep}>|</Text>}
                  <TouchableOpacity
                    onPress={() => i18n.changeLanguage(lang.code)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.langText,
                        i18n.language === lang.code && styles.langTextActive,
                      ]}
                    >
                      {lang.label}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              ))}
            </View>
          </View>

          {/* DEV only */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.demoButton}
              onPress={() =>
                setUser(
                  {
                    id: 'demo',
                    email: 'demo@raos.uz',
                    firstName: 'Demo',
                    lastName: 'User',
                    role: 'OWNER',
                    tenantId: 'demo-tenant',
                    tenant: { id: 'demo-tenant', name: "Demo Do'kon", slug: 'demo' },
                  },
                  'demo-access-token',
                  'demo-refresh-token',
                )
              }
            >
              <Text style={styles.demoText}>🧪 Demo kirish</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },

  // ── Logo ──
  logoArea: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 8,
  },
  logoLetter: {
    color: COLORS.white,
    fontSize: 34,
    fontWeight: '800',
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 3,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // ── Form ──
  form: {
    gap: 0,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.label,
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: COLORS.textPrimary,
  },
  inputPasswordField: {
    paddingRight: 4,
  },
  eyeButton: {
    paddingLeft: 8,
  },

  // ── Login Button ──
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    opacity: 0.65,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // ── Divider ──
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerLabel: {
    marginHorizontal: 12,
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    letterSpacing: 1.5,
  },

  // ── Biometric ──
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    height: 52,
    gap: 10,
    backgroundColor: COLORS.white,
  },
  biometricText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
  },

  // ── Register ──
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },

  // ── Language ──
  langRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    gap: 10,
  },
  langSep: {
    color: COLORS.border,
    fontSize: 13,
  },
  langText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  langTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  // ── Dev Demo ──
  demoButton: {
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 16,
  },
  demoText: {
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
});
