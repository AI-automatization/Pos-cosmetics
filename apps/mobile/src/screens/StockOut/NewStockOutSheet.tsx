// NewStockOutSheet.tsx — hisobdan chiqarish modal komponenti

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { UseMutationResult } from '@tanstack/react-query';
import { extractErrorMessage } from '../../utils/error';
import { C } from './StockOutColors';
import type { StockLevel, WriteOffPayload, WriteOffResponse, WriteOffReason } from './StockOutTypes';
import ProductInfoCard from './ProductInfoCard';
import ReasonPicker from './ReasonPicker';
import { styles } from './NewStockOutSheet.styles';

interface NewStockOutSheetProps {
  readonly visible:          boolean;
  readonly selectedItem:     StockLevel | null;
  readonly writeOffMutation: UseMutationResult<WriteOffResponse, Error, WriteOffPayload>;
  readonly onClose:          () => void;
  readonly onSuccess:        () => void;
}

export default function NewStockOutSheet({
  visible,
  selectedItem,
  writeOffMutation,
  onClose,
  onSuccess,
}: NewStockOutSheetProps) {
  const [qty,    setQty]    = useState('');
  const [reason, setReason] = useState<WriteOffReason>('DAMAGED');
  const [note,   setNote]   = useState('');

  const resetForm = useCallback(() => {
    setQty('');
    setReason('DAMAGED');
    setNote('');
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async () => {
    if (!selectedItem) return;

    const parsedQty = parseFloat(qty.replace(',', '.'));

    if (!qty.trim() || isNaN(parsedQty)) {
      Alert.alert('Xatolik', "Miqdorni kiriting");
      return;
    }
    if (parsedQty <= 0) {
      Alert.alert('Xatolik', "Miqdor 0 dan katta bo'lishi kerak");
      return;
    }
    if (parsedQty > selectedItem.totalQty) {
      Alert.alert(
        'Xatolik',
        `Mavjud qoldiqdan oshib ketdi. Maksimal: ${selectedItem.totalQty} dona`,
      );
      return;
    }

    const payload: WriteOffPayload = {
      items: [{ productId: selectedItem.productId, qty: parsedQty }],
      reason,
      note: note.trim() || undefined,
      warehouseId: selectedItem.warehouseId || undefined,
    };

    try {
      await writeOffMutation.mutateAsync(payload);
      resetForm();
      onSuccess();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    }
  }, [selectedItem, qty, reason, note, writeOffMutation, resetForm, onSuccess]);

  const loading = writeOffMutation.isPending;

  if (!selectedItem) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.kav}
        >
          <View style={styles.sheet}>
            <View style={styles.handle} />

            {/* Sarlavha qatori */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>Hisobdan chiqarish</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={handleClose}
                disabled={loading}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="close" size={18} color={C.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              style={styles.scroll}
            >
              {/* Tanlangan mahsulot */}
              <ProductInfoCard item={selectedItem} />

              {/* Miqdor */}
              <Text style={styles.label}>Chiqariladigan miqdor (dona)</Text>
              <TextInput
                style={styles.input}
                value={qty}
                onChangeText={setQty}
                placeholder={`Maks: ${selectedItem.totalQty}`}
                placeholderTextColor={C.muted}
                keyboardType="numeric"
                editable={!loading}
                returnKeyType="done"
              />

              {/* Sabab tanlash */}
              <Text style={[styles.label, styles.labelTop]}>Sabab</Text>
              <ReasonPicker
                value={reason}
                onChange={setReason}
                disabled={loading}
              />

              {/* Izoh (ixtiyoriy) */}
              <Text style={[styles.label, styles.labelTop]}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={[styles.input, styles.inputMultiline]}
                value={note}
                onChangeText={setNote}
                placeholder="Qo'shimcha ma'lumot..."
                placeholderTextColor={C.muted}
                multiline
                numberOfLines={3}
                editable={!loading}
                returnKeyType="done"
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Harakat tugmalari */}
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleClose}
                disabled={loading}
              >
                <Text style={styles.cancelBtnText}>Bekor</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={C.white} size="small" />
                ) : (
                  <>
                    <Ionicons name="remove-circle-outline" size={16} color={C.white} />
                    <Text style={styles.submitBtnText}>Chiqarish</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}
