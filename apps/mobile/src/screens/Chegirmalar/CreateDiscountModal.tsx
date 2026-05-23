import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { promotionsApi } from '@/api';
import type { CreateDiscountDto } from '@/api';
import { styles, C } from './ChegirmaScreen.styles';

// ─── Types ───────────────────────────────────────────────────────────────────

type DiscountType = 'PERCENT' | 'FIXED';

const QUERY_KEY = ['promotions', 'discounts'] as const;

// ─── Props ───────────────────────────────────────────────────────────────────

interface CreateDiscountModalProps {
  readonly visible: boolean;
  readonly onClose: () => void;
  readonly onSuccess: () => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function CreateDiscountModal({ visible, onClose, onSuccess }: CreateDiscountModalProps) {
  const queryClient = useQueryClient();
  const [name, setName]         = useState('');
  const [type, setType]         = useState<DiscountType>('PERCENT');
  const [value, setValue]       = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTo, setValidTo]   = useState('');

  const resetForm = useCallback(() => {
    setName('');
    setType('PERCENT');
    setValue('');
    setValidFrom('');
    setValidTo('');
  }, []);

  const { mutate, isPending } = useMutation({
    mutationFn: (dto: CreateDiscountDto) => promotionsApi.create(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      resetForm();
      onSuccess();
    },
  });

  const handleSave = useCallback(() => {
    const trimName = name.trim();
    const numValue = parseFloat(value);
    if (!trimName || isNaN(numValue) || numValue <= 0 || !validFrom.trim()) return;

    const dto: CreateDiscountDto = {
      name: trimName,
      type,
      rules: type === 'PERCENT' ? { percent: numValue } : { amount: numValue },
      validFrom: validFrom.trim(),
      validTo: validTo.trim() || null,
      isActive: true,
    };
    mutate(dto);
  }, [name, type, value, validFrom, validTo, mutate]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalSheet}>
          <View style={styles.modalHandle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>Yangi chegirma</Text>

            {/* Name */}
            <Text style={styles.fieldLabel}>Nomi</Text>
            <TextInput
              style={styles.input}
              placeholder="Chegirma nomi"
              placeholderTextColor={C.muted}
              value={name}
              onChangeText={setName}
            />

            {/* Type toggle */}
            <Text style={styles.fieldLabel}>Turi</Text>
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[styles.toggleBtn, type === 'PERCENT' && styles.toggleBtnActive]}
                onPress={() => setType('PERCENT')}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleText, type === 'PERCENT' && styles.toggleTextActive]}>
                  Foiz (%)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleBtn, type === 'FIXED' && styles.toggleBtnActive]}
                onPress={() => setType('FIXED')}
                activeOpacity={0.75}
              >
                <Text style={[styles.toggleText, type === 'FIXED' && styles.toggleTextActive]}>
                  Miqdor (so'm)
                </Text>
              </TouchableOpacity>
            </View>

            {/* Value */}
            <Text style={styles.fieldLabel}>
              {type === 'PERCENT' ? 'Foiz miqdori (1–100)' : "So'm miqdori (UZS)"}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={type === 'PERCENT' ? 'Masalan: 15' : 'Masalan: 5000'}
              placeholderTextColor={C.muted}
              keyboardType="numeric"
              value={value}
              onChangeText={setValue}
            />

            {/* Valid from */}
            <Text style={styles.fieldLabel}>Boshlanish sanasi</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.muted}
              value={validFrom}
              onChangeText={setValidFrom}
            />

            {/* Valid to */}
            <Text style={styles.fieldLabel}>Tugash sanasi (ixtiyoriy)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={C.muted}
              value={validTo}
              onChangeText={setValidTo}
            />

            {/* Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={handleClose} activeOpacity={0.75}>
                <Text style={styles.cancelBtnText}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, isPending && styles.saveBtnDisabled]}
                onPress={handleSave}
                disabled={isPending}
                activeOpacity={0.8}
              >
                {isPending
                  ? <ActivityIndicator size="small" color={C.white} />
                  : <Text style={styles.saveBtnText}>Saqlash</Text>
                }
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
