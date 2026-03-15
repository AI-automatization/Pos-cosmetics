import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTranslation } from 'react-i18next';
import { EmployeesStackParamList } from '../../navigation/types';
import { useCreateEmployee } from '../../hooks/useEmployees';
import { EmployeeRole } from '../../api/employees.api';
import { Colors, Radii, Shadows, Typography } from '../../config/theme';
import { useBranchStore } from '../../store/branch.store';

type Nav = NativeStackNavigationProp<EmployeesStackParamList, 'AddEmployee'>;

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormState {
  // Personal
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  dateOfBirth: string;
  passportId: string;
  address: string;
  // Emergency
  emergencyContactName: string;
  emergencyContactPhone: string;
  // Work
  hireDate: string;
  role: EmployeeRole;
  branchId: string;
  // Credentials
  login: string;
  password: string;
  passwordConfirm: string;
  // Access
  hasPosAccess: boolean;
  hasAdminAccess: boolean;
  hasReportsAccess: boolean;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ icon, title }: { icon: string; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionIcon}>{icon}</Text>
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

function Field({ label, value, onChangeText, placeholder, required, keyboardType, secureTextEntry, autoCapitalize }: FieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>
        {label}{required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder ?? ''}
        placeholderTextColor={Colors.textMuted}
        keyboardType={keyboardType ?? 'default'}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize ?? 'sentences'}
      />
    </View>
  );
}

function RoleSelector({
  value,
  onChange,
}: {
  value: EmployeeRole;
  onChange: (r: EmployeeRole) => void;
}) {
  const roles: { key: EmployeeRole; label: string }[] = [
    { key: 'cashier', label: 'Kassir' },
    { key: 'manager', label: 'Menejer' },
    { key: 'admin', label: 'Admin' },
  ];
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>Lavozim <Text style={styles.required}>*</Text></Text>
      <View style={styles.roleRow}>
        {roles.map((r) => (
          <TouchableOpacity
            key={r.key}
            style={[styles.roleBtn, value === r.key && styles.roleBtnActive]}
            onPress={() => onChange(r.key)}
          >
            <Text style={[styles.roleBtnText, value === r.key && styles.roleBtnTextActive]}>
              {r.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  sublabel,
  value,
  onChange,
}: {
  label: string;
  sublabel?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.toggleRow}>
      <View style={styles.toggleLabels}>
        <Text style={styles.toggleLabel}>{label}</Text>
        {sublabel && <Text style={styles.toggleSublabel}>{sublabel}</Text>}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: Colors.border, true: Colors.primaryMid }}
        thumbColor={value ? Colors.primary : Colors.textMuted}
      />
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function AddEmployeeScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<Nav>();
  const createEmployee = useCreateEmployee();
  const branches = useBranchStore((s) => s.branches);

  const [showPassword, setShowPassword] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branches[0]?.id ?? '');

  const [form, setForm] = useState<FormState>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    passportId: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    hireDate: new Date().toISOString().split('T')[0] ?? '',
    role: 'cashier',
    branchId: branches[0]?.id ?? '',
    login: '',
    password: '',
    passwordConfirm: '',
    hasPosAccess: true,
    hasAdminAccess: false,
    hasReportsAccess: false,
  });

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const validate = (): string | null => {
    if (!form.firstName.trim()) return "Ism kiritilishi shart";
    if (!form.lastName.trim()) return "Familiya kiritilishi shart";
    if (!form.phone.trim()) return "Telefon kiritilishi shart";
    if (!form.hireDate.trim()) return "Ishga kirish sanasi kiritilishi shart";
    if (!form.branchId) return "Filial tanlanishi shart";
    if (!form.login.trim()) return "Login kiritilishi shart";
    if (!form.password) return "Parol kiritilishi shart";
    if (form.password.length < 6) return "Parol kamida 6 ta belgi bo'lishi kerak";
    if (form.password !== form.passwordConfirm) return "Parollar mos emas";
    return null;
  };

  const handleSubmit = () => {
    const error = validate();
    if (error) {
      Alert.alert(t('common.error'), error);
      return;
    }

    createEmployee.mutate(
      {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        passportId: form.passportId || undefined,
        address: form.address || undefined,
        hireDate: form.hireDate,
        role: form.role,
        branchId: form.branchId,
        login: form.login.trim(),
        password: form.password,
        hasPosAccess: form.hasPosAccess,
        hasAdminAccess: form.hasAdminAccess,
        hasReportsAccess: form.hasReportsAccess,
        emergencyContactName: form.emergencyContactName || undefined,
        emergencyContactPhone: form.emergencyContactPhone || undefined,
      },
      {
        onSuccess: () => {
          Alert.alert(t('common.done'), t('employees.addedSuccess'));
          navigation.goBack();
        },
        onError: () => {
          Alert.alert(t('common.error'), t('common.serverError'));
        },
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
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* ── Personal info ── */}
          <View style={styles.section}>
            <SectionHeader icon="👤" title={t('employees.sectionPersonal')} />
            <Field
              label="Ism"
              required
              value={form.firstName}
              onChangeText={(v) => set('firstName', v)}
              placeholder="Sarvar"
            />
            <Field
              label="Familiya"
              required
              value={form.lastName}
              onChangeText={(v) => set('lastName', v)}
              placeholder="Qodirov"
            />
            <Field
              label="Telefon"
              required
              value={form.phone}
              onChangeText={(v) => set('phone', v)}
              placeholder="+998 90 123 45 67"
              keyboardType="phone-pad"
            />
            <Field
              label="Email"
              value={form.email}
              onChangeText={(v) => set('email', v)}
              placeholder="email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Field
              label="Tug'ilgan sana"
              value={form.dateOfBirth}
              onChangeText={(v) => set('dateOfBirth', v)}
              placeholder="1995-07-15"
            />
            <Field
              label="Pasport / ID"
              value={form.passportId}
              onChangeText={(v) => set('passportId', v)}
              placeholder="AA 1234567"
              autoCapitalize="characters"
            />
            <Field
              label="Manzil"
              value={form.address}
              onChangeText={(v) => set('address', v)}
              placeholder="Toshkent, Chilonzor"
            />
          </View>

          {/* ── Emergency contact ── */}
          <View style={styles.section}>
            <SectionHeader icon="🆘" title={t('employees.sectionEmergency')} />
            <Field
              label="Shoshilinch aloqa ismi"
              value={form.emergencyContactName}
              onChangeText={(v) => set('emergencyContactName', v)}
              placeholder="Familiya Ismi (qarindoshi)"
            />
            <Field
              label="Shoshilinch aloqa telefoni"
              value={form.emergencyContactPhone}
              onChangeText={(v) => set('emergencyContactPhone', v)}
              placeholder="+998 91 234 56 78"
              keyboardType="phone-pad"
            />
          </View>

          {/* ── Work info ── */}
          <View style={styles.section}>
            <SectionHeader icon="💼" title={t('employees.sectionWork')} />
            <Field
              label="Ishga kirish sanasi"
              required
              value={form.hireDate}
              onChangeText={(v) => set('hireDate', v)}
              placeholder="2024-01-15"
            />
            <RoleSelector value={form.role} onChange={(r) => set('role', r)} />
            {/* Branch selector */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Filial <Text style={styles.required}>*</Text></Text>
              <View style={styles.branchRow}>
                {branches.length > 0 ? branches.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.roleBtn, selectedBranchId === b.id && styles.roleBtnActive]}
                    onPress={() => {
                      setSelectedBranchId(b.id);
                      set('branchId', b.id);
                    }}
                  >
                    <Text style={[styles.roleBtnText, selectedBranchId === b.id && styles.roleBtnTextActive]}>
                      {b.name}
                    </Text>
                  </TouchableOpacity>
                )) : (
                  <Text style={styles.noBranch}>Filiallar yuklanmagan</Text>
                )}
              </View>
            </View>
          </View>

          {/* ── Credentials ── */}
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
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  value={form.password}
                  onChangeText={(v) => set('password', v)}
                  placeholder="Kamida 6 ta belgi"
                  placeholderTextColor={Colors.textMuted}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword((v) => !v)}
                >
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

          {/* ── Access permissions ── */}
          <View style={styles.section}>
            <SectionHeader icon="🛡️" title={t('employees.sectionAccess')} />
            <ToggleRow
              label={t('employees.posAccess')}
              sublabel="Kassir mobil ilovasi (POS)"
              value={form.hasPosAccess}
              onChange={(v) => set('hasPosAccess', v)}
            />
            <View style={styles.toggleDivider} />
            <ToggleRow
              label={t('employees.adminAccess')}
              sublabel="Admin panel (web)"
              value={form.hasAdminAccess}
              onChange={(v) => set('hasAdminAccess', v)}
            />
            <View style={styles.toggleDivider} />
            <ToggleRow
              label={t('employees.reportsAccess')}
              sublabel="Hisobotlarni ko'rish"
              value={form.hasReportsAccess}
              onChange={(v) => set('hasReportsAccess', v)}
            />
          </View>

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

          <View style={{ height: 60 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgApp },
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
  backBtn: { width: 38 },
  headerTitle: { flex: 1, ...Typography.h4, color: Colors.primary, textAlign: 'center' },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radii.md,
  },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: Colors.textWhite, fontSize: 13, fontWeight: '700' },
  scroll: { flex: 1 },
  section: {
    backgroundColor: Colors.bgSurface,
    marginTop: 12,
    marginHorizontal: 16,
    borderRadius: Radii.lg,
    padding: 16,
    ...Shadows.card,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  sectionIcon: { fontSize: 18 },
  sectionTitle: {
    ...Typography.bodyMedium,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
  field: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  required: { color: Colors.danger },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgApp,
  },
  passwordRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    backgroundColor: Colors.bgApp,
  },
  roleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  branchRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  roleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSubtle,
  },
  roleBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  roleBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  roleBtnTextActive: { color: Colors.primary },
  noBranch: { fontSize: 13, color: Colors.textMuted, fontStyle: 'italic' },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  toggleLabels: { flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  toggleSublabel: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  toggleDivider: { height: 1, backgroundColor: Colors.borderLight, marginVertical: 8 },
  submitSection: { marginHorizontal: 16, marginTop: 20 },
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
  submitBtnText: { color: Colors.textWhite, fontSize: 16, fontWeight: '700' },
});
