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
import { useTranslation } from 'react-i18next';
import type { DebtRecord } from '../../api/nasiya.api';
import { nasiyaApi } from '../../api/nasiya.api';
import { formatUZS } from '../../utils/currency';
import { extractErrorMessage } from '../../utils/error';
import DebtSummary from './DebtSummary';
import QuickFillButtons from './QuickFillButtons';

interface Props {
  debt: DebtRecord | null;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function PayModal({ debt, visible, onClose, onSuccess }: Props) {
  const { t } = useTranslation();
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && debt) {
      setAmount(String(Math.round(Number(debt.remaining))));
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
      await nasiyaApi.pay(debt.id, parsed);
      Alert.alert('✅', t('nasiya.paySuccess'));
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
              <Text style={styles.title}>{t('nasiya.payTitle')}</Text>

              <DebtSummary debt={debt} />

              <Text style={styles.inputLabel}>{t('nasiya.payAmountLabel')}</Text>
              <TextInput
                style={styles.input}
                value={amount}
                onChangeText={setAmount}
                placeholder={t('nasiya.payAmountPlaceholder')}
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
                  <Text style={styles.cancelBtnText}>{t('nasiya.payCancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmBtn, loading && styles.btnDisabled]}
                  onPress={handleConfirm}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.confirmBtnText}>{t('nasiya.payConfirm')}</Text>
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
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  kav: { width: '100%' },
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
  title: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 16 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: {
    borderWidth: 2,
    borderColor: '#6366F1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    backgroundColor: '#FAFAFA',
    marginBottom: 14,
  },
  actions: { flexDirection: 'row', gap: 12 },
  cancelBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600', color: '#6B7280' },
  confirmBtn: {
    flex: 2,
    backgroundColor: '#6366F1',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: { opacity: 0.6 },
  confirmBtnText: { fontSize: 15, fontWeight: '700', color: '#FFFFFF' },
});
