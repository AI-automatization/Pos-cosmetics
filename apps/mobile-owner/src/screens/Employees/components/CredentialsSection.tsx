import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Colors, Radii, Shadows } from '../../../config/theme';
import SectionHeader from './SectionHeader';
import Field from './Field';
import type { FormState, SetField } from './types';

interface CredentialsSectionProps {
  readonly form: FormState;
  readonly set: SetField;
  readonly showPassword: boolean;
  readonly onTogglePassword: () => void;
}

export default function CredentialsSection({
  form,
  set,
  showPassword,
  onTogglePassword,
}: CredentialsSectionProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <SectionHeader icon="🔐" title={t('employees.sectionCredentials')} />
      <Field
        label="Login"
        required
        value={form.login}
        onChangeText={(v) => set('login', v)}
        placeholder="sarvar.kassir"
        autoCapitalize="none"
      />

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>
          Parol <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={styles.passwordInput}
            value={form.password}
            onChangeText={(v) => set('password', v)}
            placeholder="Kamida 6 ta belgi"
            placeholderTextColor={Colors.textMuted}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.eyeBtn} onPress={onTogglePassword}>
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={Colors.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>

      <Field
        label="Parolni tasdiqlang"
        required
        value={form.passwordConfirm}
        onChangeText={(v) => set('passwordConfirm', v)}
        placeholder="Parolni qayta kiriting"
        secureTextEntry={!showPassword}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: Colors.bgSurface,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  field: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.danger,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgApp,
  },
  eyeBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgApp,
  },
});
