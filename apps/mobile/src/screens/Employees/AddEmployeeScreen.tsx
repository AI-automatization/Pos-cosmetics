import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EmployeesStackParamList } from '../../navigation/types';
import { useCreateEmployee } from '../../hooks/useEmployees';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';

import type { FormState, SetField } from './components/types';
import PersonalSection from './components/PersonalSection';
import WorkSection from './components/WorkSection';
import CredentialsSection from './components/CredentialsSection';

// T-379: EmergencySection, AccessSection, useBranchStore, selectedBranchId removed —
// fields not supported by backend. Backend accepts: firstName, lastName, email, password, role?, phone?

type Nav = NativeStackNavigationProp<EmployeesStackParamList, 'AddEmployee'>;

// ─── Screen ──────────────────────────────────────────────────────────────────
export default function AddEmployeeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const createEmployee = useCreateEmployee();

  const [showPassword, setShowPassword] = useState(false);

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    role: 'CASHIER',
    password: '',
    passwordConfirm: '',
  });

  const set: SetField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // ─── Validation ──────────────────────────────────────
  const validate = (): string | null => {
    if (!form.firstName.trim())  return "Ism kiritilishi shart";
    if (!form.lastName.trim())   return "Familiya kiritilishi shart";
    if (!form.email.trim())      return "Email kiritilishi shart";
    if (!/\S+@\S+\.\S+/.test(form.email)) return "Email formati noto'g'ri";
    if (!form.password)          return "Parol kiritilishi shart";
    if (form.password.length < 6) return "Parol kamida 6 ta belgi bo'lishi kerak";
    if (form.password !== form.passwordConfirm) return "Parollar mos emas";
    return null;
  };

  // ─── Submit ──────────────────────────────────────────
  const handleSubmit = () => {
    const error = validate();
    if (error) { Alert.alert(t('common.error'), error); return; }

    createEmployee.mutate(
      {
        firstName: form.firstName.trim(),
        lastName:  form.lastName.trim(),
        phone:     form.phone.trim() || undefined,
        email:     form.email.trim(),
        role:      form.role,
        password:  form.password,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.done'), t('employees.addedSuccess'));
          navigation.goBack();
        },
        onError: () => Alert.alert(t('common.error'), t('common.serverError')),
      },
    );
  };

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="close" size={22} color={Colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('employees.addTitle')}</Text>
        <TouchableOpacity
          style={[styles.saveBtn, createEmployee.isPending && styles.saveBtnDisabled]}
          onPress={handleSubmit}
          disabled={createEmployee.isPending}
        >
          <Text style={styles.saveBtnText}>{t('common.save')}</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">

          <PersonalSection form={form} set={set} />

          <WorkSection form={form} set={set} />

          <CredentialsSection
            form={form}
            set={set}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
          />

          {/* Submit */}
          <View style={styles.submitSection}>
            <TouchableOpacity
              style={[styles.submitBtn, createEmployee.isPending && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={createEmployee.isPending}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.textWhite} />
              <Text style={styles.submitBtnText}>
                {createEmployee.isPending ? 'Saqlanmoqda...' : t('employees.addTitle')}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgApp },
  kav:    { flex: 1 },
  scroll: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: Colors.bgSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.card,
    paddingTop: 52,
  },
  backBtn:          { width: 38 },
  headerTitle:      { flex: 1, ...Typography.h4, color: Colors.primary, textAlign: 'center' },
  saveBtn:          { backgroundColor: Colors.primary, paddingHorizontal: 14, paddingVertical: 7, borderRadius: Radii.md },
  saveBtnDisabled:  { opacity: 0.5 },
  saveBtnText:      { color: Colors.textWhite, fontSize: 13, fontWeight: '700' },
  submitSection:    { marginHorizontal: 16, marginTop: 20 },
  submitBtn: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: Radii.lg,
    ...Shadows.cardStrong,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText:    { color: Colors.textWhite, fontSize: 16, fontWeight: '700' },
  spacer:           { height: 60 },
});
