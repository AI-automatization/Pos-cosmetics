import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppUser, UserRole, ROLE_CONFIG } from './UserCard';
import { CreateUserBody } from '../../api/users.api';
import { fStyles } from './UserFormSheet.styles';
import FormField from './FormField';
import { useUserForm } from './useUserForm';

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
  const {
    firstName,
    lastName,
    phone,
    password,
    role,
    fieldErrors,
    isNew,
    onFirstNameChange,
    onLastNameChange,
    onPhoneChange,
    onPasswordChange,
    setRole,
    handleSave,
  } = useUserForm({ visible, user, onSave });

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
                  onChangeText={onFirstNameChange}
                  placeholder="Ism kiriting"
                  error={fieldErrors.firstName}
                />
                <FormField
                  label="Familiya"
                  value={lastName}
                  onChangeText={onLastNameChange}
                  placeholder="Familiya kiriting"
                  error={fieldErrors.lastName}
                />
                <FormField
                  label="Telefon"
                  value={phone}
                  onChangeText={onPhoneChange}
                  placeholder="+998901234567"
                  keyboardType="phone-pad"
                  error={fieldErrors.phone}
                />
                {isNew && (
                  <FormField
                    label="Parol"
                    value={password}
                    onChangeText={onPasswordChange}
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
