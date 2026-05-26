import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
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
import { useScreenProtection } from '../../hooks/useScreenProtection';
import Constants from 'expo-constants';
import { styles, COLORS } from './LoginScreen.styles';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const raosLogo = require('../../assets/raos-logo.png');

const LANGS = [
  { code: 'uz', label: "O'ZBEK" },
  { code: 'ru', label: 'RUSSIAN' },
  { code: 'en', label: 'ENGLISH' },
];

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  useScreenProtection();
  const { i18n } = useTranslation();
  const { isAvailable: biometricAvailable } = useBiometricAuth();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Focus styling — ref-based to avoid re-renders that dismiss keyboard
  const emailWrapperRef = useRef<View>(null);
  const passwordWrapperRef = useRef<View>(null);

  const applyFocusStyle = useCallback((ref: React.RefObject<View | null>) => {
    ref.current?.setNativeProps({
      style: { borderColor: COLORS.borderFocus, elevation: 2 },
    });
  }, []);

  const removeFocusStyle = useCallback((ref: React.RefObject<View | null>) => {
    ref.current?.setNativeProps({
      style: { borderColor: COLORS.border, elevation: 0 },
    });
  }, []);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Xatolik', "Barcha maydonlarni to'ldiring");
      return;
    }
    setLoading(true);
    let tokenStored = false;
    try {
      const res = await authApi.login({ email: email.trim(), password });
      await SecureStore.setItemAsync('access_token', res.accessToken);
      tokenStored = true;
      const me = await authApi.me();
      await setUser(me, res.accessToken, res.refreshToken);
    } catch (err) {
      // Agar token saqlangan bo'lsa lekin me() muvaffaqiyatsiz bo'lsa — eski state bilan
      // aralash holat qoldirmaslik uchun access_token o'chirib tashla
      if (tokenStored) {
        await SecureStore.deleteItemAsync('access_token');
      }
      const msg = extractErrorMessage(err);
      if (msg === 'SLUG_REQUIRED') {
        Alert.alert(
          'Xatolik',
          "Bir nechta tashkilotda ro'yxatdan o'tgansiz. Slug kerak.",
        );
      } else {
        Alert.alert('Xatolik', msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="always"
          keyboardDismissMode="none"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Logo ── */}
          <View style={styles.logoArea}>
            <Image source={raosLogo} style={styles.logoImage} />
            <Text style={styles.logoText}>RAOS</Text>
            <Text style={styles.subtitle}>Biznesingizni boshqaring</Text>
          </View>

          {/* ── Form ── */}
          <View style={styles.form}>

            {/* Email */}
            <Text style={styles.label}>Elektron pochta</Text>
            <View ref={emailWrapperRef} style={styles.inputWrapper}>
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
                onFocus={() => applyFocusStyle(emailWrapperRef)}
                onBlur={() => removeFocusStyle(emailWrapperRef)}
              />
            </View>

            {/* Password */}
            <View style={styles.labelRow}>
              <Text style={styles.label}>Parol</Text>
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotText}>Parolni unutdingizmi?</Text>
              </TouchableOpacity>
            </View>
            <View ref={passwordWrapperRef} style={styles.inputWrapper}>
              <Feather name="lock" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputPasswordField]}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                editable={!loading}
                onFocus={() => applyFocusStyle(passwordWrapperRef)}
                onBlur={() => removeFocusStyle(passwordWrapperRef)}
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
                <Text style={styles.loginButtonText}>Kirish</Text>
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

          <Text style={styles.versionText}>v{Constants.expoConfig?.version ?? '0.0.0'}</Text>

          {/* DEV only — haqiqiy API bilan demo login */}
          {__DEV__ && (
            <TouchableOpacity
              style={styles.demoButton}
              disabled={loading}
              onPress={async () => {
                setLoading(true);
                try {
                  const demoEmail = 'owner@raos.uz';
                  const demoPass = 'Demo1234!';
                  const res = await authApi.login({ email: demoEmail, password: demoPass });
                  await SecureStore.setItemAsync('access_token', res.accessToken);
                  const me = await authApi.me();
                  await setUser(me, res.accessToken, res.refreshToken);
                } catch (err) {
                  const msg = extractErrorMessage(err);
                  Alert.alert('Demo kirish xatosi', msg);
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={styles.demoText}>Demo kirish</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
    </SafeAreaView>
  );
}
