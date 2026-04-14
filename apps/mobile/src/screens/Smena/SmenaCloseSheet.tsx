import React, { useState, useEffect } from 'react';
import {
  View, Text, Modal, TouchableOpacity, TextInput,
  StyleSheet, TouchableWithoutFeedback, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { C, fmt, type ShiftRecord } from './SmenaComponents';

interface Props {
  readonly visible: boolean;
  readonly loading: boolean;
  readonly shift: ShiftRecord | null;
  readonly onClose: () => void;
  readonly onConfirm: (actualCash: number) => void;
}

function SummaryRow({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={[styles.summaryValue, valueColor ? { color: valueColor } : {}]}>{value}</Text>
    </View>
  );
}

export default function SmenaCloseSheet({ visible, loading, shift, onClose, onConfirm }: Props) {
  const [actualCash, setActualCash] = useState('');

  useEffect(() => {
    if (visible && shift) {
      setActualCash(String(shift.cashAmount));
    }
  }, [visible, shift]);

  const actualNum = parseFloat(actualCash.replace(/\s/g, '')) || 0;
  const expectedCash = shift ? shift.openingCash + shift.cashAmount - shift.expenses : 0;
  const diff = actualNum - expectedCash;
  const diffColor = diff >= 0 ? C.green : C.red;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.wrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Ionicons name="lock-closed-outline" size={22} color={C.red} />
              </View>
              <View>
                <Text style={styles.title}>Smenani yopish</Text>
                <Text style={styles.subtitle}>Smena hisobotini tekshiring</Text>
              </View>
            </View>

            {/* Summary table */}
            <View style={styles.summaryCard}>
              <Text style={styles.sectionLabel}>SMENA HISOBOTI</Text>
              <SummaryRow label="Jami tushum" value={`${fmt(shift?.totalRevenue)} UZS`} valueColor={C.primary} />
              <View style={styles.divider} />
              <SummaryRow label="Buyurtmalar" value={`${shift?.totalOrders ?? 0} ta`} />
              <SummaryRow label="Naqd" value={`${fmt(shift?.cashAmount)} UZS`} />
              <SummaryRow label="Karta" value={`${fmt(shift?.cardAmount)} UZS`} />
              <SummaryRow label="Nasiya" value={`${fmt(shift?.nasiyaAmount)} UZS`} valueColor={C.orange} />
              <View style={styles.divider} />
              <SummaryRow label="Xarajatlar" value={`−${fmt(shift?.expenses)} UZS`} valueColor={C.red} />
              <SummaryRow
                label="Sof daromad"
                value={`${fmt((shift?.totalRevenue ?? 0) - (shift?.expenses ?? 0))} UZS`}
                valueColor={C.green}
              />
            </View>

            {/* Actual cash input */}
            <Text style={styles.inputLabel}>HAQIQIY NAQD (UZS)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="cash-outline" size={20} color={C.muted} />
              <TextInput
                style={styles.input}
                value={actualCash}
                onChangeText={setActualCash}
                keyboardType="numeric"
                textAlign="right"
                selectTextOnFocus
              />
              <Text style={styles.inputSuffix}>UZS</Text>
            </View>

            {/* Diff display */}
            <View style={[styles.diffBox, { borderColor: diffColor + '40', backgroundColor: diffColor + '10' }]}>
              <View style={styles.diffRow}>
                <Text style={styles.diffLabel}>Kutilgan naqd</Text>
                <Text style={styles.diffExpected}>{fmt(expectedCash)} UZS</Text>
              </View>
              <View style={styles.diffRow}>
                <Text style={styles.diffLabel}>Farq</Text>
                <Text style={[styles.diffAmount, { color: diffColor }]}>
                  {diff >= 0 ? '+' : ''}{fmt(diff)} UZS
                </Text>
              </View>
            </View>
          </ScrollView>

          <TouchableOpacity
            style={styles.confirmBtn}
            onPress={() => onConfirm(actualNum)}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="lock-closed-outline" size={20} color="#FFFFFF" />
                <Text style={styles.confirmText}>Smenani yopish</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
  },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 40, paddingTop: 12,
    maxHeight: '85%',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: C.border, alignSelf: 'center', marginBottom: 16,
  },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 20,
  },
  iconCircle: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: '#FEF2F2',
    alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: C.text },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 2 },
  summaryCard: {
    backgroundColor: C.bg, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12,
    marginBottom: 16, gap: 10,
  },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 2,
  },
  summaryRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  summaryLabel: { fontSize: 13, color: C.secondary, fontWeight: '500' },
  summaryValue: { fontSize: 13, fontWeight: '700', color: C.text },
  divider: { height: 1, backgroundColor: C.border },
  inputLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1, marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.border,
    paddingHorizontal: 16, height: 56,
    gap: 10, marginBottom: 12,
  },
  input: { flex: 1, fontSize: 22, fontWeight: '700', color: C.text },
  inputSuffix: { fontSize: 14, fontWeight: '600', color: C.muted },
  diffBox: {
    borderRadius: 12, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 12,
    gap: 8, marginBottom: 20,
  },
  diffRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  diffLabel: { fontSize: 13, color: C.secondary },
  diffExpected: { fontSize: 13, fontWeight: '600', color: C.text },
  diffAmount: { fontSize: 16, fontWeight: '800' },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: C.red,
    borderRadius: 14, height: 54,
    shadowColor: C.red, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  confirmText: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
});
