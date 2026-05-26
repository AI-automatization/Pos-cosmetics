import React, { useState, useEffect, useCallback } from 'react';
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
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { debtsApi, CustomerDebt } from '../../api/debts.api';
import { formatCurrency } from '../../utils/formatCurrency';
import { Colors, Radii } from '../../config/theme';

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

              {/* Customer info */}
              <View style={styles.customerInfo}>
                <View style={styles.customerAvatar}>
                  <Text style={styles.customerAvatarText}>
                    {customer.customerName
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0]?.toUpperCase() ?? '')
                      .join('')}
                  </Text>
                </View>
                <View style={styles.customerDetails}>
                  <Text style={styles.customerName}>{customer.customerName}</Text>
                  <Text style={styles.customerBranch}>{customer.branchName}</Text>
                </View>
              </View>

              {/* Debt info box */}
              <View style={styles.debtInfoBox}>
                <View style={styles.debtInfoRow}>
                  <View style={styles.debtInfoItem}>
                    <Text style={styles.debtInfoLabel}>Jami qarz</Text>
                    <Text style={styles.debtInfoAmount}>{formatCurrency(customer.totalDebt)}</Text>
                  </View>
                  {customer.overdueAmount > 0 && (
                    <View style={styles.debtInfoItem}>
                      <Text style={styles.debtInfoLabelDanger}>Muddati o'tgan</Text>
                      <Text style={styles.debtInfoAmountDanger}>{formatCurrency(customer.overdueAmount)}</Text>
                    </View>
                  )}
                </View>
              </View>

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

// ─── Styles ─────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kav: {
    width: '100%',
  },
  sheet: {
    backgroundColor: Colors.bgSurface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 16,
  },

  // Customer info
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  customerAvatar: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  customerAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.primary,
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  customerBranch: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },

  // Debt info
  debtInfoBox: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: Radii.md,
    padding: 14,
    marginBottom: 16,
  },
  debtInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  debtInfoItem: {
    gap: 2,
  },
  debtInfoLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.warning,
  },
  debtInfoAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.warning,
  },
  debtInfoLabelDanger: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.danger,
  },
  debtInfoAmountDanger: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.danger,
  },

  // Section labels
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 8,
  },

  // Method selector
  methodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  methodBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: Radii.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.bgSurface,
  },
  methodBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  methodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  methodBtnTextActive: {
    color: '#FFFFFF',
  },

  // Amount input
  amountInput: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: Radii.md,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textPrimary,
    backgroundColor: Colors.bgSubtle,
    marginBottom: 10,
    textAlign: 'center',
  },

  // Quick fill
  quickFillRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  quickFillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radii.pill,
    backgroundColor: Colors.primaryLight,
  },
  quickFillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },

  // Note input
  noteInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    backgroundColor: Colors.bgSubtle,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 50,
  },

  // Action buttons
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  payBtn: {
    flex: 2,
    flexDirection: 'row',
    backgroundColor: Colors.success,
    borderRadius: Radii.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: Colors.success,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  payBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
