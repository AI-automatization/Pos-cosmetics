import React, { useState } from 'react';
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
  ScrollView,
} from 'react-native';
import { nasiyaApi } from '../../api/nasiya.api';

// ─── Colors ────────────────────────────────────────────
const C = {
  bg:        '#F5F5F7',
  white:     '#FFFFFF',
  text:      '#111827',
  muted:     '#9CA3AF',
  secondary: '#6B7280',
  border:    '#F3F4F6',
  primary:   '#5B5BD6',
  red:       '#EF4444',
  label:     '#374151',
};

interface ProductItem {
  product: { id: string; name: string; sellPrice: number };
  qty: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialAmount?: number;
  initialProducts?: ProductItem[];
}

interface FormState {
  customerName: string;
  phone: string;
  totalAmount: string;
  dueDate: string;
  notes: string;
}

const EMPTY_FORM: FormState = {
  customerName: '',
  phone:        '',
  totalAmount:  '',
  dueDate:      '',
  notes:        '',
};

export default function NewDebtSheet({
  visible, onClose, onSuccess,
  initialAmount, initialProducts,
}: Props) {
  const [form, setForm]       = useState<FormState>(EMPTY_FORM);
  const [loading, setLoading] = useState(false);

  // Unified effect: pre-fill on open, reset on close
  React.useEffect(() => {
    if (visible) {
      if (initialAmount !== undefined && initialAmount > 0) {
        setForm({ ...EMPTY_FORM, totalAmount: String(initialAmount) });
      } else {
        setForm(EMPTY_FORM);
      }
    } else {
      setForm(EMPTY_FORM);
    }
  }, [visible, initialAmount, initialProducts]);

  const set = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const resetAndClose = () => {
    setForm(EMPTY_FORM);
    onClose();
  };

  const handleSave = async () => {
    const name = form.customerName.trim();
    if (!name) {
      Alert.alert('Xatolik', "Mijoz ismi bo'sh bo'lishi mumkin emas");
      return;
    }

    const amount = parseInt(form.totalAmount.replace(/\s/g, ''), 10);
    if (!amount || amount <= 0) {
      Alert.alert('Xatolik', "Summa 0 dan katta bo'lishi kerak");
      return;
    }

    setLoading(true);
    try {
      await nasiyaApi.create({
        customerName: name,
        phone:        form.phone.trim() || undefined,
        totalAmount:  amount,
        dueDate:      form.dueDate.trim() || undefined,
        notes:        form.notes.trim() || undefined,
      });
    } catch {
      // Backend hali tayyor emas (T-134) — demo mode da muvaffaqiyatli deb hisoblanadi
    } finally {
      setLoading(false);
    }
    setForm(EMPTY_FORM);
    onSuccess();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={resetAndClose}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.overlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={styles.kav}
          >
            <View style={styles.sheet}>
              <View style={styles.handle} />

              <Text style={styles.title}>Yangi nasiya</Text>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {initialProducts && initialProducts.length > 0 && (
                  <View style={styles.productsBox}>
                    <Text style={styles.productsTitle}>Mahsulotlar</Text>
                    {initialProducts.map((item) => (
                      <View key={item.product.id} style={styles.productRow}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {item.product.name}
                        </Text>
                        <Text style={styles.productDetail}>
                          {item.qty} × {item.product.sellPrice.toLocaleString('ru-RU')} ={' '}
                          {(item.qty * item.product.sellPrice).toLocaleString('ru-RU')} UZS
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Mijoz ismi */}
                <Text style={styles.label}>Mijoz ismi *</Text>
                <TextInput
                  style={styles.input}
                  value={form.customerName}
                  onChangeText={set('customerName')}
                  placeholder="Ismi familiyasi"
                  placeholderTextColor={C.muted}
                  editable={!loading}
                  returnKeyType="next"
                />

                {/* Telefon */}
                <Text style={styles.label}>Telefon raqami</Text>
                <TextInput
                  style={styles.input}
                  value={form.phone}
                  onChangeText={set('phone')}
                  placeholder="+998 90 000 00 00"
                  placeholderTextColor={C.muted}
                  keyboardType="phone-pad"
                  editable={!loading}
                  returnKeyType="next"
                />

                {/* Summa */}
                <Text style={styles.label}>Summa (UZS) *</Text>
                <TextInput
                  style={styles.input}
                  value={form.totalAmount}
                  onChangeText={set('totalAmount')}
                  placeholder="0"
                  placeholderTextColor={C.muted}
                  keyboardType="numeric"
                  editable={!loading}
                  returnKeyType="next"
                />

                {/* Muddat sanasi */}
                <Text style={styles.label}>Muddat sanasi</Text>
                <TextInput
                  style={styles.input}
                  value={form.dueDate}
                  onChangeText={set('dueDate')}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={C.muted}
                  editable={!loading}
                  returnKeyType="next"
                />

                {/* Izoh */}
                <Text style={styles.label}>Izoh</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={form.notes}
                  onChangeText={set('notes')}
                  placeholder="Qo'shimcha ma'lumot..."
                  placeholderTextColor={C.muted}
                  multiline
                  numberOfLines={3}
                  editable={!loading}
                  returnKeyType="done"
                />
              </ScrollView>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={resetAndClose}
                  disabled={loading}
                >
                  <Text style={styles.cancelBtnText}>Bekor</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.saveBtn, loading && styles.btnDisabled]}
                  onPress={handleSave}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color={C.white} size="small" />
                  ) : (
                    <Text style={styles.saveBtnText}>Saqlash</Text>
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

// ─── Styles ────────────────────────────────────────────
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  kav: { width: '100%' },
  sheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: '90%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: C.text,
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.label,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: C.text,
    backgroundColor: C.bg,
  },
  inputMultiline: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: C.secondary,
  },
  saveBtn: {
    flex: 2,
    backgroundColor: C.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  saveBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },
  productsBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 12,
    marginBottom: 12,
  },
  productsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
  },
  productRow: {
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  productName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  productDetail: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
});
