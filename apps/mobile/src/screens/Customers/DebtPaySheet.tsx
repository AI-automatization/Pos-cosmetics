import React, { useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { nasiyaApi } from '@/api/nasiya.api';
import { extractErrorMessage } from '@/utils/error';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:         '#F9FAFB',
  white:      '#FFFFFF',
  text:       '#111827',
  muted:      '#9CA3AF',
  border:     '#E5E7EB',
  primary:    '#2563EB',
  primaryBg:  '#EFF6FF',
  orange:     '#EA580C',
  orangeBg:   '#FFF7ED',
  orangeBorder:'#FED7AA',
  green:      '#16A34A',
  greenBg:    '#F0FDF4',
  red:        '#DC2626',
  inputBorder:'#D1D5DB',
  inputFocus: '#2563EB',
  disabled:   '#93C5FD',
};

// ─── Types ─────────────────────────────────────────────
type PaymentMethod = 'CASH' | 'CARD' | 'TRANSFER';

const METHOD_MAP: Record<PaymentMethod, string> = {
  CASH:     'CASH',
  CARD:     'TERMINAL',
  TRANSFER: 'TRANSFER',
};

const METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH:     'Naqd',
  CARD:     'Karta',
  TRANSFER: "O'tkazma",
};

const METHOD_ICONS: Record<PaymentMethod, React.ComponentProps<typeof Ionicons>['name']> = {
  CASH:     'cash-outline',
  CARD:     'card-outline',
  TRANSFER: 'swap-horizontal-outline',
};

export interface DebtPaySheetDebt {
  readonly id: string;
  readonly totalAmount: number;
  readonly remaining: number;
  readonly orderNumber?: string | number | null;
}

interface DebtPaySheetProps {
  readonly debt: DebtPaySheetDebt;
  readonly onClose: () => void;
}

// ─── Helpers ───────────────────────────────────────────
function fmtSum(n: number): string {
  return `${n.toLocaleString('uz-UZ')} so'm`;
}

function parseAmount(raw: string): number {
  const cleaned = raw.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

// ─── DebtPaySheet ──────────────────────────────────────
export function DebtPaySheet({ debt, onClose }: DebtPaySheetProps) {
  const queryClient = useQueryClient();

  const [amountRaw, setAmountRaw] = useState<string>(String(debt.remaining));
  const [method, setMethod]       = useState<PaymentMethod>('CASH');
  const [note, setNote]           = useState<string>('');
  const [amountFocused, setAmountFocused] = useState(false);
  const [noteFocused, setNoteFocused]     = useState(false);

  const amount = parseAmount(amountRaw);
  const isAmountValid = amount > 0 && amount <= debt.remaining;

  const { mutate: payDebt, isPending } = useMutation({
    mutationFn: () =>
      nasiyaApi.pay(debt.id, amount, METHOD_MAP[method], note.trim() || undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['customer-debts'] });
      void queryClient.invalidateQueries({ queryKey: ['nasiya'] });
      Alert.alert('Muvaffaqiyatli', "To'lov qabul qilindi");
      onClose();
    },
    onError: (err: unknown) => {
      Alert.alert('Xatolik', extractErrorMessage(err));
    },
  });

  function handleSetHalf(): void {
    const half = Math.ceil(debt.remaining / 2);
    setAmountRaw(String(half));
  }

  function handleSetFull(): void {
    setAmountRaw(String(debt.remaining));
  }

  function handleSubmit(): void {
    if (!isAmountValid) {
      Alert.alert(
        'Xatolik',
        amount <= 0
          ? "Summa 0 dan katta bo'lishi kerak"
          : `Summa qolgan qarzdan (${fmtSum(debt.remaining)}) oshmasligi kerak`,
      );
      return;
    }
    payDebt();
  }

  return (
    <Modal
      visible
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      {/* Sheet */}
      <View style={styles.sheet}>
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Qarz to'lash</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={20} color={C.text} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Qolgan qarz info */}
          <View style={styles.debtInfoBlock}>
            <View style={styles.debtInfoRow}>
              <Ionicons name="wallet-outline" size={18} color={C.orange} />
              <Text style={styles.debtInfoLabel}>Qolgan qarz</Text>
            </View>
            <Text style={styles.debtInfoAmount}>{fmtSum(debt.remaining)}</Text>
            {debt.orderNumber != null && (
              <Text style={styles.debtInfoOrder}>Buyurtma #{debt.orderNumber}</Text>
            )}
          </View>

          {/* Amount input */}
          <Text style={styles.fieldLabel}>To'lov summasi</Text>
          <View style={[styles.inputWrap, amountFocused && styles.inputWrapFocused]}>
            <Ionicons name="cash-outline" size={16} color={amountFocused ? C.inputFocus : C.muted} />
            <TextInput
              style={styles.input}
              value={amountRaw}
              onChangeText={setAmountRaw}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={C.muted}
              onFocus={() => setAmountFocused(true)}
              onBlur={() => setAmountFocused(false)}
              selectTextOnFocus
            />
            <Text style={styles.inputSuffix}>so'm</Text>
          </View>

          {/* Quick buttons */}
          <View style={styles.quickRow}>
            <TouchableOpacity style={styles.quickBtn} onPress={handleSetHalf} activeOpacity={0.75}>
              <Text style={styles.quickBtnText}>50%</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickBtn} onPress={handleSetFull} activeOpacity={0.75}>
              <Text style={styles.quickBtnText}>To'liq ({fmtSum(debt.remaining)})</Text>
            </TouchableOpacity>
          </View>

          {/* Payment method */}
          <Text style={styles.fieldLabel}>To'lov usuli</Text>
          <View style={styles.methodRow}>
            {(['CASH', 'CARD', 'TRANSFER'] as const).map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.methodBtn, method === m && styles.methodBtnActive]}
                onPress={() => setMethod(m)}
                activeOpacity={0.75}
              >
                <Ionicons
                  name={METHOD_ICONS[m]}
                  size={18}
                  color={method === m ? C.primary : C.muted}
                />
                <Text style={[styles.methodBtnText, method === m && styles.methodBtnTextActive]}>
                  {METHOD_LABELS[m]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Note input */}
          <Text style={styles.fieldLabel}>Izoh (ixtiyoriy)</Text>
          <View style={[styles.inputWrap, noteFocused && styles.inputWrapFocused]}>
            <Ionicons name="create-outline" size={16} color={noteFocused ? C.inputFocus : C.muted} />
            <TextInput
              style={styles.input}
              value={note}
              onChangeText={setNote}
              placeholder="Masalan: telefon orqali..."
              placeholderTextColor={C.muted}
              onFocus={() => setNoteFocused(true)}
              onBlur={() => setNoteFocused(false)}
              returnKeyType="done"
            />
          </View>

          {/* Submit */}
          <TouchableOpacity
            style={[
              styles.submitBtn,
              (!isAmountValid || isPending) && styles.submitBtnDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!isAmountValid || isPending}
            activeOpacity={0.85}
          >
            {isPending ? (
              <ActivityIndicator size="small" color={C.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={C.white} />
                <Text style={styles.submitBtnText}>To'lash</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  // Modal overlay
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },

  // Bottom sheet
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 32,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
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

  // Content
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 4,
  },

  // Debt info block
  debtInfoBlock: {
    backgroundColor: C.orangeBg,
    borderWidth: 1,
    borderColor: C.orangeBorder,
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    gap: 4,
  },
  debtInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  debtInfoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.orange,
  },
  debtInfoAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: C.orange,
  },
  debtInfoOrder: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },

  // Field label
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: C.muted,
    letterSpacing: 0.4,
    marginTop: 12,
    marginBottom: 6,
  },

  // Text input
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 10,
  },
  inputWrapFocused: {
    borderColor: C.inputFocus,
    backgroundColor: C.white,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.text,
  },
  inputSuffix: {
    fontSize: 13,
    color: C.muted,
    fontWeight: '500',
  },

  // Quick buttons
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    marginBottom: 4,
  },
  quickBtn: {
    flex: 1,
    height: 36,
    borderRadius: 10,
    backgroundColor: C.primaryBg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  quickBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.primary,
  },

  // Payment method
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    height: 56,
    borderRadius: 12,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  methodBtnActive: {
    backgroundColor: C.primaryBg,
    borderColor: C.primary,
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.muted,
  },
  methodBtnTextActive: {
    color: C.primary,
  },

  // Submit button
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: 14,
    backgroundColor: C.primary,
    marginTop: 20,
    gap: 8,
  },
  submitBtnDisabled: {
    backgroundColor: C.disabled,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
