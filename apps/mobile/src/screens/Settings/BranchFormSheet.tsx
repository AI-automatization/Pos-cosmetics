import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Modal,
  KeyboardAvoidingView,
  Keyboard,
  Platform,
  ScrollView,
  ActivityIndicator,
  TextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { Branch, CreateBranchBody } from '../../api/branches.api';
import { fStyles } from './BranchesScreen.styles';

// ─── FormField ────────────────────────────────────────

interface FormFieldProps {
  readonly label: string;
  readonly value: string;
  readonly onChangeText: (text: string) => void;
  readonly placeholder: string;
  readonly keyboardType?: TextInputProps['keyboardType'];
}

function FormField({ label, value, onChangeText, placeholder, keyboardType }: FormFieldProps) {
  return (
    <View style={fStyles.fieldWrap}>
      <Text style={fStyles.fieldLabel}>{label}</Text>
      <TextInput
        style={fStyles.fieldInput}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9CA3AF"
        keyboardType={keyboardType}
      />
    </View>
  );
}

// ─── BranchFormSheet ──────────────────────────────────

interface BranchFormSheetProps {
  readonly visible: boolean;
  readonly branch: Branch | null;
  readonly onClose: () => void;
  readonly onSave: (body: CreateBranchBody) => void;
  readonly isSaving: boolean;
}

export default function BranchFormSheet({ visible, branch, onClose, onSave, isSaving }: BranchFormSheetProps) {
  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone]     = useState('');

  useEffect(() => {
    if (visible) {
      setName(branch?.name ?? '');
      setAddress(branch?.address ?? '');
      setPhone(branch?.phone ?? '');
    }
  }, [visible, branch]);

  const isNew   = !branch;
  const canSave = name.trim().length > 0 && address.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      address: address.trim(),
      phone: phone.trim() || undefined,
    });
  };

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
                <Text style={fStyles.sheetTitle}>
                  {isNew ? 'Yangi filial' : 'Tahrirlash'}
                </Text>
                <TouchableOpacity style={fStyles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <FormField
                  label="Nomi"
                  value={name}
                  onChangeText={setName}
                  placeholder="Filial nomini kiriting"
                />
                <FormField
                  label="Manzil"
                  value={address}
                  onChangeText={setAddress}
                  placeholder="Manzilni kiriting"
                />
                <FormField
                  label="Telefon (ixtiyoriy)"
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="+998901234567"
                  keyboardType="phone-pad"
                />

                <TouchableOpacity
                  style={[fStyles.saveBtn, (!canSave || isSaving) && fStyles.saveBtnDisabled]}
                  onPress={handleSave}
                  disabled={!canSave || isSaving}
                  activeOpacity={0.8}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={fStyles.saveBtnText}>{isNew ? "Qo'shish" : 'Saqlash'}</Text>
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
