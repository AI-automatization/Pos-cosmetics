import React, { useState, useEffect } from 'react';
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
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppUser } from './UserCard';
import { fStyles } from './UserFormSheet';

// ─── PasswordResetSheet ──────────────────────────────

interface PasswordResetSheetProps {
  readonly visible: boolean;
  readonly user: AppUser | null;
  readonly onClose: () => void;
  readonly onSave: (newPassword: string) => void;
  readonly isSaving: boolean;
}

function PasswordResetSheet({ visible, user, onClose, onSave, isSaving }: PasswordResetSheetProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (visible) {
      setPassword('');
      setShowPassword(false);
    }
  }, [visible]);

  const canSave = password.trim().length >= 6;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={fStyles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={fStyles.kavWrapper}
          >
            <View style={fStyles.sheet}>
              <View style={fStyles.handle} />
              <View style={fStyles.sheetHeader}>
                <Text style={fStyles.sheetTitle}>Parol tiklash</Text>
                <TouchableOpacity style={fStyles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {user && (
                <Text style={pwStyles.userName}>
                  {user.firstName} {user.lastName}
                </Text>
              )}

              <View style={fStyles.fieldWrap}>
                <Text style={fStyles.fieldLabel}>Yangi parol</Text>
                <View style={pwStyles.passwordRow}>
                  <TextInput
                    style={pwStyles.passwordInput}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Kamida 6 belgi"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    autoFocus
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword((v) => !v)}
                    style={pwStyles.eyeBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>
                {password.length > 0 && password.length < 6 && (
                  <Text style={pwStyles.hint}>Kamida 6 belgi bo'lishi kerak</Text>
                )}
              </View>

              <TouchableOpacity
                style={[fStyles.saveBtn, (!canSave || isSaving) && fStyles.saveBtnDisabled]}
                onPress={() => canSave && onSave(password.trim())}
                disabled={!canSave || isSaving}
                activeOpacity={0.8}
              >
                {isSaving ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={fStyles.saveBtnText}>Parolni tiklash</Text>
                )}
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

export default PasswordResetSheet;

// ─── Password reset styles ──────────────────────────

const pwStyles = StyleSheet.create({
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 16,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#111827',
  },
  eyeBtn: {
    paddingHorizontal: 12,
  },
  hint: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});
