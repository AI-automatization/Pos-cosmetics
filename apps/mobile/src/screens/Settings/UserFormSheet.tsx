import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppUser, UserRole, ROLE_CONFIG } from './UserCard';
import { CreateUserBody } from '../../api/users.api';
import { userSchema, extractFieldErrors } from '../../validation/user.schema';

// ─── FormField ────────────────────────────────────────

interface FormFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder: string;
  readonly keyboardType?: TextInputProps['keyboardType'];
  readonly secureTextEntry?: boolean;
  readonly error?: string;
}

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  error,
}: FormFieldProps) {
  return (
    <View style={fStyles.fieldWrap}>
      <Text style={fStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={[fStyles.fieldInput, error ? fStyles.fieldInputError : undefined]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
      />
      {error ? <Text style={fStyles.fieldError}>{error}</Text> : null}
    </View>
  );
}

// ─── UserFormSheet ────────────────────────────────────

interface UserFormSheetProps {
  readonly visible: boolean;
  readonly user: AppUser | null;
  readonly onClose: () => void;
  readonly onSave: (body: CreateUserBody) => void;
  readonly isSaving: boolean;
}

function UserFormSheet({
  visible,
  user,
  onClose,
  onSave,
  isSaving,
}: UserFormSheetProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [role, setRole]           = useState<UserRole>('CASHIER');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) {
      setFirstName(user?.firstName ?? '');
      setLastName(user?.lastName ?? '');
      setPhone(user?.phone ?? '');
      setPassword('');
      setRole(user?.role ?? 'CASHIER');
      setFieldErrors({});
    }
  }, [visible, user]);

  const isNew = !user;

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleFirstNameChange = useCallback((text: string) => {
    setFirstName(text);
    clearFieldError('firstName');
  }, [clearFieldError]);

  const handleLastNameChange = useCallback((text: string) => {
    setLastName(text);
    clearFieldError('lastName');
  }, [clearFieldError]);

  const handlePhoneChange = useCallback((text: string) => {
    setPhone(text);
    clearFieldError('phone');
  }, [clearFieldError]);

  const handlePasswordChange = useCallback((text: string) => {
    setPassword(text);
    clearFieldError('password');
  }, [clearFieldError]);

  const pickRole = () => {
    const roles: UserRole[] = ['OWNER', 'ADMIN', 'MANAGER', 'CASHIER', 'VIEWER'];
    Alert.alert(
      'Rol tanlash',
      undefined,
      [
        ...roles.map((r) => ({
          text: ROLE_CONFIG[r].label,
          onPress: () => setRole(r),
        })),
        { text: 'Bekor', style: 'cancel' as const },
      ],
    );
  };

  const handleSave = () => {
    const formData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: '',
      phone: phone.trim() || undefined,
      password: password || undefined,
      role,
    };

    const result = userSchema.safeParse(formData);

    if (!result.success) {
      const errors = extractFieldErrors(result.error);

      // Yangi user uchun parol majburiy -- zod schema da optional bo'lgani uchun alohida tekshiramiz
      if (isNew && !password.trim()) {
        errors.password = 'Parol kiritilishi shart';
      }

      setFieldErrors(errors);
      return;
    }

    // Yangi user uchun parol majburiy -- alohida tekshiruv
    if (isNew && !password.trim()) {
      setFieldErrors({ password: 'Parol kiritilishi shart' });
      return;
    }

    setFieldErrors({});
    onSave({
      firstName: result.data.firstName,
      lastName: result.data.lastName,
      email: result.data.email ?? '',
      phone: result.data.phone || undefined,
      password: password,
      role,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={fStyles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={fStyles.kavWrapper}
          >
            <View style={fStyles.sheet}>
              <View style={fStyles.handle} />

              <View style={fStyles.sheetHeader}>
                <Text style={fStyles.sheetTitle}>
                  {isNew ? 'Yangi foydalanuvchi' : 'Tahrirlash'}
                </Text>
                <TouchableOpacity style={fStyles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <FormField
                  label="Ism"
                  value={firstName}
                  onChangeText={handleFirstNameChange}
                  placeholder="Ism kiriting"
                  error={fieldErrors.firstName}
                />
                <FormField
                  label="Familiya"
                  value={lastName}
                  onChangeText={handleLastNameChange}
                  placeholder="Familiya kiriting"
                  error={fieldErrors.lastName}
                />
                <FormField
                  label="Telefon"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  placeholder="+998901234567"
                  keyboardType="phone-pad"
                  error={fieldErrors.phone}
                />
                {isNew && (
                  <FormField
                    label="Parol"
                    value={password}
                    onChangeText={handlePasswordChange}
                    placeholder="Parol kiriting"
                    secureTextEntry
                    error={fieldErrors.password}
                  />
                )}

                <Text style={fStyles.fieldLabel}>Rol</Text>
                <TouchableOpacity
                  style={fStyles.rolePicker}
                  onPress={pickRole}
                  activeOpacity={0.75}
                >
                  <View
                    style={[
                      fStyles.rolePickerBadge,
                      { backgroundColor: ROLE_CONFIG[role].bg },
                    ]}
                  >
                    <Text
                      style={[
                        fStyles.rolePickerBadgeText,
                        { color: ROLE_CONFIG[role].text },
                      ]}
                    >
                      {ROLE_CONFIG[role].label}
                    </Text>
                  </View>
                  <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    fStyles.saveBtn,
                    isSaving && fStyles.saveBtnDisabled,
                  ]}
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={fStyles.saveBtnText}>
                      {isNew ? "Qo'shish" : 'Saqlash'}
                    </Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default UserFormSheet;

// ─── Form sheet styles ────────────────────────────────

export const fStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kavWrapper: {
    width: '100%',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldWrap: {
    marginBottom: 14,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  fieldInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#FAFAFA',
  },
  fieldInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  fieldError: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontWeight: '500',
  },
  rolePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  rolePickerBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  rolePickerBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  saveBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
