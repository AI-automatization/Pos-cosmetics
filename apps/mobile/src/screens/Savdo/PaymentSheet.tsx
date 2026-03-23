import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import type { Product } from './ProductCard';

// ─── Types ────────────────────────────────────────────
export type PaymentMethod = 'NAQD' | 'KARTA' | 'NASIYA';

export interface CartItem {
  product: Product;
  qty: number;
}

interface Props {
  visible: boolean;
  cart: CartItem[];
  total: number;
  onClose: () => void;
  onConfirm: (method: PaymentMethod, received: number) => void;
}

// ─── Utils ────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString('ru-RU') + ' UZS';
}

const METHODS: { key: PaymentMethod; label: string; icon: string; color: string }[] = [
  { key: 'NAQD',   label: 'Naqd',   icon: 'cash-multiple',    color: '#10B981' },
  { key: 'KARTA',  label: 'Karta',  icon: 'credit-card',      color: '#3B82F6' },
  { key: 'NASIYA', label: 'Nasiya', icon: 'receipt',          color: '#F59E0B' },
];

// ─── Component ────────────────────────────────────────
export default function PaymentSheet({ visible, cart, total, onClose, onConfirm }: Props) {
  const [method, setMethod]         = useState<PaymentMethod>('NAQD');
  const [split, setSplit]           = useState(false);
  const [received, setReceived]     = useState('');
  const [splitCard, setSplitCard]   = useState('');

  // Reset har ochilganda
  useEffect(() => {
    if (visible) {
      setMethod('NAQD');
      setSplit(false);
      setReceived(String(total));
      setSplitCard('');
    }
  }, [visible, total]);

  const receivedNum  = parseFloat(received.replace(/\s/g, '')) || 0;
  const splitCardNum = parseFloat(splitCard.replace(/\s/g, '')) || 0;
  const change       = method === 'NAQD' && !split ? receivedNum - total : 0;
  const canConfirm   = method !== 'NAQD' || receivedNum >= total;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(method, receivedNum);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* Handle */}
          <View style={styles.handle} />

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>To'lov</Text>
              <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={18} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {/* Order summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <View>
                  <Text style={styles.summaryLabel}>Buyurtma xulosasi</Text>
                  <Text style={styles.summaryItems}>
                    {cart.reduce((s, i) => s + i.qty, 0)} ta mahsulot
                  </Text>
                </View>
                <View style={styles.summaryRight}>
                  <Text style={styles.summaryLabel}>Umumiy summa</Text>
                  <Text style={styles.summaryTotal}>{fmt(total)}</Text>
                </View>
              </View>
            </View>

            {/* Payment method */}
            <Text style={styles.sectionLabel}>TO'LOV USULINI TANLANG</Text>
            <View style={styles.methodRow}>
              {METHODS.map((m) => {
                const active = method === m.key;
                return (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.methodCard, active && { borderColor: m.color, backgroundColor: m.color + '12' }]}
                    onPress={() => setMethod(m.key)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.methodIcon, { backgroundColor: m.color + '20' }]}>
                      <MaterialCommunityIcons name={m.icon as any} size={22} color={m.color} />
                    </View>
                    <Text style={[styles.methodLabel, active && { color: m.color }]}>{m.label}</Text>
                    {active && (
                      <View style={[styles.methodCheck, { backgroundColor: m.color }]}>
                        <Ionicons name="checkmark" size={10} color="#FFF" />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Split payment toggle */}
            <View style={styles.splitRow}>
              <View style={styles.splitLeft}>
                <MaterialCommunityIcons name="shuffle-variant" size={18} color="#6B7280" />
                <Text style={styles.splitLabel}>Aralash to'lov</Text>
              </View>
              <Switch
                value={split}
                onValueChange={setSplit}
                trackColor={{ false: '#E5E7EB', true: '#5B5BD6' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Naqd input */}
            {method === 'NAQD' && !split && (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Qabul qilindi</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    value={received}
                    onChangeText={setReceived}
                    keyboardType="numeric"
                    textAlign="right"
                  />
                  <Text style={styles.inputSuffix}>UZS</Text>
                </View>
                <View style={styles.changeRow}>
                  <Text style={styles.changeLabel}>Qaytim:</Text>
                  <Text style={[styles.changeAmount, change < 0 && styles.changeNeg]}>
                    {fmt(Math.abs(change))}
                  </Text>
                </View>
              </View>
            )}

            {/* Split: naqd + karta */}
            {split && (
              <View style={styles.inputBlock}>
                <Text style={styles.inputLabel}>Naqd</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    value={received}
                    onChangeText={setReceived}
                    keyboardType="numeric"
                    textAlign="right"
                  />
                  <Text style={styles.inputSuffix}>UZS</Text>
                </View>
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Karta</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.inputField}
                    value={splitCard}
                    onChangeText={setSplitCard}
                    keyboardType="numeric"
                    textAlign="right"
                    placeholder={fmt(total - receivedNum)}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Text style={styles.inputSuffix}>UZS</Text>
                </View>
                <View style={styles.changeRow}>
                  <Text style={styles.changeLabel}>Jami:</Text>
                  <Text style={[
                    styles.changeAmount,
                    receivedNum + splitCardNum < total && styles.changeNeg,
                  ]}>
                    {fmt(receivedNum + splitCardNum)}
                  </Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
            onPress={handleConfirm}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={styles.confirmText}>Tasdiqlash</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ───────────────────────────────────────────
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  sheetWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingBottom: 34,
    maxHeight: '90%',
  },

  // Handle
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Summary
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
    marginBottom: 4,
  },
  summaryItems: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
  },
  summaryRight: {
    alignItems: 'flex-end',
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#5B5BD6',
  },

  // Methods
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  methodRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  methodCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 6,
    position: 'relative',
  },
  methodIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
  },
  methodCheck: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Split toggle
  splitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    marginBottom: 8,
  },
  splitLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  splitLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },

  // Input
  inputBlock: {
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputField: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  inputSuffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    marginLeft: 8,
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  changeLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  changeAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5B5BD6',
  },
  changeNeg: {
    color: '#EF4444',
  },

  // Confirm button
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5B5BD6',
    borderRadius: 14,
    height: 54,
    gap: 8,
    marginTop: 16,
    shadowColor: '#5B5BD6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmBtnDisabled: {
    opacity: 0.5,
  },
  confirmText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
