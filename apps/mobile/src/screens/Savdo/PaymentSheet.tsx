import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { type PaymentMethod, type CartItem } from './PaymentSheetTypes';
import PaymentSummaryCard from './PaymentSummaryCard';
import PaymentMethodPicker from './PaymentMethodPicker';
import PaymentInputBlock from './PaymentInputBlock';
import PaymentSuccessView from './PaymentSuccessView';

// ─── Backward-compat re-exports ────────────────────────
export type { PaymentMethod, CartItem } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly visible: boolean;
  readonly cart: CartItem[];
  readonly total: number;
  readonly onClose: () => void;
  readonly onConfirm: (method: PaymentMethod, received: number) => void;
  readonly onRemoveItem?: (productId: string) => void;
}

// ─── Component ─────────────────────────────────────────
export default function PaymentSheet({
  visible,
  cart,
  total,
  onClose,
  onConfirm,
  onRemoveItem,
}: Props) {
  const [method, setMethod]       = useState<PaymentMethod>('NAQD');
  const [split, setSplit]         = useState(false);
  const [received, setReceived]   = useState('');
  const [splitCard, setSplitCard] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (visible) {
      setMethod('NAQD');
      setSplit(false);
      setReceived(String(total));
      setSplitCard('');
      setConfirmed(false);
    }
  }, [visible, total]);

  const receivedNum = parseFloat(received.replace(/\s/g, '')) || 0;
  const change      = method === 'NAQD' && !split ? receivedNum - total : 0;
  const canConfirm  = method !== 'NAQD' || receivedNum >= total;

  const handleConfirm = () => {
    if (!canConfirm) return;
    setConfirmed(true);
    onConfirm(method, receivedNum);
  };

  const handleDismiss = () => {
    setConfirmed(false);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          <View style={styles.handle} />

          {confirmed ? (
            <PaymentSuccessView
              method={method}
              total={total}
              onDismiss={handleDismiss}
            />
          ) : (
            <>
              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.headerTitle}>To'lov</Text>
                  <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>

                {/* Order summary */}
                <PaymentSummaryCard
                  cart={cart}
                  total={total}
                  onRemoveItem={onRemoveItem}
                />

                {/* Payment method picker */}
                <PaymentMethodPicker method={method} onSelect={setMethod} />

                {/* Split toggle + cash/card inputs */}
                <PaymentInputBlock
                  split={split}
                  method={method}
                  received={received}
                  splitCard={splitCard}
                  total={total}
                  change={change}
                  receivedNum={receivedNum}
                  onReceivedChange={setReceived}
                  onSplitCardChange={setSplitCard}
                  onSplitToggle={setSplit}
                />
              </ScrollView>

              {/* Confirm */}
              <TouchableOpacity
                style={[styles.confirmBtn, !canConfirm && styles.confirmBtnDisabled]}
                onPress={handleConfirm}
                activeOpacity={0.85}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
                <Text style={styles.confirmText}>Savdoni yakunlash</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Styles ────────────────────────────────────────────
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
    maxHeight: '75%',
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
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
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    height: 54,
    gap: 8,
    marginTop: 16,
    shadowColor: '#2563EB',
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
