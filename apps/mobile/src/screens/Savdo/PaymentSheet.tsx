import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';

import { type PaymentMethod, type CartItem, isOnlineMethod } from './PaymentSheetTypes';
import PaymentSummaryCard from './PaymentSummaryCard';
import PaymentMethodPicker from './PaymentMethodPicker';
import PaymentInputBlock from './PaymentInputBlock';
import LoyaltySection from './LoyaltySection';
import { useScreenProtection } from '../../hooks/useScreenProtection';

// ─── Backward-compat re-exports ────────────────────────
export type { PaymentMethod, CartItem } from './PaymentSheetTypes';

// ─── Props ─────────────────────────────────────────────
interface Props {
  readonly visible: boolean;
  readonly cart: CartItem[];
  /** Full cart total (pre-discount). Loyalty earn/redeem math runs on this. */
  readonly total: number;
  /** Loyalty redeem discount in UZS. Payable = total - discountAmount. */
  readonly discountAmount?: number;
  /** UZS value of 1 loyalty point — forwarded to LoyaltySection for display. */
  readonly redeemRate?: number;
  readonly onClose: () => void;
  readonly onConfirm: (method: PaymentMethod, received: number) => Promise<void>;
  readonly submitting: boolean;
  readonly onRemoveItem?: (productId: string) => void;
  readonly customerId?: string | null;
  readonly redeemPoints?: number;
  readonly onRedeemPointsChange?: (points: number) => void;
  readonly onSelectCustomer?: () => void;
}

// ─── Component ─────────────────────────────────────────
export default function PaymentSheet({
  visible,
  cart,
  total,
  discountAmount,
  redeemRate,
  onClose,
  onConfirm,
  submitting,
  onRemoveItem,
  customerId,
  redeemPoints,
  onRedeemPointsChange,
  onSelectCustomer,
}: Props) {
  useScreenProtection();
  const { t } = useTranslation();
  const [method, setMethod]       = useState<PaymentMethod>('NAQD');
  const [split, setSplit]         = useState(false);
  const [received, setReceived]   = useState('');
  const [splitCard, setSplitCard] = useState('');
  // Synchronous double-submit latch: closes the same-frame double-tap window
  // that the prop `submitting` (=orderLoading) cannot, since it only flips
  // after the parent re-renders. Resets in handleConfirm's finally.
  const inFlightRef = useRef(false);
  // Tracks the sheet's previous-render visibility so the reset effect fires
  // ONLY on the open transition (false -> true), not on every payable change
  // while the sheet stays open (e.g. cashier removes a non-last cart item).
  const prevVisibleRef = useRef(false);

  // Amount the cashier actually collects after loyalty redeem discount.
  // Loyalty earn/redeem math stays on the full `total`; only cash/card/change use payable.
  const payable = Math.max(0, total - (discountAmount ?? 0));

  useEffect(() => {
    // Reset only on the open transition. payable is read here to seed the
    // initial received amount, so it stays in deps (exhaustive-deps clean);
    // the prevVisibleRef guard makes a payable-only re-run a no-op.
    if (visible && !prevVisibleRef.current) {
      setMethod('NAQD');
      setSplit(false);
      setReceived(String(payable));
      setSplitCard('');
    }
    prevVisibleRef.current = visible;
  }, [visible, payable]);

  const online      = isOnlineMethod(method);
  const receivedNum = parseFloat(received.replace(/\s/g, '')) || 0;
  const change      = method === 'NAQD' && !split ? receivedNum - payable : 0;
  const canConfirm  = online || method !== 'NAQD' || receivedNum >= payable;

  const handleConfirm = async () => {
    if (!canConfirm || submitting || inFlightRef.current) return;
    inFlightRef.current = true;
    try {
      // Success/close is decided solely by the parent (closePayment()).
      // No local "confirmed" UI — the sheet only hides on a genuine success/safe handoff.
      await onConfirm(method, receivedNum);
    } finally {
      inFlightRef.current = false;
    }
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

          <>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{t('savdo.payment')}</Text>
                <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
                  <Ionicons name="close" size={18} color="#6B7280" />
                </TouchableOpacity>
              </View>

              {/* Customer badge or select button */}
              {customerId ? (
                <View style={styles.customerBadge}>
                  <Ionicons name="person-circle-outline" size={20} color="#6366F1" />
                  <Text style={styles.customerName}>{t('savdo.customerSelected')}</Text>
                  {onSelectCustomer && (
                    <TouchableOpacity onPress={onSelectCustomer}>
                      <Text style={styles.changeBtn}>{t('savdo.changeCustomer')}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ) : onSelectCustomer ? (
                <TouchableOpacity style={styles.selectCustomerBtn} onPress={onSelectCustomer}>
                  <Ionicons name="person-add-outline" size={18} color="#6366F1" />
                  <Text style={styles.selectCustomerText}>{t('savdo.selectCustomer')}</Text>
                </TouchableOpacity>
              ) : null}

              {/* Order summary — shows the payable (post-discount) total */}
              <PaymentSummaryCard
                cart={cart}
                total={payable}
                onRemoveItem={onRemoveItem}
              />

              {/* Payment method picker */}
              <PaymentMethodPicker method={method} onSelect={setMethod} />

              {/* Loyalty section — orderTotal stays FULL (earn/redeem math is pre-discount) */}
              {customerId && (
                <LoyaltySection
                  customerId={customerId}
                  orderTotal={total}
                  redeemRate={redeemRate}
                  discountAmount={discountAmount}
                  redeemPoints={redeemPoints ?? 0}
                  onRedeemPointsChange={onRedeemPointsChange ?? (() => {})}
                />
              )}

              {/* Split toggle + cash/card inputs (hidden for online methods) */}
              {online ? (
                <View style={styles.onlineInfo}>
                  <Ionicons name="globe-outline" size={20} color="#6B7280" />
                  <Text style={styles.onlineInfoText}>
                    {t('savdo.onlinePaymentHint')}
                  </Text>
                </View>
              ) : (
                <PaymentInputBlock
                  split={split}
                  method={method}
                  received={received}
                  splitCard={splitCard}
                  total={payable}
                  change={change}
                  receivedNum={receivedNum}
                  onReceivedChange={setReceived}
                  onSplitCardChange={setSplitCard}
                  onSplitToggle={setSplit}
                />
              )}
            </ScrollView>

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmBtn, (!canConfirm || submitting) && styles.confirmBtnDisabled]}
              onPress={handleConfirm}
              disabled={!canConfirm || submitting}
              activeOpacity={0.85}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <>
                  <Ionicons name={online ? 'open-outline' : 'checkmark-circle-outline'} size={20} color="#FFF" />
                  <Text style={styles.confirmText}>
                    {online ? t('savdo.goToPayment') : t('savdo.confirmSale')}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </>
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
  onlineInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  onlineInfoText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    flex: 1,
  },
  customerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
  },
  customerName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#4338CA',
  },
  changeBtn: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6366F1',
  },
  selectCustomerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#C7D2FE',
    borderStyle: 'dashed',
    borderRadius: 12,
    paddingVertical: 12,
    marginBottom: 12,
  },
  selectCustomerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366F1',
  },
});
