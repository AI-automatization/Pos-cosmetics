import React, { useState, useEffect } from 'react';
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
import type { DebtRecord } from '../../api/nasiya.api';
import { nasiyaApi } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';
import { extractErrorMessage } from '../../utils/error';
import QuickFillButtons from './QuickFillButtons';

type PayMethod = 'CASH' | 'CARD' | 'TRANSFER';

interface PayMethodOption {
  readonly key: PayMethod;
  readonly label: string;
  readonly icon: string;
}

const PAY_METHODS: PayMethodOption[] = [
  { key: 'CASH', label: 'Naqd', icon: 'cash-outline' },
  { key: 'CARD', label: 'Karta', icon: 'card-outline' },
  { key: 'TRANSFER', label: "O'tkazma", icon: 'swap-horizontal-outline' },
];

interface Props {
  debt: DebtRecord | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayModal({ debt, visible, onClose, onSuccess }: Props) {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PayMethod>('CASH');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && debt) {
      setAmount(String(Math.round(Number(debt.remaining))));
      setMethod('CASH');
    } else {
      setAmount('');
    }
  }, [visible, debt]);

  const handleConfirm = async () => {
    if (!debt) return;
    const parsed = parseInt(amount.replace(/\s/g, ''), 10);
    if (!parsed || parsed <= 0) {
      Alert.alert('Xatolik', "To'lov summasi 0 dan katta bo'lishi kerak");
      return;
    }
    if (parsed > Number(debt.remaining)) {
      Alert.alert(
        'Xatolik',
        `To'lov ${formatUZS(parsed)} qoldiqdan ${formatUZS(Number(debt.remaining))} katta bo'la olmaydi`,
      );
      return;
    }
    setLoading(true);
    try {
      await nasiyaApi.pay(debt.id, parsed, method);
      Alert.alert('', "To'lov muvaffaqiyatli amalga oshirildi");
      onSuccess();
      onClose();
    } catch (err) {
      Alert.alert('Xatolik', extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (!debt) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}
          >
            <View style={styles.sheet}>
              <View style={styles.handle} />
              <Text style={styles.title}>Nasiya to'lash</Text>

              <Text style={styles.methodLabel}>To'lov usuli</Text>
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
                      color={method === m.key ? '#FFFFFF' : '#6B7280'}
                    />
                    <Text
                      style={[styles.methodBtnText, method === m.key && styles.methodBtnTextActive]}
                    >
                      {m.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.debtInfoBox}>
                <Ionicons name="information-circle-outline" size={18} color="#D97706" />
                <View style={styles.debtInfoContent}>
                  <Text style={styles.debtInfoLabel}>Qolgan qarz</Text>
                  <Text style={styles.debtInfoAmount}>{formatUZS(Number(debt.remaining))}</Text>
                </View>
              </View>

              <Text style={styles.inputLabel}>To'lov summasi</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder="Miqdor kiriting..."
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                autoFocus
                editable={!loading}
              />

              <QuickFillButtons
                remaining={Number(debt.remaining)}
                onFill={setAmount}
              />

              <View style={styles.actions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={onClose} disabled={loading}>
                  <Text style={styles.cancelBtnText}>Bekor</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, loading && styles.btnDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>To'lashni tasdiqlash</Text>
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 16,
  },
  methodLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  methodBtnActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  methodBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
  },
  methodBtnTextActive: {
    color: '#FFFFFF',
  },
  debtInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  debtInfoContent: {
    flex: 1,
  },
  debtInfoLabel: {
    fontSize: 11,
    color: '#D97706',
    fontWeight: '500',
  },
  debtInfoAmount: {
    fontSize: 16,
    fontWeight: '800',
    color: '#D97706',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
  },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
