// NewStockOutSheet.tsx — hisobdan chiqarish modal komponenti

import React, { useState, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
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
import { STATUS_CFG } from './StockOutTypes';
import type { StockLevel, WriteOffPayload, WriteOffResponse, WriteOffReason } from './StockOutTypes';

const REASONS: ReadonlyArray<WriteOffReason> = ['DAMAGED', 'EXPIRED', 'LOST', 'OTHER'];

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
              <View style={styles.productCard}>
                <Ionicons name="cube-outline" size={18} color={C.primary} />
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={1}>
                    {selectedItem.name}
                  </Text>
                  <Text style={styles.productMeta}>
                    {selectedItem.warehouseName} · Qoldiq: {selectedItem.totalQty % 1 === 0
                      ? String(selectedItem.totalQty)
                      : selectedItem.totalQty.toFixed(2)} dona
                  </Text>
                </View>
              </View>

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
              <View style={styles.reasonGrid}>
                {REASONS.map((r) => {
                  const cfg      = STATUS_CFG[r];
                  const isActive = reason === r;
                  return (
                    <TouchableOpacity
                      key={r}
                      style={[
                        styles.reasonBtn,
                        isActive && { backgroundColor: cfg.bg, borderColor: cfg.text },
                      ]}
                      onPress={() => setReason(r)}
                      activeOpacity={0.75}
                      disabled={loading}
                    >
                      <Ionicons
                        name={cfg.icon as 'warning-outline'}
                        size={16}
                        color={isActive ? cfg.text : C.muted}
                      />
                      <Text
                        style={[
                          styles.reasonText,
                          isActive && { color: cfg.text, fontWeight: '700' },
                        ]}
                      >
                        {cfg.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

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

const styles = StyleSheet.create({
  overlay: {
    flex:            1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent:  'flex-end',
  },
  kav:   { width: '100%' },
  sheet: {
    backgroundColor:      C.white,
    borderTopLeftRadius:  20,
    borderTopRightRadius: 20,
    paddingHorizontal:    20,
    paddingTop:           12,
    paddingBottom:        40,
    maxHeight:            '90%' as const,
  },
  handle: {
    width:        36,
    height:       4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf:    'center',
    marginBottom: 14,
  },
  titleRow: {
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   16,
  },
  title: {
    fontSize:   18,
    fontWeight: '800',
    color:      C.text,
  },
  closeBtn: {
    width:           32,
    height:          32,
    borderRadius:    16,
    backgroundColor: C.bg,
    borderWidth:     1,
    borderColor:     C.border,
    alignItems:      'center',
    justifyContent:  'center',
  },
  scroll: { flexShrink: 1 },
  productCard: {
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    backgroundColor: C.bg,
    borderRadius:    12,
    padding:         14,
    borderWidth:     1,
    borderColor:     C.border,
    marginBottom:    16,
  },
  productInfo:  { flex: 1, gap: 2 },
  productName:  { fontSize: 15, fontWeight: '700', color: C.text },
  productMeta:  { fontSize: 12, color: C.secondary },
  label: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#374151',
    marginBottom: 6,
  },
  labelTop: { marginTop: 16 },
  input: {
    borderWidth:       1,
    borderColor:       C.border,
    borderRadius:      10,
    paddingHorizontal: 14,
    paddingVertical:   12,
    fontSize:          15,
    color:             C.text,
    backgroundColor:   C.bg,
  },
  inputMultiline: {
    height:       80,
    paddingTop:   12,
  },
  reasonGrid: {
    flexDirection: 'row',
    flexWrap:      'wrap',
    gap:           8,
  },
  reasonBtn: {
    flexDirection:    'row',
    alignItems:       'center',
    gap:              6,
    paddingHorizontal: 12,
    paddingVertical:  10,
    borderRadius:     10,
    borderWidth:      1,
    borderColor:      C.border,
    backgroundColor:  C.white,
    minWidth:         '45%' as const,
  },
  reasonText: {
    fontSize:   13,
    fontWeight: '500',
    color:      C.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap:           10,
    marginTop:     20,
  },
  cancelBtn: {
    flex:          1,
    borderWidth:   1,
    borderColor:   C.border,
    borderRadius:  12,
    paddingVertical: 14,
    alignItems:    'center',
  },
  cancelBtnText: {
    fontSize:   15,
    fontWeight: '600',
    color:      C.secondary,
  },
  submitBtn: {
    flex:           2,
    flexDirection:  'row',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            6,
    backgroundColor: C.red,
    borderRadius:   12,
    paddingVertical: 14,
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: {
    fontSize:   15,
    fontWeight: '700',
    color:      C.white,
  },
});
