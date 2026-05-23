import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableWithoutFeedback,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { nasiyaApi, type DebtRecord } from '../../api/nasiya.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  white:   '#FFFFFF',
  text:    '#111827',
  muted:   '#9CA3AF',
  border:  '#E5E7EB',
  primary: '#2563EB',
};

type PayMethod = 'Naqd' | 'Karta' | 'Transfer';
const PAY_METHODS: PayMethod[] = ['Naqd', 'Karta', 'Transfer'];

/** Map UI labels to Prisma PaymentMethod enum */
const PAY_METHOD_MAP: Record<PayMethod, string> = {
  Naqd: 'CASH',
  Karta: 'TERMINAL',
  Transfer: 'TRANSFER',
};

function fmt(n: number): string {
  const abs = Math.abs(Number(n));
  const formatted = Math.round(abs).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return (Number(n) < 0 ? '-' : '') + formatted + ' UZS';
}

interface QuickPaySheetProps {
  readonly record: DebtRecord | null;
  readonly onClose: () => void;
  readonly onPaid: () => void;
}

export default function QuickPaySheet({ record, onClose, onPaid }: QuickPaySheetProps) {
  const [amount, setAmount]     = useState('');
  const [method, setMethod]     = useState<PayMethod>('Naqd');
  const [loading, setLoading]   = useState(false);
  const visible = !!record;

  React.useEffect(() => {
    if (visible) setAmount('');
  }, [visible]);

  if (!record) return null;
  const remaining = Number(record.remaining);

  const handleQuick = (pct: number) => {
    setAmount(String(Math.round(remaining * pct)));
  };

  const handleMethodPick = () => {
    Alert.alert("To'lov usuli", undefined, [
      ...PAY_METHODS.map((m) => ({ text: m, onPress: () => setMethod(m) })),
      { text: 'Bekor qilish', style: 'cancel' as const },
    ]);
  };

  const handlePay = () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    if (amt > remaining) {
      Alert.alert('Xatolik', 'Miqdor qarzdan ko\'p bo\'lishi mumkin emas');
      return;
    }
    Alert.alert(
      'Tasdiqlash',
      `${fmt(amt)} to'lansinmi?`,
      [
        { text: 'Bekor', style: 'cancel' },
        {
          text: "To'lash",
          onPress: async () => {
            setLoading(true);
            try {
              await nasiyaApi.recordPayment({
                debtorId: record.id,
                amount: amt,
                paymentMethod: PAY_METHOD_MAP[method],
              });
              onPaid();
              onClose();
            } catch {
              Alert.alert('Xatolik', 'To\'lovni amalga oshirib bo\'lmadi');
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  const canPay = parseFloat(amount) > 0 && !loading;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={sheet.backdrop} />
      </TouchableWithoutFeedback>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={sheet.wrapper}
      >
        <View style={sheet.panel}>
          <View style={sheet.handle} />

          <View style={sheet.header}>
            <View style={sheet.iconCircle}>
              <Ionicons name="cash-outline" size={22} color={C.primary} />
            </View>
            <View style={sheet.flex1}>
              <Text style={sheet.title}>{record.customer.name}</Text>
              <Text style={sheet.subtitle}>Qolgan qarz: {fmt(remaining)}</Text>
            </View>
          </View>

          {/* Amount input */}
          <Text style={sheet.label}>MIQDOR (UZS)</Text>
          <TextInput
            style={sheet.input}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={C.muted}
            keyboardType="numeric"
          />

          {/* Quick buttons */}
          <View style={sheet.quickRow}>
            <TouchableOpacity
              style={sheet.quickBtn}
              onPress={() => handleQuick(0.5)}
              activeOpacity={0.75}
            >
              <Text style={sheet.quickBtnText}>50%</Text>
              <Text style={sheet.quickBtnSub}>{fmt(Math.round(remaining * 0.5))}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[sheet.quickBtn, sheet.quickBtnFull]}
              onPress={() => handleQuick(1)}
              activeOpacity={0.75}
            >
              <Text style={[sheet.quickBtnText, { color: C.white }]}>To'liq</Text>
              <Text style={[sheet.quickBtnSub, { color: C.white + 'CC' }]}>{fmt(remaining)}</Text>
            </TouchableOpacity>
          </View>

          {/* Payment method */}
          <Text style={sheet.label}>TO'LOV USULI</Text>
          <TouchableOpacity style={sheet.selectRow} onPress={handleMethodPick}>
            <Ionicons name="card-outline" size={18} color={C.muted} />
            <Text style={sheet.selectText}>{method}</Text>
            <Ionicons name="chevron-forward" size={16} color={C.muted} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[sheet.payBtn, !canPay && sheet.payBtnDisabled]}
            onPress={handlePay}
            activeOpacity={0.85}
            disabled={!canPay}
          >
            {loading
              ? <ActivityIndicator size="small" color="#FFFFFF" />
              : <Text style={sheet.payBtnText}>To'lashni tasdiqlash</Text>
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Sheet styles ───────────────────────────────────────
const sheet = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  wrapper: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  panel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    paddingHorizontal: 20, paddingBottom: 44, paddingTop: 12,
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#E5E7EB', alignSelf: 'center', marginBottom: 20,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  iconCircle: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: '#EFF6FF', alignItems: 'center', justifyContent: 'center',
  },
  title: { fontSize: 16, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 13, color: '#DC2626', fontWeight: '600', marginTop: 2 },
  label: {
    fontSize: 11, fontWeight: '700', color: '#9CA3AF',
    letterSpacing: 1, marginBottom: 6,
  },
  input: {
    height: 52, backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, fontSize: 18, fontWeight: '700', color: '#111827',
    marginBottom: 12,
  },
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickBtn: {
    flex: 1, borderRadius: 12, borderWidth: 1.5, borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', paddingVertical: 10, alignItems: 'center',
  },
  quickBtnFull: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  quickBtnText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  quickBtnSub: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  selectRow: {
    height: 48, backgroundColor: '#F9FAFB', borderRadius: 12,
    borderWidth: 1.5, borderColor: '#E5E7EB',
    paddingHorizontal: 14, flexDirection: 'row',
    alignItems: 'center', gap: 10, marginBottom: 16,
  },
  flex1: { flex: 1 },
  selectText: { flex: 1, fontSize: 15, color: '#111827' },
  payBtn: {
    backgroundColor: '#2563EB', borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  payBtnDisabled: { backgroundColor: '#E5E7EB', shadowOpacity: 0, elevation: 0 },
  payBtnText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
});
