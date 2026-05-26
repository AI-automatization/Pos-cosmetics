import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CreateSupplierDto, UpdateSupplierDto } from '../../api/catalog.api';
import { C, sheet } from './SuppliersScreen.styles';

// ─── FormRow ────────────────────────────────────────────
function FormRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={sheet.row}>
      <Text style={sheet.rowLabel}>{label}</Text>
      {children}
    </View>
  );
}

// ─── SupplierFormSheet ──────────────────────────────────
interface SupplierFormSheetProps {
  readonly visible: boolean;
  readonly supplier: { name: string; phone?: string | null; company?: string | null; address?: string | null } | null;
  readonly onClose: () => void;
  readonly onSave: (dto: CreateSupplierDto | UpdateSupplierDto) => void;
  readonly isSaving: boolean;
}

export default function SupplierFormSheet({
  visible,
  supplier,
  onClose,
  onSave,
  isSaving,
}: SupplierFormSheetProps) {
  const [name, setName]       = useState('');
  const [phone, setPhone]     = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');

  React.useEffect(() => {
    if (visible) {
      setName(supplier?.name ?? '');
      setPhone(supplier?.phone ?? '');
      setCompany(supplier?.company ?? '');
      setAddress(supplier?.address ?? '');
    }
  }, [visible, supplier]);

  const canSave = name.trim().length > 0;

  const handleSave = () => {
    if (!canSave || isSaving) return;
    onSave({
      name: name.trim(),
      phone: phone.trim() || undefined,
      company: company.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheet.backdrop} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sheet.wrapper}
      >
        <View style={sheet.panel}>
          <View style={sheet.handle} />

          <View style={sheet.header}>
            <View style={sheet.iconCircle}>
              <Ionicons name="business-outline" size={22} color={C.primary} />
            </View>
            <Text style={sheet.title}>
              {supplier ? 'Yetkazib beruvchini tahrirlash' : 'Yangi yetkazib beruvchi'}
            </Text>
          </View>

          <FormRow label="Ism *">
            <TextInput
              style={sheet.input}
              value={name}
              onChangeText={setName}
              placeholder="Abdullayev Jamshid"
              placeholderTextColor={C.muted}
            />
          </FormRow>
          <FormRow label="Telefon">
            <TextInput
              style={sheet.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+998 90 000 00 00"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
            />
          </FormRow>
          <FormRow label="Kompaniya">
            <TextInput
              style={sheet.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Jamshid Group LLC"
              placeholderTextColor={C.muted}
            />
          </FormRow>
          <FormRow label="Manzil">
            <TextInput
              style={sheet.input}
              value={address}
              onChangeText={setAddress}
              placeholder="Toshkent, Chilonzor tumani"
              placeholderTextColor={C.muted}
            />
          </FormRow>

          <TouchableOpacity
            style={[sheet.saveBtn, !canSave && sheet.saveBtnDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!canSave || isSaving}
          >
            {isSaving
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.saveBtnText}>
                  {supplier ? 'Saqlash' : "Qo'shish"}
                </Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
