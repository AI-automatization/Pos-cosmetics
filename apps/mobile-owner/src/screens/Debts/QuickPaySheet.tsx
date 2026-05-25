import React, { useState, useEffect, useCallback } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { debtsApi, CustomerDebt } from '../../api/debts.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors } from '../../config/theme';
import { styles } from './QuickPaySheet.styles';
import QuickPayCustomerInfo from './QuickPayCustomerInfo';

// ─── Payment method types ───────────────────────────────
type PayMethod = 'CASH' | 'TERMINAL' | 'TRANSFER';

interface PayMethodOption {
  readonly key: PayMethod;
  readonly label: string;
  readonly icon: string;
}

const PAY_METHODS: PayMethodOption[] = [
  { key: 'CASH', label: 'Naqd', icon: 'cash-outline' },
  { key: 'TERMINAL', label: 'Karta', icon: 'card-outline' },
  { key: 'TRANSFER', label: "O'tkazma", icon: 'swap-horizontal-outline' },
];

// ─── Props ──────────────────────────────────────────────
interface QuickPaySheetProps {
  visible: boolean;
  customer: CustomerDebt | null;
  onClose: () => void;
  onSuccess: () => void;
}

// ─── Component ──────────────────────────────────────────
export default function QuickPaySheet({ visible, customer, onClose, onSuccess }: QuickPaySheetProps) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('CASH');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (visible && customer) {
      setAmount(String(Math.round(customer.totalDebt)));
      setMethod('CASH');
      setNote('');
    } else {
      setAmount('');
      setNote('');
    }
  }, [visible, customer]);

  const handleConfirm = useCallback(async () => {
    if (!customer) return;

    const parsed = parseFloat(amount.replace(/[\s,]/g, ''));
    if (!parsed || parsed <= 0) {
      Alert.alert('Xatolik', "To'lov summasi 0 dan katta bo'lishi kerak");
      return;
    }
    if (parsed > customer.totalDebt) {
      Alert.alert(
        'Xatolik',
        `To'lov ${formatCurrency(parsed)} qarz miqdori ${formatCurrency(customer.totalDebt)} dan katta bo'la olmaydi`,
      );
      return;
    }

    setLoading(true);
    try {
      await debtsApi.recordPayment({
        debtId: customer.customerId,
        amount: parsed,
        method,
        note: note.trim() || undefined,
      });

      // Invalidate all debts queries to refetch fresh data
      await queryClient.invalidateQueries({ queryKey: ['debts'] });

      Alert.alert(
        'Muvaffaqiyatli',
        "To'lov muvaffaqiyatli amalga oshirildi",
        [{ text: 'OK', onPress: () => { onSuccess(); onClose(); } }],
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "To'lov amalga oshirilmadi";
      Alert.alert('Xatolik', message);
    } finally {
      setLoading(false);
    }
  }, [customer, amount, method, note, queryClient, onSuccess, onClose]);

  if (!customer) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}
          >
            <View style={styles.sheet}>
              {/* Handle bar */}
              <View style={styles.handle} />

              {/* Title */}
              <Text style={styles.title}>Tez to'lov</Text>

              {/* Customer + Debt info */}
              <QuickPayCustomerInfo customer={customer} />

              {/* Payment method selector */}
              <Text style={styles.sectionLabel}>To'lov usuli</Text>
              <View style={styles.methodRow}>
                {PAY_METHODS.map((m) => (
                  <TouchableOpacity
                    key={m.key}
                    style={[styles.methodBtn, method === m.key && styles.methodBtnActive]}
                    onPress={() => setMethod(m.key)}
                    activeOpacity={0.75}
                    disabled={loading}
                  >
                    <Ionicons
                      name={m.icon as 'cash-outline'}
                      size={18}
                      color={method === m.key ? '#FFFFFF' : Colors.textSecondary}
                    />
                    <Text style={[styles.methodBtnText, method === m.key && styles.methodBtnTextActive]}>
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Amount input */}
              <Text style={styles.sectionLabel}>To'lov summasi</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                placeholder="Miqdor kiriting..."
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                autoFocus
                editable={!loading}
              />

              {/* Quick fill buttons */}
              <View style={styles.quickFillRow}>
                {customer.overdueAmount > 0 && customer.overdueAmount !== customer.totalDebt && (
                  <TouchableOpacity
                    style={styles.quickFillBtn}
                    onPress={() => setAmount(String(Math.round(customer.overdueAmount)))}
                    disabled={loading}
                  >
                    <Text style={styles.quickFillText}>Muddati o'tgan</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.quickFillBtn}
                  onPress={() => setAmount(String(Math.round(customer.totalDebt / 2)))}
                  disabled={loading}
                >
                  <Text style={styles.quickFillText}>50%</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickFillBtn}
                  onPress={() => setAmount(String(Math.round(customer.totalDebt)))}
                  disabled={loading}
                >
                  <Text style={styles.quickFillText}>To'liq</Text>
                </TouchableOpacity>
              </View>

              {/* Note input */}
              <Text style={styles.sectionLabel}>Izoh (ixtiyoriy)</Text>
              <TextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder="Izoh yozing..."
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={2}
                editable={!loading}
              />

              {/* Action buttons */}
              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                  <Text style={styles.cancelBtnText}>Bekor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.payBtn, loading && styles.btnDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <Ionicons name="checkmark-circle-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.payBtnText}>To'lash</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
