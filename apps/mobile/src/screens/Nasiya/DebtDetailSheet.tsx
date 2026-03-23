import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  Modal, StyleSheet, TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { DebtRecord } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';

const C = {
  bg: '#F5F5F7', white: '#FFFFFF', text: '#111827',
  muted: '#9CA3AF', border: '#F3F4F6', primary: '#5B5BD6',
  green: '#10B981', red: '#EF4444', orange: '#F59E0B',
};

interface Props {
  visible: boolean;
  debt: DebtRecord | null;
  onClose: () => void;
  onPay: (debt: DebtRecord) => void;
}

export default function DebtDetailSheet({ visible, debt, onClose, onPay }: Props) {
  if (!debt) return null;

  const remaining = debt.remaining;
  const isPaid = debt.status === 'PAID';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.customerName}>{debt.customer.name}</Text>
            {debt.customer.phone ? (
              <Text style={styles.customerPhone}>{debt.customer.phone}</Text>
            ) : null}
          </View>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Ionicons name="close" size={18} color={C.muted} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Amounts summary */}
          <View style={styles.amountsRow}>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Jami nasiya</Text>
              <Text style={styles.amountValue}>{formatUZS(debt.totalAmount)}</Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>To'langan</Text>
              <Text style={[styles.amountValue, styles.amountGreen]}>{formatUZS(debt.paidAmount)}</Text>
            </View>
            <View style={styles.amountBox}>
              <Text style={styles.amountLabel}>Qoldiq</Text>
              <Text style={[styles.amountValue, remaining > 0 ? styles.amountRed : styles.amountGreen]}>
                {formatUZS(remaining)}
              </Text>
            </View>
          </View>

          {/* Debt notes */}
          {debt.notes ? (
            <View style={styles.notesBox}>
              <Ionicons name="document-text-outline" size={14} color={C.orange} style={styles.noteIcon} />
              <Text style={styles.notesText}>{debt.notes}</Text>
            </View>
          ) : null}

          {/* Payment history */}
          {debt.payments && debt.payments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>TO'LOV TARIXI</Text>
              {debt.payments.map((p) => (
                <View key={p.id} style={styles.payRow}>
                  <View style={styles.payLeft}>
                    <MaterialCommunityIcons name="cash" size={16} color={C.green} />
                    <View style={styles.payInfo}>
                      <Text style={styles.payAmount}>{formatUZS(p.amount)}</Text>
                      {p.notes ? <Text style={styles.payNote}>{p.notes}</Text> : null}
                    </View>
                  </View>
                  <Text style={styles.payDate}>
                    {new Date(p.createdAt).toLocaleDateString('ru-RU')}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Pay button */}
        {!isPaid && (
          <TouchableOpacity
            style={styles.payBtn}
            onPress={() => { onClose(); onPay(debt); }}
            activeOpacity={0.85}
          >
            <Ionicons name="card-outline" size={18} color={C.white} />
            <Text style={styles.payBtnText}>To'lov qilish</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 34, maxHeight: '80%',
  },
  handle: {
    width: 40, height: 5, borderRadius: 3,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginTop: 12, marginBottom: 4,
  },
  header: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between', paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  customerName: { fontSize: 18, fontWeight: '800', color: C.text },
  customerPhone: { fontSize: 13, color: C.muted, marginTop: 2 },
  closeBtn: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  amountsRow: {
    flexDirection: 'row', gap: 10, marginTop: 16,
  },
  amountBox: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12,
    padding: 12, alignItems: 'center',
  },
  amountLabel: { fontSize: 11, color: C.muted, fontWeight: '500' },
  amountValue: { fontSize: 14, fontWeight: '700', color: C.text, marginTop: 4 },
  amountGreen: { color: C.green },
  amountRed: { color: C.red },
  notesBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FFFBEB', borderRadius: 10,
    padding: 10, marginTop: 12,
  },
  noteIcon: { marginRight: 6 },
  notesText: { flex: 1, fontSize: 13, color: '#92400E' },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    letterSpacing: 1.2, marginBottom: 10,
  },
  payRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: C.border,
  },
  payLeft: { flexDirection: 'row', alignItems: 'center' },
  payInfo: { marginLeft: 8 },
  payAmount: { fontSize: 14, fontWeight: '700', color: C.text },
  payNote: { fontSize: 11, color: C.muted },
  payDate: { fontSize: 12, color: C.muted },
  payBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: C.primary, borderRadius: 14, height: 52,
    gap: 8, marginTop: 16,
  },
  payBtnText: { color: C.white, fontSize: 15, fontWeight: '700' },
});
