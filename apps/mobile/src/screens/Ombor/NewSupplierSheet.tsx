import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation } from '@tanstack/react-query';
import { catalogApi } from '../../api/catalog.api';
import type { Supplier } from '../../api/catalog.api';
import { C } from './OmborColors';

// ─── Constants ──────────────────────────────────────────
const MIN_NAME_LENGTH = 2;

// ─── Props ──────────────────────────────────────────────
interface NewSupplierSheetProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
  readonly supplier?: Supplier | null;
}

// ─── Component ──────────────────────────────────────────
export default function NewSupplierSheet({
  visible,
  onClose,
  onSuccess,
  supplier,
}: NewSupplierSheetProps): React.JSX.Element {
  const isEdit = !!supplier;

  // ── Form state ────────────────────────────────────────
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [nameError, setNameError] = useState('');

  // ── Reset fields on visibility change ─────────────────
  useEffect(() => {
    if (visible) {
      setName(supplier?.name ?? '');
      setPhone(supplier?.phone ?? '');
      setCompany(supplier?.company ?? '');
      setAddress(supplier?.address ?? '');
      setNameError('');
    }
  }, [visible, supplier]);

  // ── Validation ────────────────────────────────────────
  const isNameValid = name.trim().length >= MIN_NAME_LENGTH;

  const handleNameBlur = () => {
    if (name.trim().length > 0 && !isNameValid) {
      setNameError('Kamida 2 ta belgi kiriting');
    } else {
      setNameError('');
    }
  };

  // ── Mutation ──────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: () => {
      const dto = {
        name: name.trim(),
        phone: phone.trim() || undefined,
        company: company.trim() || undefined,
        address: address.trim() || undefined,
      };
      return isEdit
        ? catalogApi.updateSupplier(supplier!.id, dto)
        : catalogApi.createSupplier(dto);
    },
    onSuccess: () => onSuccess(),
  });

  const handleSubmit = () => {
    if (!isNameValid || mutation.isPending) return;
    mutation.mutate();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Overlay */}
      <TouchableWithoutFeedback onPress={onClose} accessible={false}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      {/* Bottom sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}
      >
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>
              {isEdit ? 'Tahrirlash' : 'Yangi yetkazib beruvchi'}
            </Text>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={onClose}
              activeOpacity={0.7}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={20} color={C.secondary} />
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={styles.formBody}>
            {/* Name */}
            <View style={styles.fieldWrap}>
              <TextInput
                style={[styles.input, nameError ? styles.inputError : null]}
                value={name}
                onChangeText={(v) => { setName(v); setNameError(''); }}
                onBlur={handleNameBlur}
                placeholder="Yetkazib beruvchi nomi *"
                placeholderTextColor={C.muted}
                autoCapitalize="words"
              />
              {nameError ? (
                <Text style={styles.errorText}>{nameError}</Text>
              ) : null}
            </View>

            {/* Phone */}
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+998 XX XXX XX XX"
              placeholderTextColor={C.muted}
              keyboardType="phone-pad"
            />

            {/* Company */}
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="Kompaniya nomi"
              placeholderTextColor={C.muted}
            />

            {/* Address */}
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              value={address}
              onChangeText={setAddress}
              placeholder="Manzil"
              placeholderTextColor={C.muted}
              multiline
            />

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, (!isNameValid || mutation.isPending) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              activeOpacity={0.85}
              disabled={!isNameValid || mutation.isPending}
            >
              {mutation.isPending ? (
                <ActivityIndicator size="small" color={C.white} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {isEdit ? 'Saqlash' : "Qo'shish"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Mutation error */}
            {mutation.isError && (
              <Text style={styles.mutationError}>
                Xatolik yuz berdi. Qaytadan urinib ko'ring.
              </Text>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },

  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 36,
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },

  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  sheetTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  formBody: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },

  fieldWrap: {
    gap: 4,
  },

  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: C.text,
  },
  inputError: {
    borderColor: C.red,
  },
  inputMultiline: {
    maxHeight: 80,
    textAlignVertical: 'top',
  },

  errorText: {
    fontSize: 12,
    color: C.red,
    marginLeft: 4,
  },

  submitBtn: {
    backgroundColor: C.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    marginTop: 4,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },

  mutationError: {
    fontSize: 13,
    color: C.red,
    textAlign: 'center',
  },
});
